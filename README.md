# Chatroom

一个支持语音，图片发送并在移动端可用的公共聊天室

[http://47.106.66.80/](http://47.106.66.80/)

## 功能

- 图片发送支持粘贴，拖拽，上传并会按照光标在合适的位置插入图片，发送时在前端进行压缩，可以混合文本发送

- 语音支持试听，因语音文件过大录音时长不得超过15s，webkit内核出于安全考虑不允许在http下使用语音，chrome浏览器按照以下操作可以使用录音

	- 在谷歌浏览器的安装目录下(一般是C:\Program Files (x86)\Google\Chrome\Application)找到chrome.exe
	- 右键点击该exe文件，点击发送到,点击桌面快捷方式
	- 在C盘下建立ChromeTempFiles文件夹
	- 右键点击快捷方式，点击属性，在快捷方式标签页下修改目标值为`"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\ChromeTempFiles" --unsafely-treat-insecure-origin-as-secure=http://47.106.66.80`
	- 用快捷方式启动chrome即可
	- 如果还是不行，请移步这篇[回答](https://stackoverflow.com/questions/40696280/unsafely-treat-insecure-origin-as-secure-flag-is-not-working-on-chrome)


