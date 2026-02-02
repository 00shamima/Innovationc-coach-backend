const prisma = require('../utils/prisma');

exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const authorId = req.user.id;
        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
        let mediaType = null;
        if (req.file) {
            mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';
        }

        const newPost = await prisma.post.create({
            data: { title, content, authorId, mediaUrl, mediaType, status: 'PENDING' }
        });
        res.status(201).json({ message: "Idea submitted!", post: newPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const userRole = req.user.role;
        
        const includeOptions = { 
            author: { select: { name: true } }, 
            likes: { include: { user: { select: { name: true } } } }, 
            _count: { select: { likes: true } } 
        };

        let posts;
        if (userRole === 'ADMIN') {
            posts = await prisma.post.findMany({
                include: includeOptions,
                orderBy: { createdAt: 'desc' }
            });
        } else {
            posts = await prisma.post.findMany({
                where: { status: 'APPROVED' },
                include: includeOptions,
                orderBy: { createdAt: 'desc' }
            });
        }
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyStats = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({ where: { authorId: req.user.id } });
        res.json({
            total: posts.length,
            approved: posts.filter(p => p.status === 'APPROVED').length,
            pending: posts.filter(p => p.status === 'PENDING').length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getMyPosts = async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            where: { authorId: req.user.id },
            include: { 
                likes: { include: { user: { select: { name: true } } } }, // <--- New Line
                _count: { select: { likes: true } } 
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};