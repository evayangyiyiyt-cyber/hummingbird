document.addEventListener('DOMContentLoaded', () => {
    // 1. 变量获取
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const langBtn = document.getElementById('lang-btn');
    const langDropdown = document.getElementById('lang-dropdown');
    
    const navItems = document.querySelectorAll('.nav-item');
    const allNavLinks = document.querySelectorAll('.nav-links a');

    // 2. 导航栏交互
    if (menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('nav-active');
            if (langDropdown) langDropdown.classList.remove('show');
        });
    }

    if (langBtn) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('show');
            if (navLinks) navLinks.classList.remove('nav-active');
            closeAllDropdowns();
        });
    }

    // 下拉菜单控制
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const dropdown = item.querySelector('.nav-dropdown-menu');

        if (link && dropdown) {
            link.addEventListener('click', (e) => {
                // 电脑端 (宽度 > 1200px) 才执行点击展开下拉的逻辑
                if (window.innerWidth > 1200) {
                    e.preventDefault(); // 阻止任何默认跳转
                    e.stopPropagation(); // 阻止事件冒泡导致立马关闭
                    
                    // 关闭其他的下拉菜单
                    navItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherDropdown = otherItem.querySelector('.nav-dropdown-menu');
                            if (otherDropdown) otherDropdown.classList.remove('show');
                        }
                    });
                    
                    if (langDropdown) langDropdown.classList.remove('show');
                    
                    // 切换当前下拉菜单的显示状态
                    dropdown.classList.toggle('show');
                }
            });
        }
    });

    document.addEventListener('click', () => {
        if (langDropdown) langDropdown.classList.remove('show');
        if (navLinks) navLinks.classList.remove('nav-active');
        closeAllDropdowns();
    });

    function closeAllDropdowns() {
        document.querySelectorAll('.nav-dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    // 3. 多语言加载
    const langOptions = document.querySelectorAll('.lang-option');
    let currentLang = localStorage.getItem('preferredLang') || 'zh';

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`${lang}.json`);
            if (!response.ok) throw new Error(`无法加载: ${lang}.json`);
            const translations = await response.json();
            applyTranslations(translations);
            currentLang = lang;
            localStorage.setItem('preferredLang', lang);
            document.documentElement.classList.remove('lang-loading');
        } catch (error) {
            console.error(error);
            document.documentElement.classList.remove('lang-loading');
        }
    }

    function applyTranslations(translations) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const keyPath = el.getAttribute('data-i18n');
            const keys = keyPath.split('.');
            let value = translations;
            for (const key of keys) {
                if (value && value[key] !== undefined) value = value[key];
                else { value = null; break; }
            }
            if (value) {
                if(value.includes('<') && value.includes('>')) el.innerHTML = value;
                else el.textContent = value;
            }
        });
    }

    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const selectedLang = e.target.getAttribute('data-lang');
            if (selectedLang !== currentLang) loadLanguage(selectedLang);
            langDropdown.classList.remove('show');
        });
    });

    loadLanguage(currentLang);

    // 4. 智能导航高亮逻辑 (修复版)
    // 4. 智能导航高亮 (精准匹配版，彻底解决名字包含的Bug)
    function updateActiveNav() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // 获取当前准确的文件名，比如 "ai-search-cases.html" 或 "cases.html"
        let fileName = currentPath.split('/').pop(); 
        if (fileName === '') fileName = 'index.html'; // 如果是根目录，默认为首页

        // 清除所有高亮
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            const parent = link.closest('.nav-item');
            if (parent) parent.querySelector('.nav-link').classList.remove('active');
        });

        // 逻辑分配
        if (fileName === 'index.html') {
            // 首页逻辑：检测锚点
            if (currentHash && currentHash !== '#' && currentHash !== '#footer') {
                const targetLink = Array.from(allNavLinks).find(l => {
                    const href = l.getAttribute('href');
                    return href && href.includes(currentHash);
                });
                if (targetLink) activateLink(targetLink);
            } else {
                // 无锚点时默认亮“首页”
                if (allNavLinks.length > 0) allNavLinks[0].classList.add('active'); 
            }
        } else {
            // 其他所有子页面逻辑：直接精准寻找和当前文件名一模一样的链接！
            highlightLinkByHref(fileName);
        }
    }
    function highlightLinkByHref(hrefVal) {
        // 先找下拉菜单里的
        let link = document.querySelector(`.nav-dropdown-menu a[href="${hrefVal}"]`);
        // 如果没有，找一级菜单里的 (比如关于我们)
        if (!link) {
            link = document.querySelector(`.nav-link[href="${hrefVal}"]`);
        }
        if (link) activateLink(link);
    }

    function activateLink(linkElement) {
        linkElement.classList.add('active');
        // 如果是下拉菜单里的，点亮父级
        const parentItem = linkElement.closest('.nav-item');
        if (parentItem) parentItem.querySelector('.nav-link').classList.add('active');
    }

    window.addEventListener('load', updateActiveNav);
    window.addEventListener('hashchange', updateActiveNav);

    allNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            setTimeout(updateActiveNav, 50);
            if (window.innerWidth <= 1200 && navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
            }
        });
    });

    // ... (后续的轮播图、Tabs 代码保持不变) ...
    // 5. 行业案例页面...
    const casesTabs = document.querySelectorAll('#cases-tabs .tab-btn');
    const sections = document.querySelectorAll('.case-section');
    const casesNav = document.getElementById('cases-tabs');
    const resultsSection = document.getElementById('results-section');

    if (casesTabs.length > 0) {
        casesTabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-target');
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - 160;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    
                    casesTabs.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });

        window.addEventListener('scroll', () => {
            let currentId = '';
            const scrollY = window.pageYOffset;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 200;
                const sectionHeight = section.offsetHeight;
                
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentId = section.getAttribute('id');
                }
            });

            if (currentId) {
                casesTabs.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-target') === currentId) {
                        btn.classList.add('active');
                    }
                });
            }

            if (resultsSection && casesNav) {
                if (window.scrollY > (resultsSection.offsetTop - 160)) {
                    casesNav.style.opacity = '0';
                    casesNav.style.visibility = 'hidden';
                    casesNav.style.transform = 'translateY(-20px)';
                } else {
                    casesNav.style.opacity = '1';
                    casesNav.style.visibility = 'visible';
                    casesNav.style.transform = 'translateY(0)';
                }
            }
        });
        
        if(casesNav) {
            casesNav.style.transition = 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease';
        }
    }

    const sliderWrapper = document.getElementById('auto-slider-wrapper');
    if (sliderWrapper) {
        let currentIndex = 0;
        const slides = sliderWrapper.querySelectorAll('.slide-img');
        if(slides.length > 0) {
            setInterval(() => {
                currentIndex++;
                if (currentIndex >= slides.length) currentIndex = 0;
                sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
            }, 3000);
        }
    }

    const tabPillsContainers = document.querySelectorAll('.tab-pills');
    tabPillsContainers.forEach(container => {
        const pills = container.querySelectorAll('.pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
            });
        });
    });

    const sceneSliderWrapper = document.getElementById('scene-slider');
    const sceneDots = document.querySelectorAll('#scene-dots .dot');
    
    if (sceneSliderWrapper && sceneDots.length > 0) {
        let sceneIndex = 0;
        const totalScenes = 3;

        function updateSceneSlider() {
            sceneSliderWrapper.style.transform = `translateX(-${sceneIndex * 100}%)`;
            sceneDots.forEach(d => d.classList.remove('active'));
            if(sceneDots[sceneIndex]) sceneDots[sceneIndex].classList.add('active');
        }

        setInterval(() => {
            sceneIndex++;
            if (sceneIndex >= totalScenes) sceneIndex = 0;
            updateSceneSlider();
        }, 4000);
    }
});