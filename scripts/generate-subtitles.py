#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
德语播客字幕生成器
使用Whisper生成字幕，然后分割成句子练习
"""

import os
import sys
import json
import re
import shutil
import urllib.request
import urllib.error
from pathlib import Path
from datetime import timedelta, datetime

# 设置控制台编码为UTF-8（Windows）
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# 设置FFmpeg路径（Windows）
FFMPEG_PATH = r"C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe"
if os.path.exists(FFMPEG_PATH):
    os.environ["PATH"] = os.path.dirname(FFMPEG_PATH) + os.pathsep + os.environ.get("PATH", "")
    print(f"Using FFmpeg: {FFMPEG_PATH}")
else:
    print("WARNING: FFmpeg not found at", FFMPEG_PATH)
    print("Please install FFmpeg or update the path in this script")

# Whisper模型（可通过环境变量覆盖）
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "medium")

# 项目根目录与练习集目录
PROJECT_ROOT = Path(__file__).resolve().parent.parent
PRACTICE_SETS_DIR = PROJECT_ROOT / 'practice-sets'

# 语言映射文件（可通过环境变量覆盖）
LANGUAGE_MAP_FILE = os.getenv(
    "LANGUAGE_MAP_FILE",
    str(PRACTICE_SETS_DIR / '.language-map.json')
)

# 默认语言（可通过环境变量覆盖）
DEFAULT_LANGUAGE = os.getenv("DEFAULT_LANGUAGE", "de")

# 仅处理指定语言（可通过环境变量覆盖，空表示全部）
LANGUAGE_FILTER = os.getenv("LANGUAGE_FILTER", "").strip().lower()

# 每个音源处理最新N个（可通过环境变量覆盖，0 表示不限制）
PER_SOURCE_LIMIT = int(os.getenv("PER_SOURCE_LIMIT", "0"))

# 是否跳过已生成的练习集
SKIP_EXISTING = os.getenv("SKIP_EXISTING", "1") != "0"

# 是否删除来源音频（生成练习集后）
DELETE_SOURCE_AUDIO = os.getenv("DELETE_SOURCE_AUDIO", "1") != "0"

# 翻译设置（可通过环境变量覆盖）
ENABLE_TRANSLATION = os.getenv("ENABLE_TRANSLATION", "1") != "0"
TRANSLATE_TARGET = os.getenv("TRANSLATE_TARGET", "zh")
TRANSLATE_API_URL = os.getenv("TRANSLATE_API_URL", "http://localhost:5000/translate")
TRANSLATE_TIMEOUT = float(os.getenv("TRANSLATE_TIMEOUT", "2.5"))

_translation_cache = {}

def translate_text(text, source_lang, target_lang):
    if not ENABLE_TRANSLATION:
        return ""
    if not text:
        return ""
    key = (text, source_lang, target_lang)
    if key in _translation_cache:
        return _translation_cache[key]

    payload = {
        "q": text,
        "source": source_lang,
        "target": target_lang,
        "format": "text"
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            TRANSLATE_API_URL,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=TRANSLATE_TIMEOUT) as resp:
            raw = resp.read().decode("utf-8")
            result = json.loads(raw)
            translated = result.get("translatedText", "") if isinstance(result, dict) else ""
            _translation_cache[key] = translated
            return translated
    except Exception:
        _translation_cache[key] = ""
        return ""

def parse_srt_time(time_str):
    """
    解析SRT时间戳格式: 00:00:05,420 -> 秒数
    """
    hours, minutes, seconds_ms = time_str.split(':')
    seconds, milliseconds = seconds_ms.split(',')
    total_seconds = int(hours) * 3600 + int(minutes) * 60 + int(seconds) + int(milliseconds) / 1000
    return total_seconds

def format_srt_time(seconds):
    """
    将秒数转换为SRT时间格式
    """
    td = timedelta(seconds=seconds)
    hours, remainder = divmod(td.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    milliseconds = td.microseconds // 1000
    return f"{hours:02d}:{minutes:02d}:{seconds:02d},{milliseconds:03d}"

def load_language_map():
    if os.path.exists(LANGUAGE_MAP_FILE):
        try:
            with open(LANGUAGE_MAP_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
        except Exception:
            return {}
    return {}

def infer_language(source_name, lang_map):
    if not source_name:
        return lang_map.get('default', DEFAULT_LANGUAGE)

    if source_name in lang_map:
        return lang_map[source_name]

    lower = source_name.lower()
    if 'english' in lower:
        return 'en'
    if 'deutsch' in lower or 'german' in lower:
        return 'de'

    return lang_map.get('default', DEFAULT_LANGUAGE)

def generate_subtitle(audio_file_path, output_dir, model, language):
    """
    使用Whisper生成字幕文件（使用Python API，避免PATH问题）
    """
    print(f"Processing: {audio_file_path}")

    try:
        # 模型已在外部加载
        # 转录音频
        print("Transcribing audio...")
        result = model.transcribe(
            audio_file_path,
            language=language,
            verbose=False
        )

        # 生成SRT文件
        audio_name = Path(audio_file_path).stem
        srt_file = os.path.join(output_dir, f"{audio_name}.srt")

        with open(srt_file, 'w', encoding='utf-8') as f:
            # 写入SRT格式
            for i, segment in enumerate(result['segments'], 1):
                # SRT序号
                f.write(f"{i}\n")

                # 时间戳
                start_time = format_timestamp(segment['start'])
                end_time = format_timestamp(segment['end'])
                f.write(f"{start_time} --> {end_time}\n")

                # 德语文本
                f.write(f"{segment['text'].strip()}\n")
                f.write("\n")

        print(f"Subtitle generated: {srt_file}")
        print(f"Total segments: {len(result['segments'])}")
        return True

    except ImportError:
        print("ERROR: Whisper not installed")
        print("Please run: pip install openai-whisper")
        return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def format_timestamp(seconds):
    """
    将秒数转换为SRT时间戳格式: 00:00:05,420
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def parse_srt_to_sentences(srt_file_path):
    """
    解析SRT文件，提取句子和时间戳
    """
    sentences = []

    with open(srt_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_sentence = None
    for line in lines:
        line = line.strip()
        if not line:
            if current_sentence:
                sentences.append(current_sentence)
                current_sentence = None
            continue

        # 检查是否是时间戳行
        if '-->' in line:
            parts = line.split('-->')
            start_time = parse_srt_time(parts[0].strip())
            end_time = parse_srt_time(parts[1].strip().split()[0])  # 去除可能的标签

            if not current_sentence:
                current_sentence = {
                    'start': start_time,
                    'end': end_time,
                    'text': ''
                }
            else:
                current_sentence['start'] = start_time
                current_sentence['end'] = end_time
        elif line.isdigit() and current_sentence is None:
            # 序号行，跳过
            pass
        elif current_sentence is not None:
            # 字幕文本
            if current_sentence['text']:
                current_sentence['text'] += ' ' + line
            else:
                current_sentence['text'] = line

    if current_sentence:
        sentences.append(current_sentence)

    return sentences

def extract_date_from_name(name):
    """
    从文件名中提取日期，返回 YYYY-MM-DD 或 None
    """
    patterns = [
        r'(?P<y>20\d{2})[.\-_]?(?P<m>\d{2})[.\-_]?(?P<d>\d{2})',  # YYYYMMDD / YYYY-MM-DD
        r'(?P<d>\d{2})[.\-_](?P<m>\d{2})[.\-_](?P<y>20\d{2})',    # DD.MM.YYYY
    ]
    for pat in patterns:
        m = re.search(pat, name)
        if not m:
            continue
        try:
            y = int(m.group('y'))
            mth = int(m.group('m'))
            d = int(m.group('d'))
            return f"{y:04d}-{mth:02d}-{d:02d}"
        except Exception:
            continue
    return None

def build_title(audio_file, source_name):
    base = Path(audio_file).stem
    date_str = extract_date_from_name(base)
    clean = re.sub(r'[_\-]+', ' ', base).strip()
    if date_str:
        return f"{source_name} {date_str}"
    return f"{source_name} {clean}"

def create_practice_set(audio_file, srt_file, output_dir, source_name, language):
    """
    创建练习集（分割后的句子）
    """
    # 解析字幕
    sentences = parse_srt_to_sentences(srt_file)

    # 创建练习集
    audio_file_name = os.path.basename(audio_file)
    title = build_title(audio_file_name, source_name)
    date_str = extract_date_from_name(audio_file_name)

    practice_set = {
        'audioFile': audio_file_name,
        'title': title,
        'date': date_str or '',
        'source': source_name,
        'language': language,
        'createdAt': datetime.now().isoformat(),
        'totalSentences': len(sentences),
        'sentences': []
    }

    for idx, sentence in enumerate(sentences, 1):
        text = sentence['text'].strip()
        translation = translate_text(text, language, TRANSLATE_TARGET)
        practice_set['sentences'].append({
            'id': idx,
            'start': sentence['start'],
            'end': sentence['end'],
            'duration': sentence['end'] - sentence['start'],
            'german': text,
            'translation': translation,
            'completed': False,
            'attempts': 0
        })

    # 保存为JSON
    audio_name = Path(audio_file).stem
    json_file = os.path.join(output_dir, f'{audio_name}_practice.json')

    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(practice_set, f, ensure_ascii=False, indent=2)

    print(f"✅ 练习集已创建: {json_file}")
    print(f"   包含 {len(sentences)} 个句子")

    return practice_set

def process_audio_file(audio_file_path, output_base_dir, source_name, model, language):
    """
    处理单个音频文件：生成字幕 → 创建练习集
    """
    audio_path = Path(audio_file_path)
    output_dir = os.path.join(output_base_dir, audio_path.stem)

    # 创建输出目录
    os.makedirs(output_dir, exist_ok=True)

    # 跳过已存在的练习集
    if SKIP_EXISTING:
        existing_json = os.path.join(output_dir, f'{audio_path.stem}_practice.json')
        if os.path.exists(existing_json):
            print(f"Skip (exists): {audio_path.name}")
            return None

    if ENABLE_TRANSLATION:
        print(f"翻译已开启: {language} -> {TRANSLATE_TARGET}")
        print(f"翻译接口: {TRANSLATE_API_URL}")

    # 步骤1: 生成字幕
    if not generate_subtitle(audio_file_path, output_dir, model, language):
        return None

    # 步骤2: 创建练习集
    srt_file = os.path.join(output_dir, f'{audio_path.stem}.srt')
    if os.path.exists(srt_file):
        practice_set = create_practice_set(audio_file_path, srt_file, output_dir, source_name, language)
        # 复制音频到练习集目录，保证可播放
        try:
            dest_audio = os.path.join(output_dir, os.path.basename(audio_file_path))
            if not os.path.exists(dest_audio):
                shutil.copy2(audio_file_path, dest_audio)
        except Exception as e:
            print(f"⚠️ 复制音频失败: {e}")
            return None

        # 删除来源音频，保持下载目录清空
        if DELETE_SOURCE_AUDIO:
            try:
                os.remove(audio_file_path)
            except Exception as e:
                print(f"⚠️ 删除来源音频失败: {e}")
        return practice_set
    else:
        print(f"❌ 字幕文件未生成: {srt_file}")
        return None

def batch_process_latest_audio(gpodder_downloads_dir, output_base_dir, limit_per_source=1):
    """
    批量处理最新的N个音频文件
    """
    print("="*60)
    print("德语播客字幕生成器")
    print("="*60)
    print()

    # 加载 Whisper 模型一次
    try:
        import whisper
        try:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
        except Exception:
            device = "cpu"
        print(f"Loading Whisper model ({WHISPER_MODEL}) on {device}...")
        model = whisper.load_model(WHISPER_MODEL, device=device)
    except ImportError:
        print("ERROR: Whisper not installed")
        print("Please run: pip install openai-whisper")
        return []

    # 按音源分组
    sources = {}
    for root, dirs, files in os.walk(gpodder_downloads_dir):
        for file in files:
            if file.endswith(('.mp3', '.m4a', '.wav')):
                file_path = os.path.join(root, file)
                mtime = os.path.getmtime(file_path)
                rel = os.path.relpath(root, gpodder_downloads_dir)
                source_name = rel.split(os.sep)[0] if rel != '.' else 'Unknown'
                sources.setdefault(source_name, []).append((mtime, file_path))

    total_audio = sum(len(v) for v in sources.values())
    print(f"找到 {total_audio} 个音频文件")
    print(f"每个音源处理最新 {limit_per_source} 个")
    print()

    if total_audio == 0:
        return [], 0

    lang_map = load_language_map()
    practice_sets = []
    unknown_sources = []
    for source_name in sources.keys():
        if source_name not in lang_map:
            unknown_sources.append(source_name)

    if unknown_sources:
        print("❌ 未分类音源，无法继续生成题库：")
        for name in unknown_sources:
            print(f"   - {name}")
        print("请在 practice-sets/.language-map.json 中手动设置语言后再运行。")
        return [], total_audio
    for source_name, items in sources.items():
        items.sort(reverse=True)
        if limit_per_source > 0:
            latest_items = items[:limit_per_source]
        else:
            latest_items = items
        if not latest_items:
            continue
        language = lang_map.get(source_name, lang_map.get('default', DEFAULT_LANGUAGE))
        if LANGUAGE_FILTER and language != LANGUAGE_FILTER:
            continue
        print(f"Source: {source_name} ({len(latest_items)} files, lang={language})")

        for idx, (mtime, audio_path) in enumerate(latest_items, 1):
            print(f"  [{idx}/{len(latest_items)}] {os.path.basename(audio_path)}")
            practice_set = process_audio_file(audio_path, output_base_dir, source_name, model, language)
            if practice_set:
                practice_sets.append(practice_set)
        print()

    return practice_sets, total_audio

if __name__ == '__main__':
    # 配置
    GPODDER_DOWNLOADS = r'C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads'
    OUTPUT_DIR = str(PRACTICE_SETS_DIR)

    # 每个音源处理最新N个音频
    practice_sets, total_audio = batch_process_latest_audio(GPODDER_DOWNLOADS, OUTPUT_DIR, limit_per_source=PER_SOURCE_LIMIT)

    if practice_sets:
        print("="*60)
        print(f"✅ 成功处理 {len(practice_sets)} 个音频文件")
        print(f"📁 输出目录: {OUTPUT_DIR}")
        print("="*60)
    else:
        if total_audio == 0:
            print("ℹ️ 没有新音频，跳过生成")
            sys.exit(0)
        print("❌ 没有成功处理任何文件")
        sys.exit(1)
