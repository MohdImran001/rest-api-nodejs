const express = require('express');
const { body } = require('express-validator');

const feedCtrl = require('../controllers/feed');

const Router = express.Router();

//GET /feed/posts
Router.get('/posts', feedCtrl.getPosts);

//POST /feed/post
Router.post('/post', [
	
	body('title').trim().isLength({ min:5 }),
	body('content').trim().isLength({ min:5 })

], feedCtrl.createPost);

Router.get('/post/:postId', feedCtrl.getPost);

Router.put('/post/:postId', [

	body('title').trim().isLength({ min:5 }),
	body('content').trim().isLength({ min:5 })

], feedCtrl.updatePost);

Router.delete('/post/:postId', feedCtrl.deletePost);

module.exports = Router;