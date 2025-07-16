import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    username: string;
    email: string;
  };
}

// 获取About信息 (公开访问)
router.get('/', async (req, res) => {
  try {
    const about = await prisma.about.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!about) {
       res.json({
        name: 'Blog Author',
        title: '一个不甘心一直写业务代码的程序员！！',
        description: `作为一名程序员，我不满足于日复一日的业务逻辑编写。我渴望探索技术的深度，追求代码的艺术性，致力于创造有意义的产品。

我相信技术不仅仅是工具，更是改变世界的力量。通过这个博客，我分享我在技术探索路上的心得体会、遇到的挑战以及解决方案。

我热爱学习新技术，喜欢思考技术背后的原理，更喜欢将复杂的概念用简单的方式表达出来。希望我的分享能够帮助到更多的开发者朋友。`,
        skills: [
          'JavaScript/TypeScript',
          'Vue.js/React',
          'Node.js',
          'Python',
          'Database Design',
          'System Architecture'
        ],
        interests: [
          '开源项目贡献',
          '技术架构设计',
          '产品思维',
          '用户体验',
          '技术写作',
          '团队协作'
        ],
        email: 'fp4u5h7k@gmail.com',
        github: '',
        linkedin: '',
        twitter: ''
      });
    }

    // 解析JSON字符串为数组
    const response = {
      ...about,
      skills: JSON.parse(about!.skills),
      interests: JSON.parse(about!.interests)
    };

    res.json(response);
  } catch (error) {
    console.error('Failed to fetch about info:', error);
    res.status(500).json({ error: 'Failed to fetch about information' });
  }
});

// 创建或更新About信息 (需要管理员权限)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      title,
      description,
      skills,
      interests,
      email,
      github,
      linkedin,
      twitter,
      avatar
    } = req.body;

    if (!name || !title || !description) {
      return res.status(400).json({ error: '姓名、标题和描述不能为空' });
    }

    // 将数组转换为JSON字符串存储
    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([]);
    const interestsJson = Array.isArray(interests) ? JSON.stringify(interests) : JSON.stringify([]);

    // 检查是否已存在About记录
    const existingAbout = await prisma.about.findFirst();

    let about;
    if (existingAbout) {
      // 更新现有记录
      about = await prisma.about.update({
        where: { id: existingAbout.id },
        data: {
          name,
          title,
          description,
          skills: skillsJson,
          interests: interestsJson,
          email,
          github,
          linkedin,
          twitter,
          avatar
        }
      });
    } else {
      // 创建新记录
      about = await prisma.about.create({
        data: {
          name,
          title,
          description,
          skills: skillsJson,
          interests: interestsJson,
          email,
          github,
          linkedin,
          twitter,
          avatar
        }
      });
    }

    // 返回时解析JSON字符串
    const response = {
      ...about,
      skills: JSON.parse(about.skills),
      interests: JSON.parse(about.interests)
    };

    res.json(response);
  } catch (error) {
    console.error('Failed to save about info:', error);
    res.status(500).json({ error: 'Failed to save about information' });
  }
});

export default router;
