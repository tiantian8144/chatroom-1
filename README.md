# Chatroom

一个支持语音，图片发送并在移动端可用的公共聊天室

[示例地址](http://47.106.66.80)

## 图片

- 图片发送支持粘贴，拖拽，本地文件上传三种方式

- 会按照光标在合适的位置插入图片，因为服务器较小所以图片发送时会在前端进行压缩，可以混合文本发送

- 在移动端提供基于AlloyFinger手势库的图片查看功能，PC端也可查看图片

## 语音

- Chrome,Safari,Opera均不支持在非安全来源网站(例如http)下使用录音API，目的在于避免网站含有恶意录音的脚本代码获取用户隐私。IE不支持录音，所以http下可用录音功能的浏览器只有Firefox了。但是chrome可以用以下步骤越过此限制:

	- 在谷歌浏览器的安装目录下(一般是C:\Program Files (x86)\Google\Chrome\Application)找到chrome.exe
	- 右键点击该exe文件，点击发送到,点击桌面快捷方式
	- 在C盘下建立ChromeTempFiles文件夹
	- 右键点击快捷方式，点击属性，在快捷方式标签页下修改目标值为`"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\ChromeTempFiles" --unsafely-treat-insecure-origin-as-secure=http://47.106.66.80`
	- 用快捷方式启动chrome即可
	- 如果还是不行，请移步这篇[回答](https://stackoverflow.com/questions/40696280/unsafely-treat-insecure-origin-as-secure-flag-is-not-working-on-chrome)

- 录音支持试听，由于大小限制，录音时长不得超过15s


