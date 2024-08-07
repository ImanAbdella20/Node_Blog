import express from 'express';
import posts from '../models/posts.js';
const router = express.Router();

// Middleware to set currentRoute for all routes
router.use((req, res, next) => {
    res.locals.currentRoute = req.path;
    next();
});

router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Nodejs Blog",
            description: "Simple blog created with nodejs, express & mongodb."
        };

        let perPage = 10;
        let page = req.query.page || 1;

        const data = await posts.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await posts.countDocuments(); // Updated method
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/about', (req, res) => {
    res.render('about', {
        locals: {
            title: "About",
            description: "About this blog"
        }
    });
});

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await posts.findById({ _id: slug });

        const locals = {
            title: data.title,
            description: "Simple blog created with nodejs, express & mongodb."
        };

        res.render('post', { locals, data });
    } catch (error) {
        console.log(error);
    }
});

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple blog created with nodejs, express & mongodb."
        };
        let searchTerm = req.body.searchTerm;
        const searchSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
        const data = await posts.find({
            $or: [
                { title: { $regex: new RegExp(searchSpecialChar, 'i') } },
                { body: { $regex: new RegExp(searchSpecialChar, 'i') } },
            ]
        });

        res.render("search", {
            data,
            locals
        });
    } catch (error) {
        console.log(error);
    }
});

export default router;
