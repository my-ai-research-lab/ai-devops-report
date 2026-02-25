/**
 * AI × 研发效能报告 - 交互脚本
 * 基于 qingshuang-research-style v1.2.0
 */

(function() {
    'use strict';

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        initApp();
    });

    function initApp() {
        // ==================== Tab导航 ====================
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        function activateTab(tabId) {
            // 更新按钮状态
            tabBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });
            
            // 更新面板显示
            tabPanels.forEach(panel => {
                panel.classList.toggle('active', panel.id === tabId);
            });
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                activateTab(btn.dataset.tab);
            });
        });

        // ==================== 全屏模式 ====================
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    document.body.classList.add('fullscreen-mode');
                    fullscreenBtn.classList.add('active');
                }).catch(err => {
                    console.warn('无法进入全屏模式:', err);
                });
            } else {
                document.exitFullscreen().then(() => {
                    document.body.classList.remove('fullscreen-mode');
                    fullscreenBtn.classList.remove('active');
                });
            }
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                document.body.classList.remove('fullscreen-mode');
                if (fullscreenBtn) fullscreenBtn.classList.remove('active');
            }
        });

        // ==================== 移动端预览模式 ====================
        const mobilePreviewBtn = document.getElementById('mobile-preview-btn');
        
        function toggleMobilePreview() {
            document.body.classList.toggle('mobile-preview-mode');
            if (mobilePreviewBtn) {
                mobilePreviewBtn.classList.toggle('active');
            }
        }

        if (mobilePreviewBtn) {
            mobilePreviewBtn.addEventListener('click', toggleMobilePreview);
        }

        // ESC退出移动端预览
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.body.classList.contains('mobile-preview-mode')) {
                    toggleMobilePreview();
                }
            }
        });

        // ==================== 平滑锚点滚动 ====================
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // ==================== Tooltip 功能 ====================
        initTooltips();

        // ==================== 表格横向滚动提示 ====================
        const tableWraps = document.querySelectorAll('.table-wrap');
        
        tableWraps.forEach(wrap => {
            const checkScroll = () => {
                if (wrap.scrollWidth > wrap.clientWidth) {
                    wrap.classList.add('has-scroll');
                } else {
                    wrap.classList.remove('has-scroll');
                }
            };
            
            checkScroll();
            window.addEventListener('resize', checkScroll);
        });

        // ==================== 图片懒加载备用方案 ====================
        if (!('loading' in HTMLImageElement.prototype)) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => imageObserver.observe(img));
        }

        // ==================== 打印优化 ====================
        window.addEventListener('beforeprint', () => {
            // 打印前展开所有面板
            tabPanels.forEach(panel => panel.classList.add('active'));
        });

        window.addEventListener('afterprint', () => {
            // 打印后恢复状态
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                activateTab(activeTab.dataset.tab);
            }
        });

        // ==================== 初始化 ====================
        // 默认激活第一个Tab
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab && !document.querySelector('.tab-btn.active')) {
            activateTab(firstTab.dataset.tab);
        }

        console.log('AI × 研发效能报告 - 脚本加载完成，已注册 ' + document.querySelectorAll('[data-tip]').length + ' 个tooltip');
    }

    // ==================== Tooltip 初始化函数 ====================
    function initTooltips() {
        const tipElements = document.querySelectorAll('[data-tip]');
        
        console.log('找到 data-tip 元素数量:', tipElements.length);
        
        if (!tipElements.length) return;
        
        // 检测是否为移动设备或触摸设备
        function isMobileOrTouch() {
            return window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        
        // 创建全局 tooltip 元素
        let tooltip = document.getElementById('global-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'global-tooltip';
            tooltip.className = 'tooltip-global';
            document.body.appendChild(tooltip);
        }
        
        // 创建遮罩层（移动端用）
        let overlay = document.getElementById('tip-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'tip-overlay';
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
            `;
            document.body.appendChild(overlay);
        }
        
        // 更新tooltip样式（根据设备类型）
        function updateTooltipStyle() {
            if (isMobileOrTouch()) {
                // 移动端：居中弹窗样式（白色背景，更大更清晰）
                tooltip.style.cssText = `
                    position: fixed;
                    background: #fff;
                    color: #24292f;
                    padding: 24px;
                    padding-top: 48px;
                    border-radius: 16px;
                    font-size: 14px;
                    line-height: 1.7;
                    width: 90vw;
                    max-width: 340px;
                    max-height: 70vh;
                    overflow-y: auto;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s, visibility 0.2s;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: auto;
                `;
                // 添加关闭按钮
                if (!tooltip.querySelector('.tooltip-close-btn')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'tooltip-close-btn';
                    closeBtn.innerHTML = '×';
                    closeBtn.style.cssText = `
                        position: absolute;
                        top: 12px;
                        right: 12px;
                        width: 32px;
                        height: 32px;
                        background: #f6f8fa;
                        color: #57606a;
                        border: 1px solid #d0d7de;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                        cursor: pointer;
                        z-index: 10001;
                        transition: all 0.2s ease;
                        -webkit-tap-highlight-color: transparent;
                    `;
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        hideTooltip();
                    });
                    closeBtn.addEventListener('touchend', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        hideTooltip();
                    }, { passive: false });
                    tooltip.appendChild(closeBtn);
                }
            } else {
                // 桌面端：跟随鼠标样式
                tooltip.style.cssText = `
                    position: fixed;
                    background: rgba(36, 41, 47, 0.95);
                    color: #fff;
                    padding: 12px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    line-height: 1.5;
                    max-width: 320px;
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.2s, visibility 0.2s;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                `;
                // 移除关闭按钮（桌面端不需要）
                const closeBtn = tooltip.querySelector('.tooltip-close-btn');
                if (closeBtn) closeBtn.remove();
            }
        }
        
        updateTooltipStyle();
        window.addEventListener('resize', updateTooltipStyle);
        
        let activeElement = null;
        
        function showTooltip(e, el) {
            const target = el || e.currentTarget;
            const tip = target.getAttribute('data-tip');
            if (!tip) return;
            
            tooltip.textContent = tip;
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            activeElement = target;
            
            if (isMobileOrTouch()) {
                // 移动端：显示遮罩层
                overlay.style.display = 'block';
            } else {
                // 桌面端：定位到元素附近
                const rect = target.getBoundingClientRect();
                requestAnimationFrame(() => {
                    const tooltipRect = tooltip.getBoundingClientRect();
                    let top = rect.top - tooltipRect.height - 10;
                    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                    
                    if (top < 10) {
                        top = rect.bottom + 10;
                    }
                    if (left < 10) {
                        left = 10;
                    }
                    if (left + tooltipRect.width > window.innerWidth - 10) {
                        left = window.innerWidth - tooltipRect.width - 10;
                    }
                    
                    tooltip.style.top = top + 'px';
                    tooltip.style.left = left + 'px';
                    tooltip.style.transform = 'none';
                });
            }
        }
        
        function hideTooltip() {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
            overlay.style.display = 'none';
            activeElement = null;
            tipElements.forEach(el => el.classList.remove('tooltip-active'));
        }
        
        tipElements.forEach(el => {
            // 桌面端：鼠标悬浮
            el.addEventListener('mouseenter', showTooltip, { passive: true });
            el.addEventListener('mouseleave', hideTooltip, { passive: true });
            el.style.cursor = 'help';
            el.style.webkitTapHighlightColor = 'rgba(9, 105, 218, 0.1)';
            
            // 为表格单元格添加下划线虚线样式
            if (el.tagName === 'TD' || el.tagName === 'TH') {
                el.style.borderBottom = '1px dashed #8B949E';
            }
            
            // 移动端：点击/触摸显示
            el.addEventListener('click', function(e) {
                if (!isMobileOrTouch()) return;
                e.preventDefault();
                e.stopPropagation();
                
                if (activeElement === el) {
                    hideTooltip();
                } else {
                    showTooltip(e, el);
                    this.classList.add('tooltip-active');
                }
            });
            
            el.addEventListener('touchend', function(e) {
                if (!isMobileOrTouch()) return;
                e.preventDefault();
                e.stopPropagation();
                
                if (activeElement === el) {
                    hideTooltip();
                } else {
                    showTooltip(e, el);
                    this.classList.add('tooltip-active');
                }
            }, { passive: false });
        });
        
        // 点击遮罩层或tooltip关闭
        overlay.addEventListener('click', hideTooltip);
        overlay.addEventListener('touchend', (e) => {
            e.preventDefault();
            hideTooltip();
        }, { passive: false });
        
        tooltip.addEventListener('click', (e) => {
            if (isMobileOrTouch()) {
                e.stopPropagation();
                hideTooltip();
            }
        });
        
        // 点击空白处关闭tooltip（移动端）
        document.addEventListener('click', (e) => {
            if (isMobileOrTouch() && activeElement && !e.target.closest('[data-tip]') && !e.target.closest('#global-tooltip')) {
                hideTooltip();
            }
        });
        
        // ESC关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideTooltip();
            }
        });
    }
})();
