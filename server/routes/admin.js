import express from 'express';
import posts from '../models/posts.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

const adminLayout = '../views/layouts/admin.ejs';

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

router.get('/', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple blog created with nodejs, express & mongodb."
        };
        console.log('Rendering admin page with locals:', locals);
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Admin Dashboard",
            description: "Simple blog created with nodejs, express & mongodb."
        };
        const data = await posts.find();
        res.render('admin/dashboard', { 
            locals, 
            data,
            layout: adminLayout
         });
    } catch (error) {
        console.log(error);
    }
});


router.post('/', asyncHandler(async (req, res) => {
    console.log('Register route hit');
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await User.create({ 
            username, 
            password: hashedPassword 
        });
        res.status(201).json({ message: 'User Created', user });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ message: 'User already in use.' });
        } else {
            res.status(500).json({ message: 'Internal server error.', error: error.message });
        }
    }
}));


router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add post",
            description: "Simple blog created with nodejs, express & mongodb."
        };
        const data = await posts.find();
        res.render('admin/add-post', { 
            locals,
            data,
            layout: adminLayout
         });
    } catch (error) {
        console.log(error);
    }
});

router.post('/add-post', authMiddleware, async (req, res) => {
    try {

        try {
            const newPost = new posts({
                title: req.body.title,
                body: req.body.body
            });

            await posts.create(newPost);
                   
        res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);
    }
});

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
    
       await posts.findByIdAndUpdate (req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
       });

       res.redirect('/edit-post/$(req.params.id)')
    } catch (error) {
        console.log(error);
    }
});

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Edit post",
            description: "Free nodejs user management system"
        };
    
       const data = await posts.findOne({_id: req.params.id});

       res.render('admin/edit-post', {
        data,
        layout: adminLayout,
        locals
       });
    } catch (error) {
        console.log(error);
    }
});

router.delete('/delete-post/:id', authMiddleware, async (req, res) => { 
try {
    await posts.deleteOne({_id: req.params.id});
    res.redirect('/dashboard');
} catch (error) {
    console.log(error);
}

})

router.get('/logout', (req, res) => {
res.clearCookie('token');
res.json({message: 'Logout successful'});
res.redirect('/');
 })

export default router;
