const CACHE_EXPIRATION_TIME = 12 * 60 * 60 * 1000;  // 缓存过期时间，12小时
// 随机文章js
const anxy = {
    getRandomElementsFromArray: function(arr, num) {
        const shuffled = arr.sort(() => 0.5 - Math.random()); // 打乱数组顺序
        return shuffled.slice(0, num); // 返回前num个元素
    },

    renderingPosts: function(data) {
        const randomElements = anxy.getRandomElementsFromArray(data, 4);
        const postsHtml = randomElements.map((i) => `
            <div class="post_item">
                <a class="post_box" title="${i.title}" href="${i.link}" onclick="pjax.loadUrl('${i.link}')">
                    <div class="post-info">
                        <p class="post-title">${i.title}</p>
                        <div class="info-box">
                            <span>${i.time}</span>
                            <span style="margin: 0 6px">|</span>
                            <span>${i.categories}</span>
                        </div>
                    </div>
                    <p class="post_description">${i.description}</p>
                </a>
            </div>`).join('');

        const randomList = document.querySelector(".banner-random>.random-list");
        if (randomList) {
            randomList.innerHTML = postsHtml;
        }
    },

    loadData: function() {
        fetch("/articles-random.json")
            .then(res => res.ok ? res.json() : Promise.reject('请求失败'))
            .then(data => {
                sessionStorage.setItem("postsInfo", JSON.stringify(data));
                sessionStorage.setItem("postsInfoTimestamp", Date.now());
                anxy.renderingPosts(data);
                console.log("随机文章加载成功");
            })
            .catch(err => {
                console.error("随机文章加载失败:", err);
                setTimeout(anxy.loadData, 3000);  // 错误时重试
            });
    },

    RandomPosts: function() {
        const cachedData = sessionStorage.getItem("postsInfo");
        const cachedTimestamp = sessionStorage.getItem("postsInfoTimestamp");

        if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_EXPIRATION_TIME)) {
            try {
                anxy.renderingPosts(JSON.parse(cachedData));
            } catch (e) {
                console.error("缓存数据解析失败:", e);
                anxy.loadData();  // 如果解析失败，重新加载数据
            }
        } else {
            anxy.loadData();  // 缓存无效或不存在时，加载新数据
        }
    }
};

// 页面加载时加载随机文章
window.addEventListener('load', function() {
    anxy.RandomPosts();  // 确保在页面完全加载后执行
});

// 初始化 pjax
const pjax = new Pjax({
    elements: 'a',
    selectors: ['#pjax-container'],
    cache: true,
    history: true,
    scrollTo: false,
    transition: 'fade',
    transitionTime: 300
});

document.addEventListener('pjax:complete', function () {
    setTimeout(() => anxy.RandomPosts(), 500);  // 等待500ms再渲染随机文章，确保内容渲染完毕
});

// 切换背景弹窗版
// 存数据
// name：命名 data：数据
function saveData(name, data) {
    localStorage.setItem(name, JSON.stringify({ 'time': Date.now(), 'data': data }))
}

// 取数据
// name：命名 time：过期时长,单位分钟,如传入30,即加载数据时如果超出30分钟返回0,否则返回数据
function loadData(name, time) {
    let d = JSON.parse(localStorage.getItem(name));
    // 过期或有错误返回 0 否则返回数据
    if (d) {
        let t = Date.now() - d.time
        if (t < (time * 60 * 1000) && t > -1) return d.data;
    }
    return 0;
}

// 上面两个函数如果你有其他需要存取数据的功能，也可以直接使用

// 读取背景
try {
    let data = loadData('blogbg', 1440)
    if (data) changeBg(data, 1)
    else localStorage.removeItem('blogbg');
} catch (error) { localStorage.removeItem('blogbg'); }

// 切换背景函数
// 此处的flag是为了每次读取时都重新存储一次,导致过期时间不稳定
// 如果flag为0则存储,即设置背景. 为1则不存储,即每次加载自动读取背景.
function changeBg(s, flag) {
    let bg = document.getElementById('web_bg')
    if (s.charAt(0) == '#') {
        bg.style.backgroundColor = s
        bg.style.backgroundImage = 'none'
    } else bg.style.backgroundImage = s
    if (!flag) { saveData('blogbg', s) }
}

// 以下为2.0新增内容

// 创建窗口
var winbox = ''

function createWinbox() {
    let div = document.createElement('div')
    document.body.appendChild(div)
    winbox = WinBox({
        id: 'changeBgBox',
        index: 999,
        title: "切换背景",
        x: "center",
        y: "center",
        minwidth: '300px',
        height: "60%",
        background: '#49b1f5',
        onmaximize: () => { div.innerHTML = `<style>body::-webkit-scrollbar {display: none;}div#changeBgBox {width: 100% !important;}</style>` },
        onrestore: () => { div.innerHTML = '' }
    });
    winResize();
    window.addEventListener('resize', winResize)
    // 每一类我放了一个演示，直接往下复制粘贴 a标签 就可以，需要注意的是 函数里面的链接 冒号前面需要添加反斜杠\进行转义
    winbox.body.innerHTML = `
    <div id="article-container" style="padding:10px;">

    <div class="note info flat">
        点击对应样式即可切换背景。
    </div>

    <div class="note success flat">
        有效期为一天，到期切回默认壁纸。
    </div>

    <p><button onclick="localStorage.removeItem('blogbg');location.reload();" style="background:#5fcdff;display:block;width:100%;padding: 15px 0;border-radius:6px;color:white;"><i class="fa-solid fa-arrows-rotate"></i> 点我恢复默认背景</button></p>
    <h2 id="图片"><a href="#图片" class="headerlink" title="图片"></a>图片</h2>
     <details class="toggle" style="background-color:white; border: 2px solid black; border-radius: 5px;">
         <summary class="toggle-button" style="padding: 10px; cursor: pointer; font-weight: bold;">查看电脑壁纸</summary>
         <div class="toggle-content">
             <div class="bgbox">
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/dd4aee16880411ebb6edd017c2d2eca2.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/dd4aee16880411ebb6edd017c2d2eca2.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/66a0f1473a0f4ae7850ac8607774eb03.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/66a0f1473a0f4ae7850ac8607774eb03.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/058fe486bd784f28875a7a01f68d09de.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/058fe486bd784f28875a7a01f68d09de.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/c9d3deb2880411ebb6edd017c2d2eca2.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/c9d3deb2880411ebb6edd017c2d2eca2.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/0d73ff1af5c149c2af78a4c7280c9ac9.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/0d73ff1af5c149c2af78a4c7280c9ac9.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/08206a3879f9467f93eb18e279dd2642.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/08206a3879f9467f93eb18e279dd2642.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/14d9904fe2ac4961b203c3eb2f2f467f.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/14d9904fe2ac4961b203c3eb2f2f467f.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/f048e9726518419fa15dd365902500c4.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/f048e9726518419fa15dd365902500c4.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/bab9141327ca48e39abef6229b79cf9c.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/bab9141327ca48e39abef6229b79cf9c.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/a26f66658e014e06aa70e2753742bef3.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/a26f66658e014e06aa70e2753742bef3.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/35d9316f450041b89232893f083a57f1.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/35d9316f450041b89232893f083a57f1.webp)')"></a>
                 <a href="javascript:;" style="background-image:url(https://cdn.leonus.cn/other/6143778327db4d17adbb63c0f6c0a8af.webp)" class="imgbox" onclick="changeBg('url(https://cdn.leonus.cn/other/6143778327db4d17adbb63c0f6c0a8af.webp)')"></a>
             </div>
         </div>
     </details>
 </div>
 `;   
}

// 适应窗口大小
function winResize() {
    let box = document.querySelector('#changeBgBox')
    if (!box || box.classList.contains('min') || box.classList.contains('max')) return // 2023-02-10更新
    var offsetWid = document.documentElement.clientWidth;
    if (offsetWid <= 768) {
        winbox.resize(offsetWid * 0.95 + "px", "90%").move("center", "center");
    } else {
        winbox.resize(offsetWid * 0.6 + "px", "70%").move("center", "center");
    }
}

// 切换状态，窗口已创建则控制窗口显示和隐藏，没窗口则创建窗口
function toggleWinbox() {
    if (document.querySelector('#changeBgBox')) winbox.toggleClass('hide');
    else createWinbox();
}

// 博客刷新缓存按钮
function refreshCache() {
    if (confirm('是否确定刷新博文缓存')) location.reload(true)
}

// 欢迎与Cookie弹窗
//首次访问弹窗
if (localStorage.getItem("popWelcomeWindow") !== "0") {
    if (document.referrer === undefined || document.referrer.indexOf("blog.anxy.top") !== -1 || document.referrer.indexOf("anxy.top") !== -1) { //改成自己域名，注意是referrer!!! qwq

    } else {
        localStorage.setItem("popWelcomeWindow", "0");
    }
    Snackbar.show({
        text: '哎嘿，被发现了呢~ (～o￣3￣)～ ',
        pos: 'top-right',
        onActionClick: function (element) {
            window.open("/about")
        },
        actionText: "<span style='color: red;'>关于我</span>", // 设置"关于我"为红色
    });
}
if (sessionStorage.getItem("popCookieWindow") !== "0") {
    setTimeout(function () {
        Snackbar.show({
            text: '本站使用Cookie和本地/会话存储保证浏览体验和网站统计',
            pos: 'bottom-left',
            actionText: "<span style='color: red;'>版权声明</span>", // 设置"版权声明"为红色
            onActionClick: function (element) {
                window.open("/privacy")
            },
        })
    }, 3000)
}
//不在弹出Cookie提醒
sessionStorage.setItem("popCookieWindow", "0");

//自带上文浏览器提示

function browserTC() {
    btf.snackbarShow("");
    Snackbar.show({
        text: '浏览器版本较低，网站样式可能错乱',
        actionText: '关闭',
        duration: '6000',
        pos: 'bottom-left'
    });
}

function browserVersion() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
    var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
    var isEdge = userAgent.indexOf("Edge") > -1 && !isIE; //Edge浏览器
    var isFirefox = userAgent.indexOf("Firefox") > -1; //Firefox浏览器
    var isOpera = userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1; //Opera浏览器
    var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Edge") === -1 && userAgent.indexOf("OPR") === -1; //Chrome浏览器
    var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") === -1 && userAgent.indexOf("Edge") === -1 && userAgent.indexOf("OPR") === -1; //Safari浏览器
    if (isEdge) {
        if (userAgent.split('Edge/')[1].split('.')[0] < 90) {
            browserTC()
        }
    } else if (isFirefox) {
        if (userAgent.split('Firefox/')[1].split('.')[0] < 90) {
            browserTC()
        }
    } else if (isOpera) {
        if (userAgent.split('OPR/')[1].split('.')[0] < 80) {
            browserTC()
        }
    } else if (isChrome) {
        if (userAgent.split('Chrome/')[1].split('.')[0] < 90) {
            browserTC()
        }
    } else if (isSafari) {
        //不知道Safari哪个版本是该淘汰的老旧版本
    }
}

//2022-10-29修正了一个错误：过期时间应使用toGMTString()，而不是toUTCString()，否则实际过期时间在中国差了8小时
function setCookies(obj, limitTime) {
    let data = new Date(new Date().getTime() + limitTime * 24 * 60 * 60 * 1000).toGMTString()
    for (let i in obj) {
        document.cookie = i + '=' + obj[i] + ';expires=' + data
    }
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

if (getCookie('browsertc') !== 1) {
    setCookies({
        browsertc: 1,
    }, 1);
    browserVersion();
}

// 右键菜单魔改
function setMask() {//设置遮罩层
    if (document.getElementsByClassName("rmMask")[0] !== undefined) {
        return document.getElementsByClassName("rmMask")[0];
    }
    mask = document.createElement('div');
    mask.className = "rmMask";
    mask.style.width = window.innerWidth + 'px';
    mask.style.height = window.innerHeight + 'px';
    mask.style.background = '#fff';
    mask.style.opacity = '.0';
    mask.style.position = 'fixed';
    mask.style.top = '0';
    mask.style.left = '0';
    mask.style.zIndex = 998;
    document.body.appendChild(mask);
    document.getElementById("rightMenu").style.zIndex = 19198;
    return mask;
}

function insertAtCursor(myField, myValue) {
    //IE 浏览器
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
        sel.select();
    }
    //FireFox、Chrome等
    else if (myField.selectionStart || myField.selectionStart === '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        // 保存滚动条
        var restoreTop = myField.scrollTop;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        if (restoreTop > 0) {
            myField.scrollTop = restoreTop;
        }
        myField.focus();
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } else {
        myField.value += myValue;
        myField.focus();
    }
}

let rmf = {};
rmf.showRightMenu = function (isTrue, x = 0, y = 0) {
    let $rightMenu = $('#rightMenu');
    $rightMenu.css('top', x + 'px').css('left', y + 'px');

    if (isTrue) {
        $rightMenu.show();
    } else {
        $rightMenu.hide();
    }
}

rmf.copyWordsLink = function () {
    const decodedUrl = decodeURIComponent(window.location.href); // 解码 URL
    navigator.clipboard.writeText(decodedUrl)
        .then(() => {
            Snackbar.show({
                text: '链接复制成功！快去分享吧！',
                pos: 'top-right',
                showAction: false
            });
        })
}

rmf.scrollToTop = function () {
    document.getElementsByClassName("menus_items")[1].setAttribute("style", "");
    document.getElementById("name-container").setAttribute("style", "display:none");
    btf.scrollToDest(0, 500);
}

rmf.translate = function () {
    document.getElementById("translateLink").click();
}

//复制选中文字
rmf.copySelect = function () {
    navigator.clipboard.writeText(document.getSelection().toString()).then(() => {
        Snackbar.show({
            text: '已复制选中文字！',
            pos: 'top-right',
            showAction: false,
        });
    });
}

document.body.addEventListener('touchmove', function (e) {

}, {passive: false});

function popupMenu() {
    //window.oncontextmenu=function(){return false;}
    window.oncontextmenu = function (event) {
        Snackbar.show({
            text: '按住 Ctrl 再点击右键，即可恢复原界面哦',
            pos: 'bottom-left',
            showAction: false
        });
        if (event.ctrlKey || document.body.clientWidth < 900) return true;
        $('.rightMenu-group.hide').hide();
        if (document.getSelection().toString()) {
            $('#menu-text').show();
        }
        if (document.getElementById('post')) {
            $('#menu-post').show();
        } else {
            if (document.getElementById('page')) {
                $('#menu-post').show();
            }
        }
        var el = window.document.body;
        el = event.target;
        var a = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:\/?#[\]@!$&'*+,;=]+$/
        if (a.test(window.getSelection().toString()) && el.tagName !== "A") {
            $('#menu-too').show()
        }
        if (el.tagName === 'A') {
            $('#menu-to').show()
            rmf.open = function () {
                if (el.href.indexOf("http://") === -1 && el.href.indexOf("https://") === -1 || el.href.indexOf("blog.june-pj.cn") !== -1) {
                    pjax.loadUrl(el.href)
                } else {
                    location.href = el.href
                }
            }
            rmf.openWithNewTab = function () {
                window.open(el.href);
                // window.location.reload();
            }
            rmf.copyLink = function () {
                const url = el.href;
                navigator.clipboard.writeText(url);
                Snackbar.show({
                    text: '链接复制成功！快去分享吧！',
                    pos: 'top-right',
                    showAction: false
                });
            };
        }
        if (el.tagName === 'IMG') {
            $('#menu-img').show()
            rmf.openWithNewTab = function () {
                window.open(el.src);
                // window.location.reload();
            }
            rmf.saveAs = function () {
                var a = document.createElement('a');
                a.href = el.src;
                 // 获取图片的文件名部分
                a.download = el.src.split('/').pop(); // 使用图片的文件名作为下载文件名
                a.style.display = 'none'; // 隐藏下载链接
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            rmf.copyLink = function () {
                const url = el.src
                navigator.clipboard.writeText(url);
                Snackbar.show({
                    text: '链接复制成功！快去分享吧！',
                    pos: 'top-right',
                    showAction: false
                });
            }
        } else if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
            $('#menu-paste').show();
            rmf.paste = function () {
                navigator.permissions
                    .query({
                        name: 'clipboard-read'
                    })
                    .then(result => {
                        if (result.state === 'granted' || result.state === 'prompt') {
                            //读取剪贴板
                            navigator.clipboard.readText().then(text => {
                                console.log(text)
                                insertAtCursor(el, text)
                            })
                        } else {
                            Snackbar.show({
                                text: '请允许读取剪贴板！',
                                pos: 'top-center',
                                showAction: false,
                            })
                        }
                    })
            }
        }
        let pageX = event.clientX + 10;
        let pageY = event.clientY;
        let rmWidth = $('#rightMenu').width();
        let rmHeight = $('#rightMenu').height();
        if (pageX + rmWidth > window.innerWidth) {
            pageX -= rmWidth + 10;
        }
        if (pageY + rmHeight > window.innerHeight) {
            pageY -= pageY + rmHeight - window.innerHeight;
        }
        mask = setMask();
        window.onscroll = () => {
            rmf.showRightMenu(false);
            window.onscroll = () => {
            }
            if (document.body.contains(mask)) {
                document.body.removeChild(mask);
            }
        }

        $(".rightMenu-item").click(() => {
            if (document.body.contains(mask)) {
                document.body.removeChild(mask);
            }
        });

        $(window).resize(() => {
            rmf.showRightMenu(false);
            if (document.body.contains(mask)) {
                document.body.removeChild(mask);
            }
        });

        mask.onclick = () => {
            if (document.body.contains(mask)) {
                document.body.removeChild(mask);
            }
        };

        rmf.showRightMenu(true, pageY, pageX);
        return false;
    };

    window.addEventListener('click', function () {
        rmf.showRightMenu(false);
    });
}

if (!(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
    popupMenu()
}
const box = document.documentElement

function addLongtabListener(target, callback) {
    let timer = 0 // 初始化timer

    target.ontouchstart = () => {
        timer = 0 // 重置timer
        timer = setTimeout(() => {
            callback();
            timer = 0
        }, 380) // 超时器能成功执行，说明是长按
    }

    target.ontouchmove = () => {
        clearTimeout(timer) // 如果来到这里，说明是滑动
        timer = 0
    }

    target.ontouchend = () => { // 到这里如果timer有值，说明此触摸时间不足380ms，是点击
        if (timer) {
            clearTimeout(timer)
        }
    }
}

addLongtabListener(box, popupMenu)


//站点动态 title
var OriginTitile = document.title;
var titleTime;
document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    //离开当前页面时标签显示内容
    document.title = "w(ﾟДﾟ)w 不要走！再看看嘛！";
    clearTimeout(titleTime);
  } else {
    //返回当前页面时标签显示内容
    document.title = "♪(^∇^*)欢迎肥来！" + OriginTitile;
    //两秒后变回正常标题
    titleTime = setTimeout(function () {
      document.title = OriginTitile;
    }, 2000);
  }
});