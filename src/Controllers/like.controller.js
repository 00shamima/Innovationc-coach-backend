const prisma = require('../utils/prisma');

exports.toggleLike = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const userName = req.user.name; 

  try {
    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.json({ liked: false, userName });
    }

    await prisma.like.create({ data: { userId, postId } });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          senderId: userId,
          type: 'LIKE',
          // Message field-la content mattum vaiyunga, senderName thaniya backend handle pannum
          message: `liked your post`, 
          postId: postId
        }
      });
    }
    res.json({ liked: true, userName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};