import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new Response('No URL provided', { status: 400 });
  }

  try {
    // 发送请求下载图片
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer' // 保持arraybuffer以支持大多数图像格式
    });

    // 尝试从响应中获取内容类型
    const contentType = response.headers['content-type'];

    // 根据内容类型处理响应数据
    let responseData;
    let headers = {};

    if (contentType && contentType.includes('image/svg+xml')) {
      // 对于SVG，转换响应为文本
      responseData = Buffer.from(response.data, 'binary').toString('utf-8');
      headers = {
        'Content-Type': 'image/svg+xml'
      };
    } else {
      // 对于非SVG图像，使用原始arraybuffer数据
      responseData = response.data;
      headers = {
        'Content-Type': contentType || 'application/octet-stream',
        'Content-Length': response.headers['content-length'].toString()
      };
    }

    return new Response(responseData, {
      headers: headers
    });
  } catch (error) {
    return new Response('Error fetching image', {
      status: 500
    });
  }
}
