from apis.news_api import fetch_trends as news_trends
from apis.youtube_api import fetch_trends as youtube_trends
from apis.tiktok_api import fetch_trends as tiktok_trends
from apis.twitter_api import fetch_trends as twitter_trends

__all__ = [
    'news_trends',
    'youtube_trends',
    'tiktok_trends',
    'twitter_trends'
]