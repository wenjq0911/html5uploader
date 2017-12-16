<%@ WebHandler Language="C#" Class="Upload" %>
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

public class Upload : IHttpHandler
{
    public void ProcessRequest(HttpContext context)
    {
        //context.Response.ContentType = "text/plain";
        //context.Response.Write("Hello World");
        HttpPostedFile fileData = context.Request.Files[0];
        string savePath = context.Request.Form["savePath"];
        string saveNameTemplate = context.Request.Form["saveFileNameTemplate"];

        if (context.Request.Files!=null && context.Request.Files.Count>0&& context.Request.Files[0]!= null)
        {
            try
            {
                context.Request.ContentEncoding = Encoding.GetEncoding("UTF-8");
                context.Response.ContentEncoding = Encoding.GetEncoding("UTF-8");
                context.Response.Charset = "UTF-8";

                // 文件上传后的保存路径
                string filePath = context.Server.MapPath(savePath);
                string fileName = Path.GetFileName(fileData.FileName);      //原始文件名称
                string saveName = saveNameTemplate.Replace("${prefix}",DateTime.Now.ToString("yyyyMMddHHmmssfff")).Replace("${fileName}", fileName); //保存文件名称
                if (!Directory.Exists(filePath))//返回保存的路径是否存在文件夹
                {
                    Directory.CreateDirectory(filePath);
                }
                fileData.SaveAs(Path.Combine(filePath, saveName));
                context.Response.Write(Path.Combine(savePath,saveName));
            }
            catch (Exception e)
            {
                context.Response.Write("false");
            }
        }
        else
        {
            context.Response.Write("false");
        }
    }
    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}