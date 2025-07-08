import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    username: string;
    email: string;
  };
}

// MIME类型映射
const mimeToExtension: { [key: string]: string } = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg'
};

// 获取文件扩展名
const getImageExtension = (mimeType: string): string => {
  return mimeToExtension[mimeType] || 'png';
};

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads');
const avatarDir = path.join(uploadDir, 'avatars');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 头像专用存储配置
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    // 使用用户ID作为文件名前缀
    const user = (req as AuthRequest).user;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `avatar-${user?.id}-${timestamp}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'));
  }
};

// 头像专用文件过滤器
const avatarFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 只允许 JPEG 和 PNG
  if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('头像只支持 JPG 和 PNG 格式'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制（头像保持较小）
  }
});

// 上传头像
router.post('/avatar', authenticate, avatarUpload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 获取服务器基础URL
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const avatarUrl = `${baseUrl}/api/uploads/avatars/${req.file.filename}`;
    
    res.json({
      success: true,
      url: avatarUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: '头像上传失败' });
  }
});

// 上传单个图片
router.post('/image', authenticate, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    // 获取服务器基础URL
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const imageUrl = `${baseUrl}/api/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 上传 Base64 图片（用于粘贴上传）
router.post('/image-base64', authenticate, async (req: AuthRequest, res) => {
  try {
    const { imageData, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: '没有图片数据' });
    }

    // 解析 Base64 数据
    const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: '无效的图片数据格式' });
    }

    const imageType = matches[1];
    const base64Data = matches[2];
    
    // 获取正确的文件扩展名
    const extension = getImageExtension(`image/${imageType}`);
    
    // 生成文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let finalFilename;
    
    if (filename && filename !== 'undefined') {
      // 如果提供了文件名，使用它
      finalFilename = filename;
      // 确保有正确的扩展名
      if (!finalFilename.includes('.')) {
        finalFilename += `.${extension}`;
      }
    } else {
      // 否则生成一个新的文件名
      finalFilename = `image-${uniqueSuffix}.${extension}`;
    }
    
    const filePath = path.join(uploadDir, finalFilename);

    // 保存文件
    fs.writeFileSync(filePath, base64Data, 'base64');

    // 获取服务器基础URL
    const protocol = req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;
    const imageUrl = `${baseUrl}/api/uploads/${finalFilename}`;
    
    res.json({
      success: true,
      url: imageUrl,
      filename: finalFilename,
      size: Buffer.byteLength(base64Data, 'base64')
    });
  } catch (error) {
    console.error('Base64 upload error:', error);
    res.status(500).json({ error: '图片上传失败' });
  }
});

// 删除图片
router.delete('/image/:filename', authenticate, async (req: AuthRequest, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: '图片删除成功' });
    } else {
      res.status(404).json({ error: '图片不存在' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: '图片删除失败' });
  }
});

export default router;