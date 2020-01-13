var express = require('express');
var app = express();
var proxy = require('http-proxy-middleware');
var bodyParser = require("body-parser");
var template = require('art-template');
//template.config('base', '');
//template.config('extname', '.html');
var options = {
    target: 'http://120.78.142.62:4000',
    changeOrigin: true,
    xfwd: true,  //转发真实ip
	pathRewrite: {
            '^/oauth' : '/oauth',
			'^/order' : '/order',
			'^/goodsspu' : '/goodsspu',
			'^/goodsspec' : '/goodsspec',
			'^/filegroup' : '/filegroup',
			'^/delivery' : '/delivery',
			'^/goodscategory' : '/goodscategory',
			'^/file' : '/file',
			'^/shop' : '/shop',
        }
};
//app.engine('.html', template.__express);
//app.set('view engine', 'html');
app.use(['/oauth','/order','/goodsspu','/goodsspec','/filegroup','/delivery','/goodscategory','/file','/shop'], proxy(options)); //这里只要识别到/api/...就代理转发   

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


var server = require('http').createServer(app);

app.use('/', express.static(__dirname + '/view'));

server.listen(6004, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("listen " + host + port);
});
//ss