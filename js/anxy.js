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
			<a class="post_box" title="${i.title}" href="javascript:void(0)" onclick="pjax.loadUrl('${i.link}')">
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
		</div>`)
			.join('');
		document.querySelector(".banner-random>.random-list")
			.innerHTML = postsHtml
	},
	RandomPosts: function() {
        const random = document.querySelector('.banner-random')
        if (!random) return
		const cachedData = sessionStorage.getItem("postsInfo");
		const cachedTimestamp = sessionStorage.getItem("postsInfoTimestamp");

		if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_EXPIRATION_TIME)) {
			anxy.renderingPosts(JSON.parse(cachedData));
		} else {
			fetch("/articles-random.json")
				.then(res => res.json())
				.then(data => {
					sessionStorage.setItem("postsInfo", JSON.stringify(data));
					sessionStorage.setItem("postsInfoTimestamp", Date.now());

					anxy.renderingPosts(data);
				});
		}
	}, // 主页banner随机推荐
	RandomBar: function(text) {
		const randomList = document.querySelector('.random-list');
		const slideAmount = 210;
	
		if (text === 'prev') {
			randomList.scrollLeft -= slideAmount;
		} else if (text === 'next') {
			randomList.scrollLeft += slideAmount;
		}
	} // 主页推荐banner滑块
}

const DOMReady = () => {
	anxy.RandomPosts();
};

document.addEventListener("DOMContentLoaded", DOMReady)
document.addEventListener("pjax:complete", DOMReady)