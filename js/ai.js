(function() {
  // 配置参数
  const DEFAULT_DELAY = 0;    // 默认延迟时间(ms)
  const TYPING_SPEED = 50;    // 打字速度(ms/字符)

  // 查找所有AI摘要元素
  const aiTextElements = document.querySelectorAll('.ai-text');
  
  if (!aiTextElements.length) return;

  aiTextElements.forEach(el => {
    const fullText = el.dataset.text || '';
    const delay = Math.max(0, parseInt(el.dataset.delay)) || DEFAULT_DELAY;
    const loadingEl = el.previousElementSibling?.classList?.contains('ai-loading') 
      ? el.previousElementSibling 
      : null;

    // 初始设置 - 确保不会产生空行
    el.style.display = 'none';
    el.style.overflow = 'hidden';
    el.style.borderRight = 'none';
    el.style.margin = '0';
    el.style.padding = '0';
    
    if (!fullText.trim()) {
      if (loadingEl) loadingEl.style.display = 'none';
      return;
    }

    const showContent = () => {
      if (loadingEl) {
        // 平滑过渡：先隐藏"正在思考中..."
        loadingEl.style.opacity = '0';
        loadingEl.style.transition = 'opacity 0.2s ease';
        
        // 在过渡完成后完全移除loading元素
        setTimeout(() => {
          loadingEl.style.display = 'none';
          // 立即显示内容，避免出现空白期
          el.style.display = 'block';
          startTyping();
        }, 200);
      } else {
        el.style.display = 'block';
        startTyping();
      }
    };

    const startTyping = () => {
      el.textContent = '';
      let i = 0;
      const printChar = () => {
        if (i < fullText.length) {
          el.textContent += fullText.charAt(i);
          i++;
          setTimeout(printChar, TYPING_SPEED);
        }
      };
      printChar();
    };

    delay <= 0 ? setTimeout(showContent, 0) : setTimeout(showContent, delay);
  });
})();