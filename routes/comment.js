var express = require('express');
var router = express.Router();
//数据库下的客户端，创建客户端
var MongoClient = require('mongodb').MongoClient;
//将端口地址
var DB_CONN_STR = 'mongodb://localhost:27017/1042';
var async = require('async');  //异步操作
var multiparty = require('multiparty');   //npm i multiparty -D安装
var fs = require('fs');


router.post('/submit',function(req,res){
	var username = req.session.username || '';
	if(username){
		var title = req.body['title'],
		content = req.body['content'];
		// console.log(title)
		var insertData = function(db,callback){
			var conn = db.collection('comment');
			var ids = db.collection('ids');
			async.waterfall([  //异步操作的函数组
				function(callback){   //获取到数据并且处理这些数据
					ids.findAndModify(  //既可以查询也可以修改
						{name:'comment'},
						[['_id','desc']], //将数据降序排序
						{$inc:{id:1}},   //每次加一
						function(err,result){
							callback(null,result.value.id);
						}
					)
				},function(id,callback){   //id是上面的函数传递过来的
					var data = [{uid:id,title:title,content:content,username:username}];
					conn.insert(data,function(err,result){
						if(err){
							console.log(err)
						}else{
							callback(result)
						}
					})
				}
			],function(err,result){
				callback(result);
			})
		}
		//连接数据库
		MongoClient.connect(DB_CONN_STR,function(err,db){
			if(err){
				console.log(err)
			}else{
				console.log('连接数据库成功');
				insertData(db,function(result){
					// res.send('评论成功');
					res.redirect('/comment/com_list')
					db.close();
				})
			}
		})
	}else{
		res.send("<script>alert('请先登录');location.href='/'</script>")
	}
})

// router.get('/com_list',function(req,res){
// 	// res.render('com_list',{})

// 	var username = req.session.username ||'';
// 	if (username) {
// 		var findData = function(db,callback){
// 			var conn = db.collection('comment');
// 			conn.find({}).toArray(function(err,result){
// 				if(err){
// 					console.log(err)
// 				}else{
// 					callback(result)
// 				}
// 			})
// 		}
// 		MongoClient.connect(DB_CONN_STR,function(err,db){
// 			findData(db,function(result){
// 				res.render('com_list',{
// 					res:result
// 				})
// 			})
			
// 		})
// 	}else{
// 		res.send("<script>alert('请先登录');location.href='/'</script>")
// 	}
// })


router.get('/com_list',function(req,res){
	// res.render('com_list',{})
	var username = req.session.username ||'';
	if (username) {
		//构造分页
		var pageNo = req.query['pageNo'];        //页码编号
		pageNo = pageNo?pageNo:1;
		var pageSize = 10;  //每页显示的条数
		var count = 0;   //显示总共的条数
		var totalPage = 0;    //总共的页数

		var findData = function(db,callback){
			var conn = db.collection('comment');
			async.series([
				function(callback){
					conn.find({}).toArray(function(err,result){
						if(err){
							console.log(err)
						}else{
							//算出总共多少页
							totalPage = Math.ceil(result.length/pageSize);
							count = result.length;  //总共的条数
							//首页尾页的判断操作
							pageNo = pageNo<=0?1:pageNo;   //限制首页的范围
							pageNo = pageNo>totalPage?totalPage:pageNo;  //限制尾页
							callback(null,'')
						}
					})
				},
				function(callback){
					conn.find({}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray(function(err,result){
						if(err){
							console.log(err)
						}else{
							callback(null,result)
						}
					})
				}
			],function(err,result){
				callback(result[1])
			})
		}



		MongoClient.connect(DB_CONN_STR,function(err,db){
			if(err){
				console.log(err)
			}else{
				//数据操作
				findData(db,function(result){
					res.render('com_list',{
						res:result,
						pageNo:pageNo,
						totalPage:totalPage,
						count:count
					})
				})
			}
		})
	}else{
		res.send("<script>alert('请先登录');location.href='/'</script>")
	}
})


router.post('/uploadImg', function (req, res) {
	var form = new multiparty.Form()

	// 设置编码
	form.encoding = 'utf-8'

	// 设置文件存储路径
	form.uploadDir = './uploadtemp'

	// 设置文件大小限制
	form.maxFilesSize = 2 * 1024 * 1024
	//通过 xh提供的方法 配置 上传路径和 临时文件路径 以及存储路径
	form.parse(req, function (err, fields, files) {
		var uploadurl = '/images/upload/' ;  //设置上传的文件路径
		file = files['filedata'];
		originalFilename = file[0].originalFilename;
		tmpPath = file[0].path;
		var timestamp = new Date().getTime();
		uploadurl += timestamp + originalFilename;
		newPath = './public/' + uploadurl;
		var fileReadStream = fs.createReadStream(tmpPath);
		var fileWriteStream = fs.createWriteStream(newPath);
		//   删除临时文件，替换为 目录文件
		fileReadStream.pipe(fileWriteStream)
		fileWriteStream.on('close', function () {
  			fs.unlinkSync(tmpPath)
  			res.send('{"err":"","msg":"'+uploadurl+'"}')
		})
	})
})

router.get('/datail',function(req,res){
	var username = req.session.username;
	if(username){
		var uid = parseInt(req.query['uid']);
		MongoClient.connect(DB_CONN_STR,function(err,db){
			if(err){
				console.log(err);
			}else{
				db.collection('comment').findOne({uid:uid},function(err,wp){
					res.render('datail',{item:wp})
				})
			}
		})
	}else{
		res.send("<script>alert('请先登录	');location.href='/'</script>")
	}
})






module.exports = router;
