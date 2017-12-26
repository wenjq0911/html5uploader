/*
html5uploader V1.0
author:吕大豹
date:2013.2.21

html5uploader V2.0
author:wenjq
date:2017.12.14
*/
(function ($) {
    $.fn.html5uploader = function (opts) {
        
        var defaults = {
            fileTypeExts: '', //允许上传的文件类型，填写mime类型
            //url: '', //文件提交的地址
            auto: false, //自动上传
            multi: true, //默认允许选择多个文件
            buttonText: '选择文件', //上传按钮上的文字
            removeTimeout: 1000, //上传完成后进度条的消失时间
            onUploadStart: function (file) {}, //上传开始时的动作
            onUploadSuccess: function (file,res) {}, //上传成功的动作
            onUploadComplete: function (file,res) {}, //上传完成的动作
            onUploadError: function (file,res) {}, //上传失败的动作
            onInit: function () { }, //初始化时的动作
            onSelectedFiles: function (files) { return true;},//文件上传前的动作，需要返回一个布尔值，false取消将文件加入队列
            formData: {},//附加的参数
            fileDataName: 'filedata',//上传时的文件参数名称，默认fileData
            method: 'post',//访问当时的请求方式，默认post
            initQueue: [],//初始化显示的队列，编辑时传入已保存文件的路径列表
            maxQueue: 999,//允许上传的最大数，默认999
            fileSizeLimit: 0,//文件大小限制（单位KB）
            savePath: '',//文件保存的相对路径
            saveFileNameTemplate: '${prefix}_${fileName}',//文件命名模板
            basePath:''//插件基础路径
        }
 
        var option = $.extend(defaults, opts);
 
        //将文件的单位由bytes转换为KB或MB
        var formatFileSize = function (size) {
            if (size > 1024 * 1024) {
                size = (Math.round(size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
            } else {
                size = (Math.round(size * 100 / 1024) / 100).toString() + 'KB';
            }
            return size;
        }

        //根据文件序号获取文件
        var getFile = function (index, files) {
            for (var i = 0; i < files.length; i++) {
                if (files[i].index == index) {
                    return files[i];
                }
            }
            return false;
        }
        //将文件类型格式化为数组
        var formatFileType = function (str) {
            if (str) {
                return str.split(",");
            }
            return false;
        }
 
        this.each(function () {
            var _this = $(this);
            //先添加上file按钮和上传列表
            var inputstr = '<input class="uploadfile " style="visibility:hidden;" type="file" name="fileselect[]"';
            if (option.multi) {
                inputstr += 'multiple';
            }
            inputstr += '/>';
            inputstr += '<a href="javascript:void(0)" class="uploadfilebtn icon iconfont icon-xuanzewenjian">';
            inputstr += option.buttonText;
            inputstr += '</a>';
            var fileInputButton = $(inputstr);
            var uploadFileList = $('<ul class="filelist"></ul>');
            _this.append(fileInputButton, uploadFileList);
            var itemTemplate_init = '<li><span class="filename"><a target="_blank" href="${filePath}">${fileName}</a></span><a class="delfilebtnInit icon iconfont icon-delete"></a></li>';
            //创建文件对象
            var ZXXFILE = {
                fileInput: fileInputButton.get(0), //html file控件
                upButton: null, //提交按钮
                //url: option.url, //ajax地址
                fileFilter: [], //过滤后的文件数组
                filter: function (files) { //选择文件组的过滤方法
                    var arr = [];
                    var typeArray = formatFileType(option.fileTypeExts);
                    if (!typeArray) {
                        for (var i in files) {
                            if (files[i].constructor == File) {
                                if ((Math.round(files[i].size * 100 / 1024) / 100) > option.fileSizeLimit&&option.fileSizeLimit>0) {
                                    alert('文件大小超出限制！');
                                    fileInputButton.val('');
                                } else {
                                    arr.push(files[i]);
                                }
                            }
                        }
                    } else {
                        for (var i in files) {
                            if (files[i].constructor == File) {
                                if ($.inArray(files[i].type, typeArray) >= 0) {
                                    if ((Math.round(files[i].size * 100 / 1024) / 100) > option.fileSizeLimit && option.fileSizeLimit > 0) {
                                        alert('文件大小超出限制！');
                                        fileInputButton.val('');
                                    } else {
                                        arr.push(files[i]);
                                    }
                                } else {
                                    alert('文件类型不允许！');
                                    fileInputButton.val('');
                                }
                            }
                        }
                    }
                    return arr;
                },
                //文件选择后
                onSelect: option.onSelect || function (files) {
                    var itemTemplate = '<li id="${fileID}file"><span class="filename"><a href="" target="_blank">${fileName}</a></span><span class="progressnum">0/${fileSize}</span><a class="uploadbtn icon iconfont icon-upload"></a><a class="delfilebtn icon iconfont icon-delete"></a><div class="progress"><div class="progressbar"></div></div></li>'; //上传队列显示的模板,最外层标签使用<li>
                    var itemTemplate_auto = '<li id="${fileID}file"><span class="filename"><a href="" target="_blank">${fileName}</a></span><span class="progressnum">0/${fileSize}</span><a class="delfilebtn icon iconfont icon-delete"></a><div class="progress"><div class="progressbar"></div></div></li>'; //上传队列显示的模板,最外层标签使用<li>
					
                    for (var i = 0; i < files.length; i++) {
 
                        var file = files[i];
						
                        var html = option.auto?itemTemplate_auto:itemTemplate;
                        //处理模板中使用的变量
                        html = html.replace(/\${fileID}/g, file.index).replace(/\${fileName}/g, file.name).replace(
                            /\${fileSize}/g, formatFileSize(file.size));
                        uploadFileList.append(html);
                        //判断是否是自动上传
                        if (option.auto) {
                            ZXXFILE.funUploadFile(file);
                        }
						//为删除文件按钮绑定删除文件事件
                        $('#' + file.index + 'file').children('.delfilebtn').bind('click', function () {
							var index = parseInt($(this).parents('li').attr('id'));
							ZXXFILE.funDeleteFile(index);
						});
                    }
 
                    //如果配置非自动上传，绑定上传事件
                    if (!option.auto) {
                        _this.find('.uploadbtn').bind('click', function () {
                            var index = parseInt($(this).parents('li').attr('id'));
                            ZXXFILE.funUploadFile(getFile(index, files));
                        });
                    }
                    
 
                },
                //文件删除后
                onDelete: function (index) {
                    _this.find('#' + index + 'file').fadeOut(function(){
						 _this.find('#' + index + 'file').remove();
					});
                },
                onProgress: function (file, loaded, total) {
                    var eleProgress = _this.find('#' + file.index + 'file .progress'),
                        percent = (loaded / total * 100).toFixed(2) + '%';
                    eleProgress.find('.progressbar').css('width', percent);
                    if (total - loaded < 500000) {
                        loaded = total;
                    } //解决四舍五入误差
                    eleProgress.parents('li').find('.progressnum').html(formatFileSize(loaded) + '/' + formatFileSize(
                        total));
                }, //文件上传进度
                onUploadSuccess: option.onUploadSuccess, //文件上传成功时
                onUploadError: option.onUploadError, //文件上传失败时,
                onUploadComplete: option.onUploadComplete, //文件全部上传完毕时
                onSelectedFiles:option.onSelectedFiles,
                /* 开发参数和内置方法分界线 */
 
                //获取选择文件，file控件或拖放
                funGetFiles: function (e) {
                    // 获取文件列表对象
                    var files = e.target.files || e.dataTransfer.files;
                    if (files.length + _this.find('.filelist li').length > option.maxQueue) {
                        alert('超过允许的最大上传数');
                        return;
                    }
                    if (!ZXXFILE.onSelectedFiles(files))
                        return;
                    //继续添加文件
                    files = this.filter(files)
                    this.fileFilter.push(files);
                    this.funDealFiles(files);
                    return this;
                },
 
                //选中文件的处理与回调
                funDealFiles: function (files) {
                    var fileCount = _this.find('.filelist li').length; //队列中已经有的文件个数
					for (var j = 0; j < files.length; j++) {
						var file = this.fileFilter[this.fileFilter.length-1][j];
						//增加唯一索引值
						file.index = ++fileCount;
					}
                    //执行选择回调
                    this.onSelect(files);
                    return this;
                },
 
                //删除对应的文件
                funDeleteFile: function (index) {
					
                    for (var i = 0; i < this.fileFilter.length; i++) {
                        for (var j = 0; j < this.fileFilter[i].length; j++) {
                            var file = this.fileFilter[i][j];

                            if (file.index == index) {
                                this.fileFilter[i].splice(j, 1);
                                this.onDelete(index);
								if(this.fileFilter[i].length==0)
									this.fileFilter.splice(i,1);
                            }
                        }
                    }
                    return this;
                },
 
                //文件上传
                funUploadFile: function (file) {
                    var self = this;
                    (function (file) {                      
                        var xhr = new XMLHttpRequest();
                        if (xhr.upload) {
                            // 上传中
                            xhr.upload.addEventListener("progress", function (e) {
                                self.onProgress(file, e.loaded, e.total);
                            }, false);
 
                            // 文件上传成功或是失败
                            xhr.onreadystatechange = function (e) {
                                if (xhr.readyState == 4) {
                                    if (xhr.status == 200) {
                                        self.onUploadSuccess(file, xhr.responseText);
                                        setTimeout(function () {
                                            $('#' + file.index + 'file').children('.progress,.progressnum').remove();
                                        }, option.removeTimeout);
                                        $('#' + file.index + 'file').children('.filename').children('a').attr('href', xhr.responseText);
                                        self.onUploadComplete(file, xhr.responseText);
 
                                    } else {
                                        self.onUploadError(file, xhr.responseText);
                                    }
                                    fileInputButton.val('');
                                }
                            };
 
                            option.onUploadStart(file);
                            // 开始上传
                            //xhr.open("POST", self.url, true);
                            xhr.open("POST", option.basePath + "/upload.ashx", true);
                            //xhr.setRequestHeader("X_FILENAME", file.name);
                            var formData = new FormData();
                            formData.append('fileData', file);
                            for (var item in option.formData) {
                                formData.append(item, option.formData[item]);
                            }
                            formData.append('savePath', option.savePath);
                            formData.append('saveFileNameTemplate', option.saveFileNameTemplate);
                            xhr.send(formData);
                        }
                    })(file);
                },
 
                init: function () {
                    var self = this;
 
                    //文件选择控件选择
                    if (this.fileInput) {
                        this.fileInput.addEventListener("change", function (e) {
                            self.funGetFiles(e);
                        }, false);
                    }
 
                    //点击上传按钮时触发file的click事件
                    _this.find('.uploadfilebtn').bind('click', function () {
                        _this.find('.uploadfile').trigger('click');
                    });
                    option.onInit();
                    //初始化队列
                    var _str = "";
                    $.each(option.initQueue, function (index, item) {
                        _str += itemTemplate_init.replace(/\${fileName}/g, item.name).replace(
                            /\${filePath}/g, item.path);
                    });
                    _this.children('ul').append(_str);
                    _this.find('.delfilebtnInit').bind('click', function () {
                        var li = $(this).parents('li');
                        li.fadeOut(function () {
                            li.remove();
                        });
                    });
                }
            };
            //初始化文件对象
            ZXXFILE.init();
        });
       
    }
 
})(jQuery)