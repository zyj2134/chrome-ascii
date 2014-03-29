/*
 * (´･ω･`)无聊之作，随屏幕滚动，工具条自动收缩和展开功能（收缩自如）
 * 作者：左右君
 * 邮箱：zyj3421@qq.com
 * 日期：2014年2月6日
 */
// 全局对象
var header = document.getElementById("header");//头部工具条
var spread = document.getElementById("spread");//点击展开
var screenWidth = window.screen.width;//屏幕宽度
var isOpen = true;//工具条默认为展开
var minWidth = 8;//收缩后工具条的最小宽度
var interval = 30;//间隔时间
var turnOnAnime;//展开动画对象
var turnOffAninme;//收缩动画对象
var changedWidth;// 每次变化后的宽度

var t;//当前时间
var b;//初始值
var c;//变化量
var d;//持续时间步长

// 点击展开工具条
spread.onclick = turnOn;

// 神展开
turnOnAnime = createAnime(function (framespan, fps) {
	// 每次的变化量采用Tween算法
	changedWidth = header.offsetWidth + (Tween.Expo.easeIn(d, t, b, c) + 0.5) >> 0;
	if (changedWidth < screenWidth) {
		header.style.width = changedWidth + "px";
		t++;
	} else {
		header.style.width = screenWidth + "px";
		// 展开到屏幕宽度，停止展开动画
		if (turnOnAnime) {
			turnOnAnime.stop();
		}
	}
});

// 收缩
turnOffAnime = createAnime(function (framespan, fps) {
	// 每次的变化量采用Tween算法
	changedWidth = header.offsetWidth - (Tween.Expo.easeOut(d, t, b, c) + 0.5) >> 0;
	if (changedWidth > minWidth) {
		header.style.width = changedWidth + "px";
		t++;
	} else {
		header.style.width = minWidth + "px";
		// 收缩到最小值，停止收缩动画
		if (turnOffAnime) {
			turnOffAnime.stop();
		}
		// 显示展开按钮
		spread.style.display = "block";
	}
});
// 收缩工具条
function turnOff() {
	// 工具条收缩中
	isOpen = false;
	// 停止展开动画
	if (turnOnAnime) {
		turnOnAnime.stop();
	}
	// 每次计数清零
	t = 0;
	// 收缩时，初始值为屏幕宽度-当前工具条宽度
	b = screenWidth - header.offsetWidth;
	// 变化量宽度屏幕宽度-最小宽度-初始值
	c = screenWidth - minWidth - b;
	// DOM操作
//	c = header.offsetWidth - minWidth
	// 取整
	d = (c / interval + 0.5) >> 0;
	// 开始收缩动画
	turnOffAnime.start();
}

// 展开工具条
function turnOn() {
	// 工具条展开中
	isOpen = true;
	// 停止收缩动画
	if (turnOffAnime) {
		turnOffAnime.stop();
	}
	// 隐藏展开按钮
	spread.style.display = "none";
	// 每次计数清零
	t = 0;
	// 展开时，初始值为当前工具条宽度
	b = header.offsetWidth;
	// 变化量屏幕宽度-初始值
	c = screenWidth - b;
	// 取整
	d = (c / interval + 0.5) >> 0;
	//开始展开动画
	turnOnAnime.start();
}

// 屏幕滚动
window.onscroll = function() {
	//取网页卷上去的高度
	var h = document.documentElement.scrollTop | document.body.scrollTop;
	//当在网页最顶部
	if (h == 0) {
		// 避免左右滚动重复展开
		if (!isOpen) {
			turnOn();
		}
	} else if (h > 0) {
		// 避免多次滚动重复收缩
		if (isOpen) {
			turnOff();
		}
	}
};