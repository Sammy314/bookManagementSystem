 function pageInit(){
            $.extend(XHEDITOR.settings,{shortcuts:{'ctrl+enter':submitForm}})   //配置键盘提交，扩展editor
            $('#conent').xheditor({  html5Upload: false,
                upMultiple: '1',
                upLinkUrl: 'upload.html',
                upLinkExt: 'zip, rar, txt',
                upImgUrl: './uploadImg',
                upImgExt: 'jpg,jpeg,gif,png',
                upFlashUrl: 'upload.html',
                upFlashExt: 'swf',
                upMediaUrl: 'upload.html',
                upMediaExt: 'wmv,avi,wma,mp3,mid'
        })
    }
    function submitForm() {   //初始完成后 创建的虚拟
      $('#frmDemo').submit()
    }





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
    var uploadurl = '/images/upload/'   //设置上传的文件路径
    file = files['filedata']
    originalFilename = file[0].originalFilename
    tmpPath = file[0].path
    var timestamp = new Date().getTime()
    uploadurl += timestamp + originalFilename
    newPath = './public/' + uploadurl
    var fileReadStream = fs.createReadStream(tmpPath)
    var fileWriteStream = fs.createWriteStream(newPath)
    //   删除临时文件，替换为 目录文件
    fileReadStream.pipe(fileWriteStream)
    fileWriteStream.on('close', function () {
      fs.unlinkSync(tmpPath)
      res.send('{"err":"","msg":"'+uploadurl+'"}')
    })
  })
})



