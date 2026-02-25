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
        
        // 创建全局 tooltip 元素
        let tooltip = document.getElementById('global-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'global-tooltip';
            tooltip.className = 'tooltip-global';
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
            document.body.appendChild(tooltip);
        }
        
        function showTooltip(e) {
            const tip = e.currentTarget.getAttribute('data-tip');
            if (!tip) return;
            
            tooltip.textContent = tip;
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            
            // 定位
            const rect = e.currentTarget.getBoundingClientRect();
            
            // 先显示再获取尺寸
            requestAnimationFrame(() => {
                const tooltipRect = tooltip.getBoundingClientRect();
                
                // 默认显示在元素上方
                let top = rect.top - tooltipRect.height - 10;
                let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                
                // 如果上方空间不足，显示在下方
                if (top < 10) {
                    top = rect.bottom + 10;
                }
                
                // 防止超出左边界
                if (left < 10) {
                    left = 10;
                }
                
                // 防止超出右边界
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = window.innerWidth - tooltipRect.width - 10;
                }
                
                tooltip.style.top = top + 'px';
                tooltip.style.left = left + 'px';
            });
        }
        
        function hideTooltip() {
            tooltip.style.opacity = '0';
            tooltip.style.visibility = 'hidden';
        }
        
        tipElements.forEach(el => {
            el.addEventListener('mouseenter', showTooltip, { passive: true });
            el.addEventListener('mouseleave', hideTooltip, { passive: true });
            el.style.cursor = 'help';
            
            // 为表格单元格添加下划线虚线样式
            if (el.tagName === 'TD' || el.tagName === 'TH') {
                el.style.borderBottom = '1px dashed #8B949E';
            }
        });
        
        // 触摸设备支持
        tipElements.forEach(el => {
            el.addEventListener('touchstart', function(e) {
                // 移除其他活跃的tooltip
                tipElements.forEach(other => {
                    if (other !== el) {
                        other.classList.remove('tooltip-active');
                    }
                });
                // 显示当前tooltip
                showTooltip(e);
                this.classList.add('tooltip-active');
            }, { passive: true });
        });
        
        // 点击空白处关闭tooltip
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('[data-tip]')) {
                hideTooltip();
                tipElements.forEach(el => {
                    el.classList.remove('tooltip-active');
                });
            }
        }, { passive: true });
    }
})();
