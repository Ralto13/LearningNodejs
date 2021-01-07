var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var urlencode = require('urlencode');
var template = require('./lib/template.js');
var path = require('path');
var entities = require('html-entities');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;    
    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', function(error, filelist){
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.html(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                    );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            queryData.id=path.parse(queryData.id).base;
            fs.readdir('./data', function(error, filelist){            
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                    if(description===undefined){                
                        response.writeHead(404);
                        response.end('Not found');
                    }else{
                        description=entities.encode(description);
                    }

                    var title = entities.encode(queryData.id);
                    var list = template.list(filelist);
                    var html = template.html(title, list,
                        `<h2>${title}</h2>${description}`,
                        ` <a href="/create">create</a>
                        <a href="/update?id=${title}">update</a>
                        <form action="delete_process" method="post" style="display:inline;">
                        <input type="hidden" name="id" value="${title}">
                        <input type="submit" value="delete">
                        </form>`
                        );            
                    response.writeHead(200);            
                    response.end(html);
                });
            });
        }
    } else if(pathname === '/create'){
        fs.readdir('./data', function(error, filelist){
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list, `
                <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                <input type="submit">
                </p>
                </form>
                `, '');
            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = path.parse(post.title).base;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){            
                title=urlencode(title);            
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end();
            })
        });
    } else if(pathname === '/update'){
        queryData.id=path.parse(queryData.id).base;
        fs.readdir('./data', function(error, filelist){
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(title, list,
                    `
                    <form action="/update_process" method="post">
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
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                    );
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = path.parse(post.id).base;
            var title = path.parse(post.title).base;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error){
                fs.writeFile(`data/${title}`, description, 'utf8', function(err){
                    title=urlencode(title);
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                })
            });
        });
    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = path.parse(post.id).base;
            fs.unlink(`data/${id}`, function(error){
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        });
    } else {
        response.writeHead(404);
        response.end('Not found');
/*  
warning : reading files from the location of starting the app              
ex) /app.js
try{            
var pathname=__dirname + _url;
response.writeHead(200);
response.end(fs.readFileSync(pathname));
}
catch{
response.writeHead(404);
response.end('Not found');
}
*/

    }
});

app.listen(3000);


//pm2로 실행한 모든 프로세스를 중지 & 삭제 합니다. 
// pm2 kill
// 아래 명령은 pm2를 실행하면서 로그가 출력되도록 합니다. (--no-daemon) 또 특정 디랙토리에 대한 watch를 하지 않도록 하는 방법입니다. 
// pm2 start main.js --watch --ignore-watch="data/* sessions/*"  --no-daemon