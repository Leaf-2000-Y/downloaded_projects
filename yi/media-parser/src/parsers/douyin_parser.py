# ======= 环境配置开始：将项目根目录添加到系统路径，当前脚本可测试 =======

from pathlib import Path
import sys
# 获取当前文件的绝对路径，并定位至向上推两级的项目根目录
root_dir = str(Path(__file__).resolve().parents[2])
# 如果根目录不在系统搜索路径中，则动态添加，以确保跨模块导入（Import）正常工作
if root_dir not in sys.path:
    sys.path.append(root_dir)

# ========================= 环境配置结束 =========================


import json
import urllib3
import warnings
import copy
from utils.web_fetcher import UrlParser
from utils.douyin_utils.bogus_sign_utils import CommonUtils
from configs.logging_config import get_logger
logger = get_logger(__name__)
from src.parsers.base_parser import BaseParser

warnings.filterwarnings("ignore", category=urllib3.exceptions.InsecureRequestWarning)


class DouyinParser(BaseParser):
    def __init__(self, real_url):
        super().__init__(real_url)
        self.common_utils = CommonUtils()
        self.headers = {
            'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
            'Accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'User-Agent': self.common_utils.user_agent,
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        }
        self.ms_token = self.common_utils.get_ms_token()
        self.ttwid = '1%7CvDWCB8tYdKPbdOlqwNTkDPhizBaV9i91KjYLKJbqurg%7C1723536402%7C314e63000decb79f46b8ff255560b29f4d8c57352dad465b41977db4830b4c7e'
        self.webid = '7307457174287205926'
        self.fetch_html_content()
        self.aweme_id = UrlParser.get_video_id(self.real_url)
        self.data = self.fetch_html_data()

    _TTWID_CACHE = None

    def _get_ttwid(self):
        """
        动态获取 ttwid，每次请求都获取新的 ttwid 以避免 403 错误
        """
        try:
            url = "https://ttwid.bytedance.com/ttwid/union/register/"
            data = {
                "region": "cn",
                "aid": 6383,
                "need_t": 1,
                "service": "www.douyin.com",
                "migrate_priority": 0,
                "cb_url_protocol": "https",
                "domain": ".douyin.com"
            }
            # 使用 instance session
            resp = self.session.post(url, data=json.dumps(data), timeout=10)
            ttwid = resp.cookies.get('ttwid')
            if ttwid:
                logger.info(f"获取到新的 ttwid: {ttwid[:20]}...")
                return ttwid
            else:
                logger.warning("未获取到 ttwid")
                return None
        except Exception as e:
            logger.warning(f"Failed to get dynamic ttwid: {e}")
            return None

    def fetch_html_data(self):
        # 每次请求都获取新的 ttwid 以避免 403 错误
        for attempt in range(3):
            ttwid = self._get_ttwid()
            if not ttwid:
                logger.warning("无法获取 ttwid，使用备用方案")
                # 尝试使用空 cookie
                ttwid = ""

            referer_url = f"https://www.douyin.com/video/{self.aweme_id}?previous_page=web_code_link"
            play_url = f"https://www.douyin.com/aweme/v1/web/aweme/detail/?device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id={self.aweme_id}&msToken={self.ms_token}"

            new_headers = copy.deepcopy(self.headers)
            new_headers['Referer'] = referer_url
            if ttwid:
                new_headers['Cookie'] = f"ttwid={ttwid}"

            try:
                abogus = self.common_utils.get_abogus(play_url, self.common_utils.user_agent)
                url = f"{play_url}&a_bogus={abogus}"
            except Exception as e:
                logger.error(f"生成 a_bogus 失败: {e}")
                # 不使用 a_bogus 重试
                url = play_url

            try:
                response = self.session.get(url, headers=new_headers, verify=False, timeout=10)
                logger.info(f"抖音 API 响应状态: {response.status_code}")

                if response.status_code == 200 and response.text:
                    data = response.json()
                    if data.get('aweme_detail'):
                        return data
                    else:
                        logger.warning(f"响应中没有 aweme_detail: {response.text[:200]}")
                        if attempt < 2:
                            continue
                        return None
                elif response.status_code == 403:
                    logger.warning(f"403 Forbidden，尝试 {attempt + 1}/3")
                    if attempt < 2:
                        import time
                        time.sleep(1)  # 等待 1 秒后重试
                        continue
                    return None
                else:
                    logger.warning(f"获取抖音视频详情失败: Status={response.status_code}")
                    if attempt < 2:
                        continue
                    return None
            except Exception as e:
                logger.error(f"请求抖音详情接口异常: {e}")
                if attempt < 2:
                    import time
                    time.sleep(1)
                    continue
                return None
        return None

    def get_real_video_url(self):
        try:
            data_dict = self.data
            if not data_dict or not data_dict.get('aweme_detail'):
                return None
            
            detail = data_dict.get('aweme_detail', {}) or {}
            video = detail.get('video', {}) or {}
            bit_rate = video.get('bit_rate', []) or []
            
            if not bit_rate:
                return None
                
            play_addr_list = bit_rate[0].get('play_addr', {}).get('url_list', []) or []
            if len(play_addr_list) < 3:
                return play_addr_list[0] if play_addr_list else None
                
            # play_addr_list[0]:主CDN节点; play_addr_list[1]:备用CDN节点; play_addr_list[2]:抖音官方的源站URL
            play_addr = play_addr_list[2]
            return play_addr
        except (KeyError, json.JSONDecodeError, TypeError) as e:
            logger.warning(f"Failed to parse video URL: {e}")
            return None

    def get_title_content(self):
        try:
            data_dict = self.data
            if not data_dict or not data_dict.get('aweme_detail'):
                return None
            title_content = data_dict['aweme_detail'].get('desc', '')
            return title_content
        except (KeyError, json.JSONDecodeError, TypeError) as e:
            logger.warning(f"Failed to parse title content: {e}")
            return None

    def get_cover_photo_url(self):
        try:
            data_dict = self.data
            if not data_dict:
                return None
            
            # 使用 or {} 确保 detail 不是 None
            detail = data_dict.get('aweme_detail') or {}
            
            # 1. 尝试获取视频动态封面
            video_cover = None
            video_data = detail.get('video') or {}
            if video_data and 'dynamic_cover' in video_data:
                url_list = video_data['dynamic_cover'].get('url_list') or []
                if url_list:
                    video_cover = url_list[0]
            
            # 2. 尝试获取图集封面 (如果视频封面不存在)
            images_cover = None
            images_list = detail.get('images') or []
            if images_list and len(images_list) > 0:
                first_img = images_list[0] or {}
                url_list = first_img.get('url_list') or []
                if url_list:
                    images_cover = url_list[0]
            
            # 3. 优先级逻辑：有视频封面优先用视频，否则用图集封面
            play_cover = video_cover or images_cover
            
            if not play_cover:
                logger.info("No cover URL found in both video and images.")
            
            return play_cover
            
        except Exception as e:
            logger.warning(f"Failed to parse cover URL: {e}")
            return None

    def get_audio_url(self):
        try:
            data_dict = self.data
            if not data_dict or not data_dict.get('aweme_detail'):
                return None
            detail = data_dict.get('aweme_detail') or {}
            music = detail.get('music') or {}
            play_url = music.get('play_url') or {}
            url_list = play_url.get('url_list') or []
            if url_list:
                return url_list[0]
            return None
        except (KeyError, json.JSONDecodeError, TypeError) as e:
            logger.warning(f"Failed to parse background music: {e}")
            return None

    def get_author_info(self):
        try:
            data_dict = self.data
            if not data_dict or not data_dict.get('aweme_detail'):
                return None
                
            author = (data_dict['aweme_detail'].get('author') or {})
            if not author:
                return None
                
            # 1. 抖音号逻辑：优先取 unique_id (自定义号)，没有则取 short_id
            # 2. 头像逻辑：安全取 url_list 的第一个元素
            avatar_thumb = author.get('avatar_thumb') or {}
            avatar_url_list = avatar_thumb.get('url_list') or [None]
            
            return {
                "nickname": author.get('nickname', ''),
                "author_id": author.get('unique_id') or author.get('short_id', ''),
                "avatar": avatar_url_list[0]
            }
        except Exception as e:
            logger.warning(f"Failed to parse author info: {e}")
            return None

    def get_image_list(self):
        """
        针对 aweme_type 68 的图文笔记，提取所有高清图片链接
        """
        try:
            data_dict = self.data
            if not data_dict or 'aweme_detail' not in data_dict:
                return []

            # 1. 抖音图文笔记的图片存储在 images 字段中
            images = data_dict['aweme_detail'].get('images') or []
            if not images:
                # 兜底：有些版本可能在 image_list 字段
                images = data_dict['aweme_detail'].get('image_list') or []

            image_urls = []
            for img in images:
                if not img:
                    continue
                # ⚠️ 注意：download_url_list 包含带水印的图片！
                # url_list 才是无水印的原始图片链接（已通过 f2 等主流项目验证）
                # url_list 中最后一个元素通常是最高质量的 CDN 链接
                urls = img.get('url_list')

                if urls and isinstance(urls, list) and len(urls) > 0:
                    # 优先取最后一个 URL（通常是最高质量的源站 CDN）
                    img_data = urls[-1]
                    # 检查是否有 livePhoto
                    if 'video' in img and 'play_addr' in img['video']:
                        live_urls = img['video']['play_addr'].get('url_list')
                        if live_urls and isinstance(live_urls, list) and len(live_urls) > 0:
                            img_data = {
                                'url': img_data,
                                'live_photo_url': live_urls[0]
                            }
                    image_urls.append(img_data)

            return image_urls

        except Exception as e:
            logger.warning(f"Failed to parse image list: {e}")
            return []


if __name__ == '__main__':
    real_url = 'https://www.douyin.com/note/7616399587141737704'
    dl = DouyinParser(real_url)
    print("-" * 30)
    print(f"作者信息：{dl.get_author_info()}")
    print(f"标题内容：{dl.get_title_content()[:30]}...")  # 仅打印前30字
    print(f"封面图片：{dl.get_cover_photo_url()}")
    print(f"视频链接：{dl.get_real_video_url()}")
    print(f"图片列表：{dl.get_image_list()}")
    print(f"音频链接：{dl.get_audio_url()}")
    print("-" * 30)

