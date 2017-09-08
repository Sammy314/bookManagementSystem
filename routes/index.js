var express = require('express');
var router = express.Router();


var MongoClient = require('mongodb').MongoClient;
//将端口地址
var DB_CONN_STR = 'mongodb://localhost:27017/1042';

/* GET home page. */
//get里的第一个参数是路径
router.get('/', function(req, res, next) {
//index为对应的ejs文件
  res.render('index', { title: 'Express+mongodb项目',
  	username:req.session.username
   });
});

//注册
router.get('/register',function(req,res){
	res.render('register',{})
})

//登录
router.get('/login',function(req,res){
	res.render('login',{})
})

//添加数据
router.get('/addbooks',function(req,res){
	res.render('addbooks',{})
})
//删除数据
router.get('/remove',function(req,res){
	res.render('remove',{})
})
//修改数据
router.get('/update',function(req,res){
	res.render('update',{})
})
//查找数据
router.get('/search',function(req,res){
	res.render('search',{})
})
//显示书籍列表
router.get('/list',function(req,res){
	res.render('list',{})
})

router.get('/home',function(req,res){
	var showbooks = function(db,callback){
		var conn = db.collection('list');
		var data = {};
		conn.find().toArray(function(err,result){
			if(err){
				console.log(err)
				return
			}else{
				callback(result)				
			}
		})
	}
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err)
		}else{
			console.log('数据库连接成功');
			showbooks(db,function(result){
				console.log(result);
				res.render('home',{data:result})
			})
		}
	})
})
router.get('/logout',function(req,res){
	req.session.username = undefined;
	res.redirect('/');
})

router.get('/comment',function(req,res){
	res.render('comment',{})
})


module.exports = router;
