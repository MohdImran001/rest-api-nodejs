const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

function errorHandler(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    throw error;
}

exports.getUserStatus = (req, res, next) => {
    User
    .findById(req.userId)
    .then(user => {
        if(!user){
            return errorHandler('no user found', 404);
        }

        res.status(200).json({ status: user.status });
    })
    .catch(err => {
        next(err);
    })
}

exports.updateStatus = (req, res, next) => {
    const status = req.body.status;
    User
    .findById(req.userId)
    .then(user => {
        if(!user){
            return errorHandler('no user found', 404);
        }

        user.status = status;
        return user.save();
    })
    .then(result => {
        res.status(200).json({ message: "status updated", status: result.status });
    })
    .catch(err => {
        next(err);
    })
}

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 6;

    let totalItems;
    Post
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Post.find().sort({ createdAt: -1 }).populate('creator').skip(( currentPage - 1 ) * perPage).limit(perPage);
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

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
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
    creator: req.userId
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    let loadedUser = await user.save();

    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: user._id, name: user.name }
    });

    return loadedUser;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// exports.createPost = (req, res, next) => {
//     const errors = validationResult(req);
//     if(!errors.isEmpty()) {
//         const error = new Error("Validation Failed, enterede data is incorrect");
//         error.statusCode = 422;
//         throw error;
//     }

//     if(!req.file) {
//         const error = new Error('no image found');
//         error.statusCode = 422;
//         throw error;
//     }

//     const imageUrl = req.file.path;
//     const title = req.body.title;
//     const content = req.body.content;
//     let creator;

//     const post = new Post({
//         title: title,
//         content: content,
//         imageUrl: imageUrl,
//         creator: req.userId
//     })
    
//     post
//     .save()
//     .then(postDoc => {
//         return User.findById(req.userId);
//     })
//     .then(user => {
//         creator = user;
//         user.posts.push(post);
//         return user.save();
//     })
//     .then(result => {
//         io.getIO().emit('posts', { action: "create", post: { ...post._doc, creator: { _id: req.userId, name: result.name } } });
//         res.status(201).json({
//             message: 'Post Created Successfully',
//             post: post,
//             creator: { _id: creator._id, name: creator.name }
//         })
//     })
//     .catch(err => {
//         next(err);
//     })
// };

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
    .populate('creator')
    .then(post => {
        if(!post) {
            const error = new Error('no post found');
            error.statusCode = 404;
            throw error;
        }

        if(post.creator._id.toString() !== req.userId) {
            return errorHandler('Not Authorized', 403);
        }

        if(imageUrl !== post.imageUrl)
            clearImage(post.imageUrl);

        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then(result => {
        io.getIO().emit('posts',  { action: "update", post: result });
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


        if(post.creator.toString() !== req.userId) {
            return errorHandler('Not Authorized', 403);
        }
        

        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);

    })
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        io.getIO().emit('posts', { action: 'delete', post: postId });
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