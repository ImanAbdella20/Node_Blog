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

// Set up __dirname and __filename for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const port = process.env.PORT || 3000; // Default to port 3000 if not specified

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable for secret
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.CONNECTION_STRING,
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // Set cookie expiration time
}));

// Static files
app.use(express.static('public'));

// Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.get('/register', (req, res) => {
  res.render('register');
});
app.locals.isActiveRoute = isActiveRoute;
app.use('/', mainRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
