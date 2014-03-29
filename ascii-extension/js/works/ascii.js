/*
 * (｡•`ω′•)ง少年我看你天赋异禀、骨骼惊奇、相貌不凡、异于常人，来学代码吧
 * 说明：基于HTML5实现视频、图片转字符画，Chrome浏览器播放效果最佳
 * 作者：左右君
 * 邮箱：zyj3421@qq.com
 * 日期：2014年2月3日
 */
// 配置参数
var stepW = 7; //视频宽度缩小stepW倍
var stepH = 8; //视频高度缩小stepH倍
// 全局对象
var offCanvas; //离屏画布
var offctx; //离屏绘图内容
var canvasWidth; //画布宽度
var canvasHeight; //画布高度
var txtDiv; //显示字符内容
var image; //图片预览
var video; //视频
var fileBtn; //文件控件按钮
var fpsTxt; //用于绘制FPS的文字
var url; //链接地址
var anime; //动画对象
var ASCII; //绘制字符画的字符
var characters;//填充字符串对象
var count; //填充字符串长度
var span;// 每段灰度值跨度
var play;// 暂停、播放按钮对象
var stop;// 停止、清空按钮对象
var intState = false; //画布大小初始化状态、播放状态控制

// 页面加载
window.onload = function() {
	init();
	// 改变文件
	fileBtn.onchange = onInputFileChange;
	// 改变填充字符
	characters.onchange = onSelectASCIIChange;
	// 播放、暂停
	play.onclick = function() {
		// 改变按钮文字
		if (intState) {
			video.pause();
			play.value = "播放";
		} else {
			video.play();
			play.value = "暂停";
		}
		intState = !intState;
	}
	// 停止、清空
	stop.onclick = function() {
		fileBtn.value = "";
		clear();
	}
}

// 初始化
function init() {
	// 生成离屏画布
	offCanvas = document.createElement("canvas");
	// 不支持HTML5或者是IE9浏览器的
//	if (!offCanvas.getContext || window.navigator.userAgent.indexOf("MSIE 9.0") >= 1) {
//		alert("(╯°皿° )╯┴──┴你的浏览器不适合浏览本网站！\n" +
//			"为了达到最佳浏览效果,请使用以下浏览器访问此网站：\n" +
//			"IE 10.0及以上版本\n" +
//			"Chrome 19.0及以上版本\n" +
//			"Firefox 4.0及以上版本\n" +
//			"Opera 10.0及以上版本\n" +
//			"或最新版的Safari、360浏览器、傲游浏览器、搜狗浏览器等浏览器\n" +
//			"(๑•̀ㅂ•́)و✧推荐使用最新版的Chrome 浏览器");
		// 直接关闭窗口没商量
//		window.opener = null;
//		window.open(' ', '_self', ' ');
//		window.close();
//	} else {
		txtDiv = document.getElementById('txt');
		image = document.getElementById("image");
		video = document.getElementById("video");
		fileBtn = document.getElementById("file");
		fpsTxt = document.getElementById("fps");
		offctx = offCanvas.getContext('2d');
		characters = document.getElementById("characters");
		play = document.getElementById("play");
		stop = document.getElementById("stop");
//	}
}

// 改变填充字符
function onSelectASCIIChange() {
	// 这是输出字符画用的字符
	// 越靠前的字符对应越深的颜色（所以最后一个是空格，最亮，纯白）
//	ASCII = "M80V1;:*-. ";
//	ASCII = "█▓▒░";
	ASCII = characters.value;
	count = ASCII.length;
	span = 0xFF / count; // 灰度值 [0,255]
}

// 改变文件后
function onInputFileChange() {
	clear();
	var file = fileBtn.files[0];
	// 未选择文件，不做任何操作
	if (!file) {
		return false;
	}
	// 不是已知视频、图片、音频格式，mkv格式文件类型为空
	// 但已知Chrome支持mkv、Opera支持部分mkv，FireFox未知，和视频编码有关，虽然没声音，还是先加上
	if (!/^.+\.mkv$/.test(file.name) && !/(image|video|audio)\/\w+/.test(file.type)) {
		alert("╮(╯_╰)╭该文件格式不支持。");
		fileBtn.value = "";
		return false;
	} else if (!/^.+\.mkv$/.test(file.name) && /(video|audio)\/\w+/.test(file.type) && video.canPlayType(file.type) == "") {
		// 判断浏览器是否支持当前视频/音频格式
		alert("o((>ω<))o您的浏览器可能还不支持该文件格式。");
		fileBtn.value = "";
		return false;
	}
	// 获取object URL
	handleFile(file);
	onSelectASCIIChange();
	// 视频
	if (/video\/\w+/.test(file.type) || /^.+\.mkv$/.test(file.name)) {
//		fpsTxt.innerHTML = "加载中...";
		video.src = url;
		// 当视频能够不停顿地一直播放
		video.oncanplaythrough = function() {
			// 初始化画布大小
			initSize(video);
			// 创建动画
			anime = createAnime(convAnime);
			anime.start();
		}
		// 显示按钮控件
		play.style.visibility = "visible";
		stop.style.visibility = "visible";
		// 动态图
	} else if (/image\/gif/.test(file.type)) {
		image.src = url;
		// 图片加载完成
		image.onload = function() {
			initSize(image);
			anime = createAnime(convImage);
			anime.start();
		}
		stop.value = "清空";
		stop.style.visibility = "visible";
		// 静态图
	} else if (/image\/\w+/.test(file.type)) {
		image.src = url;
		image.onload = function() {
			initSize(image);
			// 转换
			converter(image)
		};
		stop.value = "清空";
		stop.style.visibility = "visible";
		// 音频
	} else if (/audio\/\w+/.test(file.type)) {
		video.src = url;
		intState = true;
		play.style.visibility = "visible";
		stop.style.visibility = "visible";
	}
}

// 获取文件本地URL
function handleFile(file) {
	window.URL = window.URL || window.webkitURL;
	url = "";
	if (window.URL) {
		url = URL.createObjectURL(file); // 创建一个object URL，并不是你的本地路径
	} else if (window.FileReader) {
		// opera不支持createObjectURL/revokeObjectURL方法。使用FileReader对象来处理
		var reader = new FileReader();
		reader.readAsDataURL(file);
		url = reader.result;
	}
}

// 根据灰度生成相应字符
function toText(gray) {
	var cidx = (gray / span) << 0; // 数据左移0位，将浮点数转换成整数形式返回。
	if (cidx == count) {
		cidx--;
	}
//	if(ASCII[cidx]==" "){
//	}
	return ASCII[cidx];
}

// 根据rgb值计算灰度
function getGray(r, g, b) {
	return (299 * r + 578 * g + 114 * b) / 1000;
}

// 初始化画布大小
function initSize(obj) {
	canvasWidth = obj.width | obj.videoWidth;
	canvasHeight = obj.height | obj.videoHeight;
	// 处理超出屏幕分辨率
	if(canvasHeight > window.screen.height - 90){
//		canvasWidth = canvasWidth * (window.screen.height - 90) / canvasHeight;// 等比例缩小
		// 边缘留空
		canvasHeight = window.screen.height - 90;
	}
	if(canvasWidth > window.screen.width - 30){
//		canvasHeight = canvasHeight * (window.screen.width - 30) / canvasWidth;
		canvasWidth = window.screen.width - 30;
	}
	txtDiv.style.width = (canvasWidth << 0) + 'px';
	// 尽量缩小画布的大小
	canvasWidth = (canvasWidth / stepW) << 0;
	canvasHeight = (canvasHeight / stepH) << 0;
	offCanvas.width = canvasWidth;
	offCanvas.height = canvasHeight;
	intState = true;
}

// 转换动态图片
function convImage(framespan, fps) {
	if (intState) {
		converter(image);
	}
}

// 转换视频
function convAnime(framespan, fps) {
	if (intState) {
		// 转换
		converter(video);
		// 显示帧数
		fpsTxt.innerHTML = "FPS:" + fps;
	}
}

// 将视频图片对象转换为字符
function converter(obj) {
//	console.time('绘制一帧时间'); // 测试js执行时间开始位置，参数作为前缀输出，console.time()同console.timeEnd()配套使用，参数必须一致！
//	offctx.drawImage(obj, 0, 0);
	offctx.drawImage(obj, 0, 0, canvasWidth, canvasHeight);
//	console.log(offCanvas.toDataURL());
//	image.src = offCanvas.toDataURL();
	// 图像对象的getImageData 方法返回一个对象，每个像素点的 rgba 值都保存在其 data 属性下面
	var imgData = offctx.getImageData(0, 0, canvasWidth, canvasHeight);
	var imgDataArr = imgData.data;
	var preTxt = ''; // 一幅图的字符内容拼接
	// 横向1px，纵向1px取像素转字符
	for ( var h = 0; h < canvasHeight; h++) {
		var index;
		var r, g, b; // 图片的rgb值
		var gray; // 计算灰度
		for ( var w = 0; w < canvasWidth; w++) {
			// 在取每个像素点的 rgba 值的时候，其index应该在像素点的索引值上乘以 4
			index = (w + canvasWidth * h) * 4;
			r = imgDataArr[index + 0];
			g = imgDataArr[index + 1];
			b = imgDataArr[index + 2];
//			a = imgDataArr[index + 3];// 透明度Alpha
			gray = getGray(r, g, b);
			preTxt += toText(gray);
		}
		preTxt += '\n';
	}
	// 使用pre标签显示字符
	txtDiv.innerHTML = '<pre>' + preTxt + '</pre>';
//	console.timeEnd('绘制一帧时间'); // 测试js执行时间结束位置
}

// 停止动画、清空文本
function clear() {
	// 停止绘制字符画
	if (anime) {
		anime.stop();
		anime = undefined;
	}
	if (window.URL) {
		URL.revokeObjectURL(url); // 吊销所有使用 URL.createObjectURL 而创建的 URL，以避免内存泄漏
	}
	// 清空图片
	image.src = "";
	// 删除事件处理函数
	image.onload = null;
	// 清空视频、音频
	video.src = "";
	video.oncanplaythrough = null;
	// 清空显示的FPS
	fpsTxt.innerHTML = "";
	// 清空字符画内容
	txtDiv.innerHTML = "";
	// 重置画布大小初始化状态
	intState = false;
	// 显示暂停并隐藏
	play.value = "暂停";
	play.style.visibility = "hidden";
	// 显示停止并隐藏
	stop.value = "停止";
	stop.style.visibility = "hidden";
}