const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    let totalItems;
    Post
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Post.find().skip(( currentPage - 1 ) * perPage).limit(perPage);
    })
    .then(posts => {
        res
        .status(200)
        .json({ 
            message: "All Posts fetched", 
            posts: posts, 
            totalItems: totalItems 
        });
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

    if(!req.file) {
        const error = new Error('no image found');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
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
};

exports.updatePost = (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error("Validation Failed, entered data is incorrect");
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if(req.file) {
        imageUrl = req.file.path;
    }

    if(!imageUrl) {
        const error = new Error('no image picked');
        error.statusCode = 422;
        throw error;
    }

    Post
    .findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }

        if(imageUrl !== post.imageUrl)
            clearImage(post.imageUrl);

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then(result => {
        res
        .status(200)
        .send({ 
            message: "post updated", 
            post: result
        });
    })
    .catch(err => {
        next(err);
    })

}


exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post
    .findById(postId)
    .then(post => {

        if(!post) {
            const error = new Error("could not find post");
            error.statusCode = 404;
            throw error;
        }

        //check for user login

        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);

    })
    .then(result => {
        res
        .status(200)
        .json({
            message: "post deleted"
        })
    })
    .catch(err => {
        next(err);
    })

}



const clearImage = filePath => {
        filePath = path.join(__dirname, '..', filePath);
        fs.unlink(filePath, (err) => {
            // console.log(err);
        });
}