/**
 * server.js
 * Main entry point for our Node.js web server. 
 * Node.js allows us to run JavaScript at the 
 * command line, and one of the things it lets us
 * do is listen for HTTP requests on a port, and
 * respond to them. This enables us to create a web
 * server.
 */

//TODO: use the "express" module to create a web server
//see http://expressjs.com/
var express = require("express");
var Yelp = require("yelp");

var app = express();
var yelp = new Yelp({
    consumer_key:process.env.CONSUMER_KEY,
    consumer_secret:process.env.CONSUMER_SECRET,
    token:process.env.TOKEN,
    token_secret:process.env.TOKEN_SECRET
})

app.use(express.static("./static"));

//TODO: add an API route that uses the "yelp" module to 
//search for businesses using the Yelp API. See
//https://github.com/olalonde/node-yelp
app.get("/api/v1/search",function(req,res,next){
    var params ={
        term:"bars",
        ll:req.query.lat + "," + req.query.lng
    };
    yelp.search(params)
    .then(function(data){
        res.json(data);
    })   
    .catch(function(err){
        console.error(err);
        res.status(500).json(err);
    });
});



app.listen(3000,function(){
console.log("server is listening on http://localhost:3000");
});