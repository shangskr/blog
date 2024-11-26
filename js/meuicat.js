const meuicat = {
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
		const randomElements = meuicat.getRandomElementsFromArray(data, 4);
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
		var cachedData = sessionStorage.getItem("postsInfo");
		var cachedTimestamp = sessionStorage.getItem("postsInfoTimestamp");

		if (cachedData && cachedTimestamp && (Date.now() - cachedTimestamp < CACHE_EXPIRATION_TIME)) {
			meuicat.renderingPosts(JSON.parse(cachedData));
		} else {
			fetch("/articles-random.json")
				.then(res => res.json())
				.then(data => {
					sessionStorage.setItem("postsInfo", JSON.stringify(data));
					sessionStorage.setItem("postsInfoTimestamp", Date.now());

					meuicat.renderingPosts(data);
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

window.DOMReady = function () {
	if (location.pathname == '/' || location.pathname.startsWith('/page/')) meuicat.RandomPosts();
};

document.addEventListener("DOMContentLoaded", DOMReady)
document.addEventListener("pjax:complete", DOMReady)
