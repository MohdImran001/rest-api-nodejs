const express = require('express');
const bodyParser = require('body-parser');
const { body } = require('express-validator');

const feedCtrl = require('../controllers/feed');

const Router = express.Router();

//GET /feed/posts
Router.get('/posts', feedCtrl.getPosts);

//POST /feed/post
Router.post('/post', [
	
	bodyParser.json({ type: 'application/json' }),
	body('title').trim().isLength({ min:5 }),
	body('content').trim().isLength({ min:5 })

], feedCtrl.createPost);

Router.get('/post/:postId', feedCtrl.getPost);

module.exports = Router;