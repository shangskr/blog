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

        // 添加 touchstart 事件，确保点击后不再保持 hover 状态
        document.querySelectorAll('.post_item').forEach((item) => {
            item.addEventListener('touchstart', function() {
                item.classList.remove('hover');  // 删除 hover 类，防止点击后 hover 状态保持
            });
        });
    },

    loadData: function() {
        fetch("/articles-random.json")
            .then(res => {
                if (!res.ok) throw new Error('请求失败');
                return res.json();
            })
            .then(data => {
                sessionStorage.setItem("postsInfo", JSON.stringify(data));
                sessionStorage.setItem("postsInfoTimestamp", Date.now());
                anxy.renderingPosts(data);
                console.log("随机文章加载成功");
            })
            .catch(err => {
                console.error("随机文章加载失败:", err);
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
                anxy.loadData();
            }
        } else {
            anxy.loadData();
        }
    }
};

// 预加载数据
function prefetchRandomPosts() {
    fetch("/articles-random.json")
        .then(res => res.json())
        .then(data => {
            sessionStorage.setItem("postsInfo", JSON.stringify(data));
            sessionStorage.setItem("postsInfoTimestamp", Date.now());
            console.log("预加载随机文章成功");
        })
        .catch(err => {
            console.error("预加载随机文章失败:", err);
        });
}

// 初始化 pjax
const pjax = new Pjax({
    elements: 'a',
    selectors: ['#pjax-container'],
    cache: true,
    history: true,
    scrollTo: false,
    transition: 'fade',
    transitionTime: 300,
});

// 监听 pjax 完成事件，重新加载随机文章
document.addEventListener('pjax:complete', function () {
    anxy.RandomPosts();
});

// 页面加载时优先使用缓存或请求数据
function loadRandomPostsOnPageLoad() {
    const cachedData = sessionStorage.getItem("postsInfo");
    if (!cachedData) {
        anxy.loadData();
    } else {
        anxy.RandomPosts();
    }
}

// 页面加载时调用
window.addEventListener("load", function() {
    setTimeout(loadRandomPostsOnPageLoad, 500);
});

// 确保 DOM 完全加载后再执行
document.addEventListener("DOMContentLoaded", function() {
    loadRandomPostsOnPageLoad();
});

// 预加载数据
prefetchRandomPosts();
