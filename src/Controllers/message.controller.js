const prisma = require('../utils/prisma');

exports.sendMessage = async (req, res) => {
  const { receiverId, text } = req.body;
  const senderId = req.user.id;

  try {
    const newMessage = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId
      },
      include: {
        sender: { select: { name: true, profilePic: true } }
      }
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Message send failed", error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch messages", error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const sent = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true }
    });
    const received = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true }
    });

    const userIds = [...new Set([...sent.map(m => m.receiverId), ...received.map(m => m.senderId)])];

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, profilePic: true }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to load chats", error: error.message });
  }
};