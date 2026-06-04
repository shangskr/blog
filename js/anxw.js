/* 作者卡片动态信息 */
(function() {
    const el = document.getElementById('dynamic-status');
    if (!el) return;
    const pool = {
        m: ['早安，元气满满', '清晨时光，加油', '坚持就是胜利'],
        n: ['午休时间到', '记得吃饭哦', '努力搬砖中'],
        a: ['下午好，继续加油', '午后宁静', '享受咖啡时光'],
        e: ['晚上好，放松一下', '享受夜晚', '今日收获满满'],
        ni: ['夜深了，早点休息', '晚安好梦', '享受夜晚']
    };
    function getMsg() {
        const h = new Date().getHours();
        if(h>=6&&h<12) return pool.m[Math.floor(Math.random()*pool.m.length)];
        if(h>=12&&h<14) return pool.n[Math.floor(Math.random()*pool.n.length)];
        if(h>=14&&h<18) return pool.a[Math.floor(Math.random()*pool.a.length)];
        if(h>=18&&h<23) return pool.e[Math.floor(Math.random()*pool.e.length)];
        return pool.ni[Math.floor(Math.random()*pool.ni.length)];
    }
    function update() { if(el) el.textContent = getMsg(); }
    update();
    setInterval(update, 60000);
})();


/* 归档 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const archiveList = document.querySelector('#aside-content .card-archives ul.card-archive-list');
        if (!archiveList) {
            // console.log('未找到归档列表'); // 移除
            return;
        }

        const items = Array.from(archiveList.querySelectorAll('.card-archive-list-item'));
        // console.log(`找到 ${items.length} 个归档项`); // 移除
        
        if (items.length === 0) return;

        archiveList.innerHTML = '';
        const yearGroups = {};
        let yearOrder = [];

        items.forEach((item, index) => {
            const text = item.innerText.trim();
            // console.log(`处理第${index}项: ${text}`); // 移除
            
            // 提取年份
            let yearMatch = text.match(/(\d{4})/);
            
            if (!yearMatch) {
                yearMatch = text.match(/(\d{4})年/);
            }
            
            if (yearMatch) {
                const year = yearMatch[1];
                
                // 获取篇数
                const countSpan = item.querySelector('.card-archive-list-count');
                const countText = countSpan ? countSpan.innerText.trim() : '';
                // 提取纯数字
                const countNum = countText.match(/\d+/) ? countText.match(/\d+/)[0] : '1';
                
                const link = item.querySelector('a');
                const href = link ? link.getAttribute('href') : '#';
                
                // 提取月份（只保留中文月份，去掉年份和数字）
                let monthText = text.replace(/\d{4}/, '').replace(/年/, '').trim();
                
                // 关键修复：去掉月份文本中的所有数字
                monthText = monthText.replace(/\d+/g, '').trim();
                
                // 如果月份为空，使用原文本
                if (!monthText) {
                    monthText = text.replace(/\d{4}/, '').replace(/年/, '').trim();
                }

                if (!yearGroups[year]) {
                    yearGroups[year] = [];
                    yearOrder.push(year);
                }
                
                yearGroups[year].push({
                    text: monthText,
                    count: countNum,
                    href: href
                });
            } else {
                // console.warn('无法提取年份:', text); // 移除
            }
        });

        // 按年份降序排序
        yearOrder.sort((a, b) => b - a);

        // 重新生成HTML
        yearOrder.forEach(year => {
            const months = yearGroups[year];
            
            let yearTotalCount = 0;
            months.forEach(m => {
                const num = parseInt(m.count);
                if (!isNaN(num)) yearTotalCount += num;
            });

            const groupLi = document.createElement('li');
            groupLi.className = 'card-archive-list-item year-group';
            
            groupLi.innerHTML = `
                <a href="javascript:;" class="year-link">
                    <span>${year}年</span>
                    <span class="count-text">${yearTotalCount}篇</span>
                </a>
                <ul class="month-list">
                    ${months.map(m => `
                        <li class="month-item">
                            <a href="${m.href}">
                                <span>${m.text}</span>
                                <span class="count-text">${m.count}篇</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
            
            archiveList.appendChild(groupLi);
        });
        
        // console.log('归档重组完成'); // 移除
    });
})();

/* 标签页颜色提取 */
document.addEventListener('DOMContentLoaded', function() {
    const tagLinks = document.querySelectorAll('.tag-cloud-list a');
    
    tagLinks.forEach(link => {
        const originalColor = link.style.backgroundColor;
        
        if (originalColor) {
            link.style.setProperty('--tag-color', originalColor);
            link.style.backgroundColor = '#fff';
            link.style.color = originalColor;
        }
    });
});


/* 文章未读标记 */
(function () {
    const STORAGE_KEY = 'hexo_read_posts';

    const ReadPostsManager = {
        getReadPosts() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                return data ? JSON.parse(data) : [];
            } catch (e) { return []; }
        },
        
        saveReadPosts(posts) {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
            catch (e) { console.error('保存阅读记录失败:', e); }
        },
        
        markAsRead(postUrl) {
            const readPosts = this.getReadPosts();
            const norm = this.normalizeUrl(postUrl);
            if (!readPosts.includes(norm)) {
                readPosts.push(norm);
                this.saveReadPosts(readPosts);
            }
        },
        
        isRead(postUrl) {
            return this.getReadPosts().includes(this.normalizeUrl(postUrl));
        },
        
        normalizeUrl(url) {
            try {
                return url.startsWith('http') 
                    ? new URL(url).pathname 
                    : url.split('?')[0].split('#')[0];
            } catch { return url; }
        },
        
        clearAll() { localStorage.removeItem(STORAGE_KEY); }
    };

    function initUnreadBadge() {
        const currentPath = ReadPostsManager.normalizeUrl(window.location.pathname);
        
        if (document.querySelector('.post-content, .article-content')) {
            ReadPostsManager.markAsRead(currentPath);
        }
        
        addUnreadBadges(currentPath);
    }

    function addUnreadBadges(currentPath) {
        // 兼容 Butterfly 不同版本的文章卡片选择器
        const postItems = document.querySelectorAll('.recent-post-item, .post-card, .layout__post-item');
        
        postItems.forEach(item => {
            const link = item.querySelector('.post-title a, .article-title a, .recent-post-info a');
            if (!link) return;
            
            const postUrl = link.getAttribute('href');
            if (!postUrl) return;
            
            const normUrl = ReadPostsManager.normalizeUrl(postUrl);

            if (ReadPostsManager.isRead(normUrl) || normUrl === currentPath) return;
            

            const metaWrap = item.querySelector('.article-meta-wrap, .post-meta');
            if (!metaWrap) return;
            
            // 防止重复添加
            if (metaWrap.querySelector('.unread-badge')) return;
            
            // 创建纯文字标记
            const badge = document.createElement('span');
            badge.className = 'unread-badge';
            badge.textContent = '未读';
            badge.title = '这篇文章你还没看过';
            
            metaWrap.appendChild(badge);
        });
    }

    // 调试工具
    window.ReadPostsDebug = {
        list: () => console.log('已读列表:', ReadPostsManager.getReadPosts()),
        count: () => console.log(`已读文章数: ${ReadPostsManager.getReadPosts().length}`),
        clear: () => { ReadPostsManager.clearAll(); location.reload(); }
    };

    // 初始化执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUnreadBadge);
    } else {
        initUnreadBadge();
    }

    // 兼容 Butterfly Pjax 无刷新跳转
    document.addEventListener('pjax:complete', initUnreadBadge);
})();

/* 随机文章卡片行 */
(function () {
  var ROW_SEL = '#random-post-row'
  var COUNT = 4                                    // ← 卡片数量，可修改，最少为4，最多为4的倍数，默认4及最佳。
  var cache = null

  function shuffle (arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
    }
    return arr
  }

  function fmtDate (iso) {
    var d = new Date(iso)
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0')
  }

  function buildCard (post) {
    var hasCover = post.cover && post.cover !== ''
    var bgStyle = ''
    var noCoverCls = ''
    if (hasCover) {
      bgStyle = post.cover_type === 'img'
        ? 'background-image: url(' + post.cover + ')'
        : 'background: ' + post.cover
    } else {
      noCoverCls = ' no-cover'
    }

    var dateHtml = '<span class="rc-date">' + fmtDate(post.date) + '</span>'

    return '<a class="random-card' + noCoverCls + '" href="' + post.path + '" title="' + post.title + '">' +
      '<div class="random-card-bg"' + (hasCover ? ' style="' + bgStyle + '"' : '') + '>' +
        '<div class="random-card-overlay">' +
          '<div class="rc-top">' + dateHtml + '</div>' +
          '<div class="random-card-title">' + post.title + '</div>' +
        '</div>' +
      '</div>' +
    '</a>'
  }

  function render () {
    var row = document.querySelector(ROW_SEL)
    if (!row) return

    function done (posts) {
      if (!posts || posts.length === 0) return
      var picked = shuffle(posts).slice(0, COUNT)
      row.innerHTML =
        picked.map(buildCard).join('') +
        '<div class="reshuffle-btn-wrap"><button class="reshuffle-btn" onclick="window._reshuffleCards()"><i class="fas fa-random"></i><span class="rb-text">换一批</span></button></div>'
    }

    if (cache) {
      done(cache)
    } else if (window._randomPostData && window._randomPostData.length) {
      cache = window._randomPostData
      done(cache)
    }
  }

  window._reshuffleCards = function () {
    if (!cache || cache.length === 0) return
    var picked = shuffle(cache.slice()).slice(0, COUNT)
    var row = document.querySelector(ROW_SEL)
    if (row) {
      row.innerHTML =
        picked.map(buildCard).join('') +
        '<div class="reshuffle-btn-wrap"><button class="reshuffle-btn" onclick="window._reshuffleCards()"><i class="fas fa-random"></i><span class="rb-text">换一批</span></button></div>'
    }
    if (document.activeElement) document.activeElement.blur()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render)
  } else {
    render()
  }
  document.addEventListener('pjax:complete', render)
})();

/* 换一批按钮悬停 */
(function () {
  var hideTimer
  document.addEventListener('mouseover', function (e) {
    if (window.innerWidth <= 1024) return
    var row = e.target.closest('#random-post-row')
    if (!row) return
    var wrap = row.querySelector('.reshuffle-btn-wrap')
    if (wrap) {
      clearTimeout(hideTimer)
      wrap.style.display = 'block'
    }
  })
  document.addEventListener('mouseout', function (e) {
    if (window.innerWidth <= 1024) return
    var row = e.target.closest('#random-post-row')
    if (!row) return
    var wrap = row.querySelector('.reshuffle-btn-wrap')
    if (!wrap) return
    if (row.contains(e.relatedTarget)) return
    hideTimer = setTimeout(function () {
      wrap.style.display = ''
    }, 400)
  })
})();