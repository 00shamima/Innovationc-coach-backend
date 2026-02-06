const prisma = require('../utils/prisma');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      // We still fetch everything, but we handle the null issue below
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        isApproved: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Handle null names so Prisma/Frontend doesn't break
    const sanitizedUsers = users.map(user => ({
      ...user,
      name: user.name || "Unknown User"
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    // If the error is P2032 (the one you saw), we send a specific hint
    res.status(500).json({ 
      message: "Error fetching users", 
      details: error.message,
      hint: "Database record contains null in a required field. Check schema.prisma"
    });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { isApproved: false, role: 'USER' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const sanitizedPending = pendingUsers.map(user => ({
        ...user,
        name: user.name || "New User"
    }));

    res.json(sanitizedPending);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending users" });
  }
};

exports.approveUser = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    await prisma.user.update({
      where: { id: userId }, 
      data: { isApproved: true }
    });
    res.json({ message: "User approved successfully!" });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({ message: "Approval failed. Check if ID is a valid ObjectId." });
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
    // Note: MongoDB requires the ID to be present and role NOT to be admin
    await prisma.user.delete({
      where: { 
        id: userId,
      }
    });
    res.json({ message: "User permanently deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Permanent delete failed." });
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