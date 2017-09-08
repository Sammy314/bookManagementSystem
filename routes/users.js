var express = require('express');
var router = express.Router();
//数据库下的客户端，创建客户端
var MongoClient = require('mongodb').MongoClient;
//将端口地址
var DB_CONN_STR = 'mongodb://localhost:27017/1042';

/* GET users listing. */
//注册

//我们接收到post 请求后的路由
router.post('/register',function(req,res){
	//req是服务器端忘浏览器端传数据
	//获取表单数据和表单内容
	var username = req.body['username'];
	var psw = req.body['psw'];
	var sex = req.body['sex'];
	var tel = req.body['tel'];
	var email = req.body['email'];
	var img = req.body['img'];
	var addr = req.body['addr'];
	var order = req.body['order'];

	//自定义数据处理函数，自定一个回执函数
	var insertData = function(db,callback){
		//获取当前数据库，自己需要的集合
		var conn = db.collection('user');
		//将数据存在变量中
		var data = [{username:username,psw:psw,sex:sex,tel:tel,email:email,img:img,addr:addr,order:order}];
		//通过集合的insert()向集合添加文档
		conn.insert(data,function(err,result){
			if(err){
				console.log(err)
				return	
			}
			callback(result);
		})
	}

	//连接数据库
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err);
		}else{
			console.log('数据库连接成功');
			insertData(db,function(result){   //  调用 我自定的 数据操作函数
	          	console.log(result);
	            console.log('注册成功');
	            // res.send('注册成功');
	            db.close();
	            res.redirect('/login');
	        })
		}
	})

})

//添加数据
router.post('/addbooks',function(req,res){
	var booksname = req.body['booksname'];
	var author = req.body['author'];
	var price = req.body['price'];
	var kucun = req.body['kucun'];
	var xiaoliang = req.body['xiaoliang'];
	var discount = req.body['discount'];
	var intro = req.body['intro'];
	
	var insertData = function(db,callback){
		var conn = db.collection('list');
		var data = [{booksname:booksname,author:author,price:price,kucun:kucun,xiaoliang:xiaoliang,discount:discount,intro:intro}];
		conn.insert(data,function(err,result){
			if(err){
				console.log(err)
				return;
			}
			callback(result)
		})
	}
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err)
		}else{
			console.log('数据库连接成功')
			insertData(db,function(result){
				console.log(result);
				res.send('添加数据成功');
				db.close();
			})
		}
	})
})


//登录
router.post('/login',function(req,res){
	var findData = function(db,callback){
		var conn = db.collection('user');
		var data = {username:req.body['username'],psw:req.body['psw']};
		conn.find(data).toArray(function(err,result){
			if(err){
				console.log(err)
				return;
			}
			callback(result);
		})
	}
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err)
		}else{
			console.log('数据库连接成功');
			findData(db,function(result){
				//判断数组是否有数据
				if(result.length>0){
					// res.send('登录成功')					
					req.session.username = result[0].username;
					res.redirect('/home')
				}else{
					// res.send('用户名密码错误')
					res.redirect('/')
				}
			})
		}
	})
})

//新的数据添加
router.get('/addData',function(req,res){
	req.session.page = 'add';
	res.render('addBook',{page:req.session.page})
})

//删除数据
router.post('/remove',function(req,res){
	var booksname = req.body['booksname'];
	var removeData = function(db,callback){
		var conn = db.collection('list');
		var data = {booksname:booksname}
		conn.remove(data);
	}
	//连接客户端
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err)
		}else{
			console.log('数据库连接成功');
			removeData(db,function(result){
				console.log(result);
				res.send('删除数据成功');
				db.close();
			})
		}
	})	
})

//修改数据
router.post('/update',function(req,res){
	var booksname = req.body['booksname'];
	var author = req.body['author'];
	var price = req.body['price'];
	var kucun = req.body['kucun'];
	var xiaoliang = req.body['xiaoliang'];
	var discount = req.body['discount'];
	var intro = req.body['intro'];
	
	var updateData = function(db,callback){
		var conn = db.collection('list');
		//查询数据
		var sdata = {booksname:booksname}
		var data = {$set:{booksname:booksname,author:author,price:price,kucun:kucun,xiaoliang:xiaoliang,discount:discount,intro:intro}};

		conn.update(sdata,data,function(err,result){
			if(err){
				console.log(err)
				return;
			}
			callback(result)
		});
	}
	MongoClient.connect(DB_CONN_STR,function(err,db){
		if(err){
			console.log(err)
		}else{
			console.log('数据库连接成功')
			updateData(db,function(result){
				console.log(result);
				res.send('修改数据成功');
				db.close();
			})
		}
	})
})

//获取书籍列表





module.exports = router;
