#!/usr/bin/env python3
"""
DW慢速新闻字幕下载器
自动下载音频和对应的文字稿
"""

import os
import re
import json
import requests
from bs4 import BeautifulSoup
from pathlib import Path

# 配置
GPODDER_DOWNLOADS = r"C:\Users\ZHAO JUNJIE\Documents\gPodder\Downloads"
DW_BASE_URL = "https://learngerman.dw.com/de/langsam-gesprochene-nachrichten"

def download_transcript(episode_title, audio_dir):
    """
    为DW音频下载对应的文字稿
    """
    print(f"正在处理: {episode_title}")

    # DW的慢速新闻页面URL模式
    # 需要从音频文件名或元数据中提取日期
    # 格式通常是: LGN_20250216.mp3

    # 尝试从标题中提取日期
    date_match = re.search(r'(\d{4})[-_]?(\d{2})[-_]?(\d{2})', episode_title)

    if date_match:
        year, month, day = date_match.groups()
        date_str = f"{year}{month}{day}"
        transcript_url = f"{DW_BASE_URL}/a-{date_str}"

        print(f"  尝试下载文字稿: {transcript_url}")

        try:
            response = requests.get(transcript_url, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')

                # 查找文字稿内容（通常在特定的class或标签中）
                transcript_div = soup.find('div', class_='text') or soup.find('article')

                if transcript_div:
                    transcript_text = transcript_div.get_text(strip=True)

                    # 保存文字稿
                    transcript_file = os.path.join(audio_dir, f"{episode_title}.txt")

                    with open(transcript_file, 'w', encoding='utf-8') as f:
                        f.write(f"DW慢速新闻 - {episode_title}\n")
                        f.write("="*50 + "\n\n")
                        f.write(transcript_text)

                    print(f"  ✅ 已保存文字稿: {transcript_file}")
                    return True
                else:
                    print(f"  ⚠️  未找到文字稿内容")
                    return False
        except Exception as e:
            print(f"  ❌ 下载失败: {e}")
            return False
    else:
        print(f"  ⚠️  无法从标题提取日期")

    return False


def scan_dw_directory():
    """
    扫描DW下载目录，为所有音频下载字幕
    """
    dw_dir = os.path.join(GPODDER_DOWNLOADS, "Langsam Gesprochene Nachrichten _ Audios _ DW Deutsch lernen")

    if not os.path.exists(dw_dir):
        print(f"❌ DW目录不存在: {dw_dir}")
        return

    print(f"📂 扫描目录: {dw_dir}\n")

    # 查找所有音频文件
    audio_files = list(Path(dw_dir).glob("*.mp3")) + list(Path(dw_dir).glob("*.m4a"))

    print(f"找到 {len(audio_files)} 个音频文件\n")

    for audio_file in audio_files:
        episode_title = audio_file.stem  # 文件名不含扩展名

        # 检查是否已有字幕文件
        transcript_file = audio_file.with_suffix('.txt')

        if transcript_file.exists():
            print(f"⏭️  跳过（已有字幕）: {episode_title}")
            continue

        # 下载字幕
        download_transcript(episode_title, dw_dir)

    print("\n✅ 处理完成!")


if __name__ == "__main__":
    scan_dw_directory()
