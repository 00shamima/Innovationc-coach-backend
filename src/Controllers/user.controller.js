const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

// 1. GET DASHBOARD / ACTIVITY DATA
exports.getMyDashboardData = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        profilePic: true,
        role: true,
        createdAt: true
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error: error.message });
  }
};

// 2. SEARCH USERS
exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  const currentUserId = req.user?.id;

  try {
    if (!query || query.trim().length === 0) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } } 
            ]
          },
          { id: { not: currentUserId } } 
        ]
      },
      select: { id: true, name: true, profilePic: true, bio: true },
      take: 10 
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

// 3. GET PUBLIC PROFILE (For visiting other users)
exports.getUserPublicProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, bio: true, profilePic: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// 4. UPDATE PROFILE & PASSWORD
exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, bio, password } = req.body;
  
  try {
    let updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;

    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      updateData.profilePic = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, bio: true, profilePic: true }
    });

    res.json({ message: "Updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};