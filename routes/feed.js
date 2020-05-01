const express = require('express');
const { body } = require('express-validator');

const isAuth = require('../middlewares/auth');
const feedCtrl = require('../controllers/feed');

const Router = express.Router();

//GET /feed/status
Router.get('/status', isAuth, feedCtrl.getUserStatus)

//PUT /feed/update-status
Router.put('/update-status', isAuth, feedCtrl.updateStatus);

//GET /feed/posts
Router.get('/posts', isAuth, feedCtrl.getPosts);

//POST /feed/post
Router.post('/post', isAuth, [
	
	body('title').trim().isLength({ min:5 }),
	body('content').trim().isLength({ min:5 })

], feedCtrl.createPost);

Router.get('/post/:postId', isAuth, feedCtrl.getPost);

Router.put('/post/:postId', isAuth, [

	body('title').trim().isLength({ min:5 }),
	body('content').trim().isLength({ min:5 })

], feedCtrl.updatePost);

Router.delete('/post/:postId', isAuth, feedCtrl.deletePost);

module.exports = Router;