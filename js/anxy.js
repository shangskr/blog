//随机文章js
const CACHE_EXPIRATION_TIME = 12 * 60 * 60 * 1000;  // 缓存过期时间，12小时
//随机文章js
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
document.addEventListener("DOMContentLoaded", function() {
    anxy.RandomPosts();
});

// 初始化 pjax，确保在页面加载完后进行初始化
document.addEventListener("DOMContentLoaded", function() {
    // 确保 Pjax 库已加载
    if (typeof Pjax !== 'undefined') {
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
            // 在每次 pjax 完成后重新加载随机文章
            anxy.RandomPosts();
        });
    } else {
        console.error("Pjax 库未加载，请检查是否正确引入该库。");
    }
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