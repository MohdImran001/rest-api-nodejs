const path = require('path');

//third-party dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

//custom modules
const feedRoutes = require('./routes/feed');

const app = express();

//multer configs
const fileStorage = multer.diskStorage({
	destinaion: (req, file, cb) => {
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, )
	}
})

//middlewares
app.use((req, res, next) => {
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
   next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

//multer

//routes
app.use('/feed', feedRoutes);


//ERROR HANDLER
app.use((err, req, res, next) => {
	console.log(err);
	const statusCode = err.statusCode || 500;
	res.status(statusCode).json({
		"message" : err.message
	})
})


mongoose
.connect(
	'mongodb+srv://mohdimran:0NM4anG3Hh5hviKg@cluster0-gudn3.mongodb.net/messages?retryWrites=true&w=majority'
)
.then(result => {
	//server
	app.listen(8080, () => {
    	console.log("server started");
	});
})




// 0NM4anG3Hh5hviKg