//随机文章js
let CACHE_EXPIRATION_TIME = 12 * 60 * 60 * 1000;

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
        const randomList = document.querySelector(".random-list");
        if (randomList) {
            randomList.innerHTML = "<p>正在加载随机文章...</p>";  // 显示加载提示
        }

        fetch("/articles-random.json")
            .then(res => {
                if (!res.ok) throw new Error('请求失败');  // 确保请求成功
                return res.json();
            })
            .then(data => {
                sessionStorage.setItem("postsInfo", JSON.stringify(data));
                sessionStorage.setItem("postsInfoTimestamp", Date.now());
                anxy.renderingPosts(data);
            })
            .catch(err => {
                console.error("加载随机文章失败", err);  // 网络请求失败时的错误提示
                if (randomList) {
                    randomList.innerHTML = "<p>无法加载随机文章，请稍后再试。</p>";
                }
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
                console.error("缓存数据解析失败", e);
                anxy.loadData();  // 如果解析失败，重新加载数据
            }
        } else {
            anxy.loadData();  // 缓存无效或不存在时，加载新数据
        }

        // 确保回到首页时也能加载随机文章
        if (window.location.pathname === '/') {
            anxy.loadData();  // 主页直接加载随机文章
        }
    }
};

// 初始化 pjax
const pjax = new Pjax({
    elements: 'a',      // 拦截所有的 <a> 标签
    selectors: ['#pjax-container'], // 替换的容器
    cache: true,
    scrollTo: false,  // 防止 pjax 导致页面滚动位置问题
    history: true      // 确保正确处理历史记录
});

// 监听 pjax 完成事件，确保每次页面加载时都重新加载随机文章
document.addEventListener('pjax:complete', function () {
    anxy.RandomPosts();  // 每次通过 pjax 加载新页面时重新加载随机文章
});

// 确保 DOM 完全加载后再执行
document.addEventListener("DOMContentLoaded", function() {
    anxy.RandomPosts();  // 页面加载完成后调用随机文章加载函数
});

// 在第一次加载时，如果缓存为空或者数据尚未加载，可以强制执行加载
window.addEventListener("load", function() {
    // 如果 sessionStorage 中没有缓存数据，执行加载数据
    const cachedData = sessionStorage.getItem("postsInfo");
    if (!cachedData) {
        anxy.loadData();  // 加载新数据
    }
});
