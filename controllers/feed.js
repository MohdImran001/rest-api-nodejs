const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {

    Post
    .find()
    .then(posts => {
        res
        .status(200)
        .json({ message: "All Posts fetched", posts: posts });
    })
    .catch(err => {
        next(err);
    })

};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error("Validation Failed, enterede data is incorrect");
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: "images/duck.jpg",
        creator: { "name": "Mohd Imran" }
    })
    
    post
    .save()
    .then(result => {
        res.status(201).json({
            message: 'Post Created Successfully',
            post: result
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    
    Post
    .findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error("post could not be found");
            error.statusCode = 404;
            throw error
        }

        res.status(200).json({
            message: "post fetched",
            post: post
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500;
        next(err);
    })
}