/**
 * 媒体解析代理服务器
 * 解决微信小程序域名白名单问题
 * 
 * 用法：
 * 1. 启动 media-parser 后端服务
 * 2. 配置 .env 文件中的 MEDIA_PARSER_URL
 * 3. 启动本代理服务
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// media-parser 后端地址
const MEDIA_PARSER_URL = process.env.MEDIA_PARSER_URL || 'http://localhost:8051';

// 是否使用模拟数据（用于本地预览）
const USE_MOCK = process.env.USE_MOCK === 'true' || false;

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), mock: USE_MOCK });
});

/**
 * 解析视频链接
 * POST /api/parse
 * Body: { "text": "https://v.douyin.com/xxx" }
 */
app.post('/api/parse', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        retcode: 400,
        retdesc: '请提供有效的链接',
        data: null,
        succ: false
      });
    }

    console.log(`[解析请求] 链接: ${text}`);

    // 使用模拟数据
    if (USE_MOCK) {
      console.log('[使用模拟数据]');
      const mockData = generateMockData(text);
      return res.json(mockData);
    }

    // 调用 media-parser 后端
    const response = await axios.post(`${MEDIA_PARSER_URL}/api/parse`, { text }, {
      timeout: 60000,  // 增加超时时间到 60 秒
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`[解析成功] 平台: ${response.data?.data?.platform || '未知'}`);

    // 检查是否解析出视频
    const result = response.data;
    if (result.succ && result.data) {
      if (!result.data.video_url && (!result.data.image_list || result.data.image_list.length === 0)) {
        // 没有解析出视频，返回更友好的错误信息
        return res.json({
          retcode: 404,
          retdesc: '未能获取到视频内容，请检查链接是否正确或视频是否已删除',
          data: null,
          succ: false
        });
      }
    }

    // 返回解析结果
    res.json(result);
  } catch (error) {
    console.error('[解析失败]', error.message);
    
    if (error.response) {
      // 后端返回了错误响应
      res.status(error.response.status).json(error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      res.status(504).json({
        retcode: 504,
        retdesc: '解析超时，请稍后重试',
        data: null,
        succ: false
      });
    } else {
      // 其他错误
      res.status(500).json({
        retcode: 500,
        retdesc: '服务暂时不可用，请稍后重试',
        data: null,
        succ: false
      });
    }
  }
});

/**
 * 生成模拟数据
 */
function generateMockData(url) {
  // 从 URL 中提取一些信息
  const isDouyin = url.includes('douyin.com') || url.includes('v.douyin.com');
  const isKuaishou = url.includes('kuaishou.com') || url.includes('v.kuaishou.com');
  const isXiaohongshu = url.includes('xhslink.com') || url.includes('xiaohongshu.com');
  
  let platform = '未知';
  if (isDouyin) platform = '抖音';
  else if (isKuaishou) platform = '快手';
  else if (isXiaohongshu) platform = '小红书';
  else platform = '抖音';

  const mockVideos = [
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  ];

  const mockImages = [
    'https://picsum.photos/400/600?random=1',
    'https://picsum.photos/400/600?random=2',
    'https://picsum.photos/400/600?random=3'
  ];

  return {
    retcode: 200,
    retdesc: '成功',
    data: {
      video_id: 'mock_' + Date.now(),
      platform: platform,
      title: '这是一个模拟的视频标题 - ' + platform + '视频示例',
      video_url: mockVideos[Math.floor(Math.random() * mockVideos.length)],
      audio_url: null,
      cover_url: 'https://picsum.photos/400/300?random=' + Date.now(),
      author: '模拟用户_' + Math.floor(Math.random() * 1000),
      image_list: isXiaohongshu ? mockImages : []
    },
    succ: true
  };
}

/**
 * 获取支持的平台列表
 */
app.get('/api/platforms', async (req, res) => {
  try {
    // 返回支持的平台列表
    res.json({
      retcode: 200,
      retdesc: '成功',
      data: {
        platforms: [
          { name: '抖音', id: 'douyin', icon: '🎵' },
          { name: 'TikTok', id: 'tiktok', icon: '🎵' },
          { name: '快手', id: 'kuaishou', icon: '📹' },
          { name: '小红书', id: 'xiaohongshu', icon: '📕' },
          { name: 'B站', id: 'bilibili', icon: '📺' },
          { name: '微博', id: 'weibo', icon: '💬' },
          { name: '西瓜视频', id: 'ixigua', icon: '🍉' },
          { name: '皮皮虾', id: 'pipixia', icon: '🦐' }
        ]
      },
      succ: true
    });
  } catch (error) {
    res.status(500).json({
      retcode: 500,
      retdesc: '获取平台列表失败',
      data: null,
      succ: false
    });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
=====================================
  媒体解析代理服务器已启动
  端口: ${PORT}
  后端: ${MEDIA_PARSER_URL}
=====================================
  `);
});
