const prisma = require('../utils/prisma');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isApproved: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { isApproved: false, role: 'USER' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending users" });
  }
};

exports.approveUser = async (req, res) => {
  const { userId } = req.body;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true }
    });
    res.json({ message: "User approved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Approval failed" });
  }
};

exports.rejectUser = async (req, res) => {
  const { userId } = req.body;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: false } 
    });
    res.json({ message: "User rejected/Access denied" });
  } catch (error) {
    res.status(500).json({ message: "Reject action failed" });
  }
};


exports.hardDeleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({
      where: { id: userId }
    });
    res.json({ message: "User permanently deleted from database" });
  } catch (error) {
    res.status(500).json({ message: "Permanent delete failed" });
  }
};


exports.respondToPost = async (req, res) => {
  const { postId, status } = req.body;
  try {
    const updated = await prisma.post.update({
      where: { id: postId },
      data: { status, isResponded: true, isAdminRead: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Action failed" });
  }
};

exports.markAsRead = async (req, res) => {
  const { postId } = req.body;
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { isAdminRead: true }
    });
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};