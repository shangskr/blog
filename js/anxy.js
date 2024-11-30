//随机文章js
const CACHE_EXPIRATION_TIME = 12 * 60 * 60 * 1000;  // 缓存过期时间，12小时

//右侧按钮阅读进度js
window.onscroll = percent;// 执行函数
// 页面百分比
function percent() {
    let a = document.documentElement.scrollTop || window.pageYOffset, // 卷去高度
        b = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight) - document.documentElement.clientHeight, // 整个网页高度
        result = Math.round(a / b * 100), // 计算百分比
        up = document.querySelector("#go-up") // 获取按钮

    if (result <= 95) {
        up.childNodes[0].style.display = 'none'
        up.childNodes[1].style.display = 'block'
        up.childNodes[1].innerHTML = result;
    } else {
        up.childNodes[1].style.display = 'none'
        up.childNodes[0].style.display = 'block'
    }
}

//随机文章js
const anxy = {
    getRandomElementsFromArray: function(arr, num) {
        const totalElements = arr.length;
        const selectedElements = new Set();
        while (selectedElements.size < num) {
            const randomIndex = Math.floor(Math.random() * totalElements);
            selectedElements.add(arr[randomIndex]);
        }
        return Array.from(selectedElements);
    },

    renderingPosts: function(data) {
        const randomElements = anxy.getRandomElementsFromArray(data, 4);
        const postsHtml = randomElements.map((i) => `
        <div class="post_item">
            <a class="post_box" title="${i.title}" href="${i.link}" onclick="pjax.loadUrl('${i.link}')">
                <div class="post-info">
                    <p class="post-title">
                        ${i.title}
                    </p>
                    <div class="info-box">
                        <span>${i.time}</span>
                        <span style="margin: 0 6px">|</span>
                        <span>${i.categories}</span>
                    </div>
                </div>
                <p class="post_description">
                    ${i.description}
                </p>
            </a>
        </div>`).join('');
        
        const randomList = document.querySelector(".banner-random>.random-list");
        if (randomList) {
            randomList.innerHTML = postsHtml;
        }
    },

    loadData: function() {
        // 不再显示加载提示到页面上
        // 如果你需要进行其他UI操作，可以在这里处理
        
        fetch("/articles-random.json")
            .then(res => {
                if (!res.ok) throw new Error('请求失败');  // 确保请求成功
                return res.json();
            })
            .then(data => {
                sessionStorage.setItem("postsInfo", JSON.stringify(data));
                sessionStorage.setItem("postsInfoTimestamp", Date.now());
                anxy.renderingPosts(data);
                // 在请求成功后，输出成功日志
                console.log("随机文章加载成功");
            })
            .catch(err => {
                // 网络请求失败时的错误提示仅显示在控制台
                console.error("随机文章加载失败:", err);
            });
    },

    RandomPosts: function() {
        const cachedData = sessionStorage.getItem("postsInfo");
        const cachedTimestamp = sessionStorage.getItem("postsInfoTimestamp");

        // 检查缓存是否有效
        if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_EXPIRATION_TIME)) {
            try {
                anxy.renderingPosts(JSON.parse(cachedData));  // 渲染缓存的数据
            } catch (e) {
                console.error("缓存数据解析失败:", e);
                anxy.loadData();  // 如果解析失败，重新加载数据
            }
        } else {
            anxy.loadData();  // 缓存无效或不存在时，加载新数据
        }
    }
};

// 预加载随机文章数据
function prefetchRandomPosts() {
    fetch("/articles-random.json")
        .then(res => res.json())
        .then(data => {
            sessionStorage.setItem("postsInfo", JSON.stringify(data));
            sessionStorage.setItem("postsInfoTimestamp", Date.now());
            // 在预加载成功后，输出成功日志
            console.log("预加载随机文章成功");
        })
        .catch(err => {
            // 预加载失败时输出日志
            console.error("预加载随机文章失败:", err);
        });
}

// 初始化 pjax
const pjax = new Pjax({
    elements: 'a',      // 拦截所有的 <a> 标签
    selectors: ['#pjax-container'], // 替换的容器
    cache: true,
    history: true,      // 确保正确处理历史记录
    scrollTo: false,    // 防止 pjax 导致页面滚动位置问题
    transition: 'fade', // 过渡效果
    transitionTime: 300, // 设置过渡效果的时间
});

// 监听 pjax 完成事件，确保每次页面加载时都重新加载随机文章
document.addEventListener('pjax:complete', function () {
    anxy.RandomPosts();  // 每次通过 pjax 加载新页面时重新加载随机文章
});

// 页面加载时优先使用缓存或请求数据
function loadRandomPostsOnPageLoad() {
    const cachedData = sessionStorage.getItem("postsInfo");
    if (!cachedData) {
        // 如果缓存没有数据，直接请求新的数据
        anxy.loadData();
    } else {
        // 如果缓存有数据，直接渲染
        anxy.RandomPosts();
    }
}

// 页面加载时调用
window.addEventListener("load", function() {
    // 延迟 500ms 确保页面完全加载
    setTimeout(loadRandomPostsOnPageLoad, 500);
});

// 确保 DOM 完全加载后再执行
document.addEventListener("DOMContentLoaded", function() {
    // 再次检查缓存并加载文章
    loadRandomPostsOnPageLoad();
});

// 预加载数据（在页面加载时开始请求数据）
prefetchRandomPosts();

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
    
    <p><button onclick="localStorage.removeItem('blogbg');location.reload();" style="background:#5fcdff;display:block;width:100%;padding: 15px 0;border-radius:6px;color:white;"><i class="fa-solid fa-arrows-rotate"></i> 点我恢复默认背景</button></p>
    <h2 id="图片（手机）"><a href="#图片（手机）" class="headerlink" title="图片（手机）"></a>图片（手机）</h2>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://img.vm.laomishuo.com/image/2021/12/2021122715170589.jpeg)" class="pimgbox" onclick="changeBg('url(https\://img.vm.laomishuo.com/image/2021/12/2021122715170589.jpeg)')"></a>
    </div>
    
    <h2 id="图片（电脑）"><a href="#图片（电脑）" class="headerlink" title="图片（电脑）"></a>图片（电脑）</h2>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" style="background-image:url(https://cn.bing.com/th?id=OHR.GBRTurtle_ZH-CN6069093254_1920x1080.jpg)" class="imgbox" onclick="changeBg('url(https\://cn.bing.com/th?id=OHR.GBRTurtle_ZH-CN6069093254_1920x1080.jpg)')"></a>
    </div>
    
    
    
    <h2 id="渐变色"><a href="#渐变色" class="headerlink" title="渐变色"></a>渐变色</h2>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: linear-gradient(to right, #eecda3, #ef629f)" onclick="changeBg('linear-gradient(to right, #eecda3, #ef629f)')"></a>
    </div>
    
    <h2 id="纯色"><a href="#纯色" class="headerlink" title="纯色"></a>纯色</h2>
    <div class="bgbox">
    <a href="javascript:;" rel="noopener external nofollow" class="box" style="background: #7D9D9C" onclick="changeBg('#7D9D9C')"></a> 
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