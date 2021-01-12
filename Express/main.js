const express = require('express')
const app = express()
const port = 3000


var fs = require('fs');
var template = require('./lib/template.js');
var compression=require('compression');
var topicRouter=require('./routes/topic.js');
var indexRouter=require('./routes/index.js');


app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));
app.use(compression());

app.get('*',function(request,response,next){
    fs.readdir('./data', function(error, filelist){
        request.list=filelist;
        next();
    });
});



app.use('/',indexRouter);
app.use('/topic',topicRouter);

app.use(function(req,res,next){
    res.status(404).send('Sorry cant find that');
})

app.use(function(err,req,res,next){
    console.error(err.stack);
    res.status(500).send('Something broke!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

