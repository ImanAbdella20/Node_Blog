import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import posts from '../models/posts.js';
import User from '../models/User.js';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;
const adminLayout = '../views/layouts/admin.ejs';

// Middleware for authentication
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Route to render admin page
router.get('/', asyncHandler(async (req, res) => {
    const locals = {
        title: "Admin",
        description: "Simple blog created with Node.js, Express & MongoDB."
    };

    console.log('Rendering admin page with locals:', locals);
    res.render('admin/index', { locals, layout: adminLayout });
}));

// Route for admin login
router.post('/admin', asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
}));

// Route to render dashboard
router.get('/dashboard', authMiddleware, asyncHandler(async (req, res) => {
    const locals = {
        title: "Admin Dashboard",
        description: "Simple blog created with Node.js, Express & MongoDB."
    };

    const data = await posts.find();
    res.render('admin/dashboard', { locals, data, layout: adminLayout });
}));

// Route for user registration
router.post('/', asyncHandler(async (req, res) => {
    console.log('Register route hit');
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User Created', user });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ message: 'Username already in use.' });
        } else {
            res.status(500).json({ message: 'Internal server error.', error: error.message });
        }
    }
}));

// Route to render add-post page
router.get('/add-post', authMiddleware, asyncHandler(async (req, res) => {
    const locals = {
        title: "Add Post",
        description: "Simple blog created with Node.js, Express & MongoDB."
    };

    const data = await posts.find();
    res.render('admin/add-post', { locals, data, layout: adminLayout });
}));

// Route to add a new post
router.post('/add-post', authMiddleware, asyncHandler(async (req, res) => {
    try {
        const newPost = new posts({
            title: req.body.title,
            body: req.body.body
        });

        await posts.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
}));

// Route to edit a post
router.put('/edit-post/:id', authMiddleware, asyncHandler(async (req, res) => {
    try {
        await posts.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
}))


// Route to render edit-post page
router.get('/edit-post/:id', authMiddleware, asyncHandler(async (req, res) => {
    const locals = {
        title: "Edit Post",
        description: "Free Node.js user management system"
    };

    try {
        const data = await posts.findOne({ _id: req.params.id });
        if (!data) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.render('admin/edit-post', {
            data,
            layout: adminLayout,
            locals
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
}));

// Route to delete a post
router.delete('/delete-post/:id', authMiddleware, asyncHandler(async (req, res) => {
    try {
        const result = await posts.deleteOne({ _id: req.params.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
}));

// Route to logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
    res.redirect('/');
});


export default router;

