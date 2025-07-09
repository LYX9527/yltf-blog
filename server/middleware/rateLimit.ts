import express from 'express';

interface AuthRequest extends express.Request {
  user?: {
    id: string;
    role: string;
    username: string;
    email: string;
  };
}

// 存储IP的评论记录
const commentHistory = new Map<string, number[]>();

// 清理过期记录的定时器
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of commentHistory.entries()) {
    // 清理10分钟前的记录
    const validTimestamps = timestamps.filter(timestamp => now - timestamp < 10 * 60 * 1000);
    if (validTimestamps.length === 0) {
      commentHistory.delete(ip);
    } else {
      commentHistory.set(ip, validTimestamps);
    }
  }
}, 60 * 1000); // 每分钟清理一次

// 获取客户端真实IP
const getClientIP = (req: express.Request): string => {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'
  ).split(',')[0].trim();
};

// 评论频率限制中间件
export const commentRateLimit = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  // 如果用户已登录，跳过IP限制
  if (req.user) {
    return next();
  }

  const ip = getClientIP(req);
  const now = Date.now();
  
  // 获取该IP的评论历史
  const history = commentHistory.get(ip) || [];
  
  // 过滤出10分钟内的评论
  const recentComments = history.filter(timestamp => now - timestamp < 10 * 60 * 1000);
  
  // 检查10分钟内是否超过10条评论
  if (recentComments.length >= 10) {
    return res.status(429).json({ 
      error: '评论过于频繁，未登录用户10分钟内最多可评论10条，请稍后再试或登录后继续评论' 
    });
  }
  
  // 检查1分钟内是否已有评论
  const oneMinuteAgo = now - 60 * 1000;
  const hasRecentComment = recentComments.some(timestamp => timestamp > oneMinuteAgo);
  
  if (hasRecentComment) {
    return res.status(429).json({ 
      error: '评论过于频繁，未登录用户1分钟内只能评论1条，请稍后再试' 
    });
  }
  
  // 记录本次评论时间
  recentComments.push(now);
  commentHistory.set(ip, recentComments);
  
  next();
};

// 获取IP评论统计信息（可选，用于调试）
export const getIPCommentStats = (req: express.Request, res: express.Response) => {
  const ip = getClientIP(req);
  const now = Date.now();
  const history = commentHistory.get(ip) || [];
  
  // 过滤出10分钟内的评论
  const recentComments = history.filter(timestamp => now - timestamp < 10 * 60 * 1000);
  
  // 检查1分钟内的评论
  const oneMinuteAgo = now - 60 * 1000;
  const commentsInLastMinute = recentComments.filter(timestamp => timestamp > oneMinuteAgo).length;
  
  res.json({
    ip,
    commentsInLast10Minutes: recentComments.length,
    commentsInLastMinute,
    remainingCommentsIn10Minutes: Math.max(0, 10 - recentComments.length),
    canCommentNow: commentsInLastMinute === 0 && recentComments.length < 10
  });
};