var entities = require('html-entities');
var urlencode = require('urlencode');

module.exports={
    html:function(title,list,body,control){
    return `<!doctype html>
    <html>
    <head>
    <title>WEB2 - ${title}</title>
    <meta charset="utf-8">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
    </body>
    </html>
    `;
    },list:(filelist) => {
    var list='<ul>';
    var i=0;
    while(i < filelist.length){
        list=list+`<li><a href="/topic/`+urlencode(filelist[i])+`">`;
        list=list+entities.encode(filelist[i])+`</a></li>`;
        i=i+1;
    }
    list=list+'</ul>';
    return list;
    }
}
