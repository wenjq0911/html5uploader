# html5uploader
简单基于h5的上传文件上传插件（根据网上资源修改）
##使用方法

* 页面引用css与js
* 定义一个div  
	
```html
<div id="uploader"></div>
```
		
* 调用

```javascript
$('#upload').html5uploader({
	auto:true,
	multi:false,
	url:'upload_url'
});
```

##参数说明

字段|类型|默认值|说明
----|----|----|----
fileTypeExts|字符|-|允许上传的文件类型，填写mime类型
url|字符|-|文件上传地址
auto|布尔|false|自动上传
multi|布尔|true|多文件
buttonText|字符|选择文件|上传按钮上的文字
removeTimeout|数字|1000|上传完成后进度条的消失时间（毫秒）
formData|Object|-|附加的参数
fileDataName|字符|fileData|上传时的文件参数名称
method|字符|post|访问当时的请求方式，可选get、post
initQueue|数组|[]|初始化显示的队列，编辑时传入已保存文件的路径列表,{name:'显示的名称',path:'服务器路径'}
maxQueue|数字|999|允许上传的最大数
fileSizeLimit|数字|0|文件大小限制（单位KB），0时表示不限制

##事件

事件|参数|说明
----|--|----
onInit|无|初始化时的动作
onUploadStart|file：文件对象|上传开始时的动作
onUploadSuccess|file:文件对象 <br/> res:服务器响应信息|上传成功的动作
onUploadComplete|file:文件对象 <br/> res:服务器响应信息|上传完成的动作
onUploadError|file:文件对象 <br/> res:服务器响应信息|上传失败的动作