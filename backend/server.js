import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudinary from 'cloudinary';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.route.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.route.js';
import connectdb from './db/connectdb.js';

const app = express();
dotenv.config();

const __dirname = path.resolve()

cloudinary.config({
    cloud_name: process.env.COLUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.COLUDINARTY_API_SECRET_KEY,
});

const PORT = process.env.PORT;

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.use(
    cors({
        origin: '*',
        credentials: false,
    })
);

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notification', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "/frontend/build")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "/frontend/build", "index.html"));
    });
  }

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectdb();
});
