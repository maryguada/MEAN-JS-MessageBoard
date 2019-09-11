// Assignment: Create a single page message board 

// imports 
const express = require('express'); //require express 
const app = express(); //require express
const mongoose = require("mongoose"); // require mongoose 
const session = require ("express-session"); // use session
const flash = require ("express-flash"); // use flash 
const bodyParser = require ("body-parser")
var path = require('path'); // we need to use path

// configuration 
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(flash()); 

app.use(express.static(__dirname+"/static")); 
app.use(session({
    secret: 'secretsecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  }))
app.use(bodyParser.urlencoded({useNewUrlParser: true}));
// mongoose models 
mongoose.connect("mongodb://localhost/Message_Board"); 


// creating our databases. 
var CommentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "Your name is required."], minlength:3}, 
    comment: {type: String, required: [true, "Comment field cannot be left blank."], minlength:3},
}, {timestamps: true})


var MessageSchema = new mongoose.Schema({
    name: {type: String, required: [true,"Your name is required" ], minlength:3}, 
    message: {type: String, required: [true, "Message can't be left blank"], minlength:2},
    comments: [CommentSchema]
}, {timestamps: true})

mongoose.model("Comment", CommentSchema);
const Comment = mongoose.model("Comment");
mongoose.model("Message", MessageSchema);
const Message = mongoose.model("Message");

//Routes 
//Get Root Route to render index.ejs view
app.get("/", function(req, res){
    console.log("This is the root route");
    Message.find({}, function(err, msg_array) {
		if (err) {
			console.log("Error finding messages")
			res.render("index", {'err': err})
		}else {
			console.log(msg_array)
			res.render("index", {messages: msg_array})
		}
	})
})

// Post route for adding a user. 
app.post('/message_post', function(req, res) {
	console.log("POST DATA", req.body);
	Message.create(req.body, function(err, data) {
		if (err) {
			console.log("Error creating message")
			res.redirect("/")
		}else{
			console.log("Succesffuly added message")
			res.redirect("/")
		}
	})
})

//Post Route for Comment
app.post('/comment_post', function(req, res) {
	// console.log("POST DATA", req.body);
	Comment.create({comment: req.body.comment, name: req.body.name}, function(err, data) {
		if (err) {
			console.log("Error creating Comment")
			
			res.redirect("/")
		}else{
			Message.findOneAndUpdate({_id: req.body.msg_id}, {$push: {comments: data}}, function(err, data){
				if(err){
					console.log("Error adding comment to message", err.message)
					res.redirect("/")
				}else {
					console.log("Successfully added comment to message")
					res.redirect("/")
				}
			})
		}
	})
})

// port listen 
app.listen(8080, function(){
    console.log("Listening on port: 8080");
});