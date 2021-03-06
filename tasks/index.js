/*
 * grunt-file-package
 * https://github.com/robinma/grunt-file-package
 *
 * Copyright (c) 2014 robinma
 * Licensed under the MIT license.
 */

'use strict';

var path=require('path');
var fs=require('fs');
//var targz = require('tar.gz');

module.exports = function(grunt) {
//files automatic make package and make zip
    var emptyline=/^\s*$/ig;
    var dubline=/^\/\/.*$/g;
    var sespace=/(^\s*)|(\s*$)/g;
    //get file name for path
    var getFileName=function(sp){
        //var bname=path.basename(sp);
        var extname=path.extname(sp);

        return path.basename(sp,extname);
    };
    //整理文件内容
    var filterFiles=function(filepath,newFileDir){
        //读取文件内容
        var fileContent=grunt.file.read(filepath);
        //将每行内容作为一条记录装到数组中
        var filesArr=fileContent.split(grunt.util.linefeed);
        //遍历每行文件名
        filesArr.forEach(function(filepathitem){
            if(emptyline.test(filepathitem) || dubline.test(filepathitem)) return false;
            filepathitem=filepathitem.replace(sespace,'');
            var srcfilepath=filepathitem.split('\\').join('\\')
            //if srcfilepath is null or empty space
            if(!srcfilepath) return false;
            if(grunt.file.exists(srcfilepath)){
                grunt.log.ok('Source file "'+ srcfilepath + '" ok.');
                var newFilePath;
                //判断文件类型
                if(grunt.file.isDir(srcfilepath)){
                    grunt.file.recurse(srcfilepath,function(abspath,rootdir,subdir,filename){
                       newFilePath=path.join(newFileDir,abspath)
                       copyFile(abspath,newFilePath);
                       grunt.log.ok('--subdir file "'+ abspath + '"ok.');

                    });
                }else if(grunt.file.isFile(srcfilepath)){
                    newFilePath=path.join(newFileDir,srcfilepath)
                    copyFile(srcfilepath,newFilePath);
                }

            }else{
                grunt.log.warn('Source file "'+ srcfilepath + '" not found.');
                return false;

            }
    
        });

    },
    //复制文件到指定文件夹
    copyFile=function(srcfilepath,newFilePath){
        grunt.file.copy(srcfilepath,newFilePath)
    };

    //make zip package
    var makeZip=function(newFileDir,done){

        var perPath=path.resolve(newFileDir,'../');
        //get dirfileName
        var dirfileName=getFileName(newFileDir);

       var compress=new targz().compress(newFileDir,path.join(perPath,dirfileName+'.zip'),function(err){
            if(err)
                console.log('err',err)
            done(compress);
       })
    }
    //get current time strings examplate name-20140626958
    var getCurrentTimeString=function(){
        var date=new Date();
        var str=date.getFullYear();
        str+=date.getMonth()+1;
        str+=date.getDate();
        str+=date.getHours();
        str+=date.getMinutes();
        str+=date.getSeconds();
        return str;
    }

  grunt.registerMultiTask('file_package', 'files automatic package tools', function(arg1,arg2) {

    //获取文件夹下所有文件
    var srcpath=this.data.src;
    if(srcpath  === '' && !srcpath){
        grunt.log.error('src path error !');
        return false;
    }
    //dest exists
    var destpath=this.data.dest;
    if(!destpath){
        grunt.log.error('dest path not exists');
        return false;
    }
    //if dest path not exists,create the path
    if(!grunt.file.exists(destpath)){
        grunt.file.mkdir(destpath);
    };

    var done=this.async();

    this.files.forEach(function(f){
        var src=f.src.filter(function(filepath){
            if(!grunt.file.exists(filepath)){
                grunt.log.warn('Source file '+ filepath + 'not found.');
                return false;
            }else{
                return true;
            }
        }).map(function(filepath){
            var newpackagename=getFileName(filepath)+'-'+getCurrentTimeString();
            var newFileDir=path.join(destpath,newpackagename);
            console.log(newFileDir)
            grunt.file.exists(newFileDir)?'':grunt.file.mkdir(newFileDir);
            
            filterFiles(filepath,newFileDir);

            //make zip
           // makeZip(newFileDir,done)

        });        
    });

  });

};