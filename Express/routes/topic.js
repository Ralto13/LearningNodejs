var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var urlencode = require('urlencode');
var entities = require('html-entities');
var qs = require('querystring');
var template = require('../lib/template.js');

router.get('/create', function(request, response) {    
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.html(title, list, `
        <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
        <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
        <input type="submit">
        </p>
        </form>
        `, '');
    response.send(html);
})

router.post('/create_process', function(request, response) {
    var post = request.body;    
    var title = path.parse(post.title).base;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){            
        title=urlencode(title);            
        response.redirect(302, `/topic/${title}`)
    })
})

router.get('/update/:pageId', function(request, response) {
    var queryData=path.parse(request.params.pageId).base;    
    fs.readFile(`data/${queryData}`, 'utf8', function(err, description){
        var title = entities.encode(queryData);
        var title_ = urlencode(queryData);
        var list = template.list(request.list);
        var html = template.html(title, list,
            `
            <form action="/topic/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
            <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
            <input type="submit">
            </p>
            </form>
            `,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title_}">update</a>`
            );           
        response.send(html);
    });
})

router.post('/update_process', function(request, response) {
    var post = request.body;
    var id = path.parse(post.id).base;
    var title = entities.decode(path.parse(post.title).base);
    var description = entities.decode(post.description);    
    fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            title=urlencode(title);
            response.redirect(302, `/topic/${title}`)      
        })
    })
})

router.post('/delete_process',function(request,response){
    var post = request.body;
    var id = path.parse(post.id).base;
    fs.unlink(`data/${id}`, function(error){
        response.redirect(302, '/');            
    })
})

router.get('/:pageId', function(request,response,next) {
    var queryData=path.parse(request.params.pageId).base;        
    queryData=entities.decode(queryData);
    fs.readFile(`data/${queryData}`, 'utf8', function(err, description){            
        if(err){
            next(err);
        } else {            
            var title = entities.encode(queryData);
            var title_= urlencode(queryData);
            description = entities.encode(description);
            var list = template.list(request.list);
            var html = template.html(title, list,
                `<h2>${title}</h2>${description}`,
                ` <a href="/topic/create">create</a>
                <a href="/topic/update/${title_}">update</a>
                <form action="/topic/delete_process" method="post" style="display:inline;">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
                </form>`
                ); 
            response.send(html);
        }
    });
})


module.exports=router;