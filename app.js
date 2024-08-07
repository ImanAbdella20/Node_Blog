import express from 'express';
import dotenv from 'dotenv';
import expressLayout from 'express-ejs-layouts';
import methodOverride from 'method-override';
import mainRoutes from './server/routes/main.js';
import adminRoutes from './server/routes/admin.js';
import connectDB from './server/config/dbConnection.js';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import isActiveRoute from './server/helpers/routeHelpers.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();
const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'Keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.CONNECTION_STRING
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // Optional: Set cookie expiration time
}));

app.use(express.static('public'));

// Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.get('/register', (req, res) => {
    res.render('register');
});
app.locals.isActiveRoute = isActiveRoute;
app.use('/', mainRoutes);
app.use('/admin', adminRoutes); 

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
