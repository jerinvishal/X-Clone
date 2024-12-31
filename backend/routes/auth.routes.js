import express from 'express';
import {signup,login,logout,getMe} from '../controllers/auth.controllers.js'
import{protectRoute} from '../middleware/protectRoute.js'
const Router=express.Router();

Router.post('/signup',signup)
Router.post('/login',login)
Router.post('/logout',logout)
Router.get('/me',protectRoute,getMe)

export default Router;