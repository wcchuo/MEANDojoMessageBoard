var path = require("path");
var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/messages');
var postSchema = new mongoose.Schema({
    name: String,
    message: String, 
    created_at: {type: Date, default: new Date},
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

var Post = mongoose.model('Post', postSchema);

var commentSchema = new mongoose.Schema({
    _post: {type: Schema.ObjectId, ref: 'Post'},
    name: String,
    comment: String,
    created_at: {type: Date, default: new Date}
});

var Comment = mongoose.model('Comment', commentSchema);


app.get('/post/:id', function (req, res){
    Post.find({_id: req.params.id})
        .populate('comments')
        .exec(function(err, posts) {
            res.render('post', {posts: posts});
        });
});

app.get('/', function(req, res) {
  Post.find({}, function(err, posts) {
     if(err) {
      console.log('Failed to connect to database or there is no data.');
    } else { 
      console.log('Successfully display message!');
    }
    res.render('post', {posts : posts});
  })
})


app.post('/post_message', function(req, res) {
  console.log("POST DATA", req.body);
  var post = new Post({
    name: req.body.name,
    message: req.body.message,
    created_at: Date.now()
});

post.save(function(err) {
    if(err) {
      console.log('Something went wrong with the message.');
    } else { 
      console.log('Successfully added a message!');
    }
  })
 res.redirect('/');
})


app.put('/post/:id', function (req, res){
    Post.findOne({_id: req.params.id}, function(err, post){

        var comment = new Comment(req.body);
        console.log(comment)

        comment._post = post._id;
        console.log(comment._post)
        post.comments.push(comment);

        comment.save(function(err){
            post.save(function(err){
        if(err) {
            console.log('Error');
       } else {
              res.redirect('/');
              }
            });
        });
    });
});



app.listen(8008, function() {
 console.log("listening on port 8008");
})