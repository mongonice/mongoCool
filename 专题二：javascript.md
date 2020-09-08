# Javascript高频题：

# 1. 防抖和节流实现与应用场景
> 相同点： 都是为了防止连续频繁触发

```

/**
 * 防抖：debounce
 * 理解：连续点击或滚动或resize，不触发事件回调函数执行，直到最后一次触发，才会让回调函数执行
 * 应用场景：倒计时, input联想搜索， resize调整窗口大小只触发最后一次
 *
/
let timer = null;
oInput.oninput = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        // do something
    }, 2000)
}


/**
 * 节流：throttle
 * 理解：连续点击或滚动或resize或输入，回调函数会每隔多长时间触发一次执行
 * 应用场景：防止连续点击，监听scroll滚动，每隔多长时间判断一下是否到达底部
 *
/

let isClicked = 0;
oDiv.onclick = () => {
    if (!!isClicked) return;
    // do something

    isClicked = 1;

    setTimeout(() => {
        isClicked = 0
    }, 2000)
}

```