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
            })
            .catch(err => {
                // 网络请求失败时的错误提示仅显示在控制台
                console.error("加载随机文章失败:", err);
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
        })
        .catch(err => {
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

