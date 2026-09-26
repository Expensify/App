/* eslint-disable no-unused-vars */
function toggleHeaderMenu() {
    const lhn = document.getElementById('lhn');
    const lhnContent = document.getElementById('lhn-content');
    const angleUpIcon = document.getElementById('angle-up-icon');
    const barsIcon = document.getElementById('bars-icon');
    if (lhnContent.className === 'expanded') {
        // Collapse the LHN in mobile
        lhn.className = '';
        lhnContent.className = '';
        barsIcon.classList.remove('hide');
        angleUpIcon.classList.add('hide');
        document.body.classList.remove('disable-scrollbar');
    } else {
        // Expand the LHN in mobile
        lhn.className = 'expanded';
        lhnContent.className = 'expanded';
        barsIcon.classList.add('hide');
        angleUpIcon.classList.remove('hide');
        document.body.classList.add('disable-scrollbar');
    }
}

/**
 * Clamp a number in a range.
 *
 * @param {Number} num
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Check if a number is in a range.
 *
 * @param {Number} num
 * @param {Number} min
 * @param {Number} max
 * @returns {Boolean}
 */
function isInRange(num, min, max) {
    return num >= min && num <= max;
}
/**
 * Checks if the user has navigated within the docs using internal links and uses browser history to navigate back.
 * If a page is directly accessed (e.g., via deep link, bookmark, or opened in a new tab),the user will be navigated
 * back to the relevant hub page of that article.
 */
function navigateBack() {
    const currentHost = window.location.host;
    const referrer = document.referrer;

    if (referrer.includes(currentHost) && window.history.length > 1) {
        window.history.back();
        return;
    }

    // Path name is of the form /articles/[platform]/[hub]/[resource]
    const path = window.location.pathname.split('/');
    if (path[2] && path[3]) {
        window.location.href = `/${path[2]}/hubs/${path[3]}`;
    } else {
        window.location.href = '/';
    }

    // Add a little delay to avoid showing the previous content in a fraction of a time
    setTimeout(toggleHeaderMenu, 250);
}

function injectFooterCopyright() {
    const footer = document.getElementById('footer-copyright-date');
    footer.innerHTML = `&copy;2008-${new Date().getFullYear()} Expensify, Inc.`;
}

const SEARCH_API_URL = 'https://www.expensify.com/api/SearchHelpsite';
const ASK_AI_API_URL = 'https://www.expensify.com/api/AskHelpsiteAI';

let allowedDomains = [];

if (window.location.pathname.includes('/search')) {
    fetch('/assets/js/allowedExternalUrls.json')
        .then((response) => response.json())
        .then((urls) => {
            allowedDomains = urls
                .map((url) => {
                    try {
                        return new URL(url).hostname;
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);
        })
        .catch(() => {});

    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A' && node.hasAttribute('href')) {
            const href = node.getAttribute('href');
            try {
                const hostname = new URL(href).hostname;
                const isExpensifyLink = hostname === 'expensify.com' || hostname.endsWith('.expensify.com');
                if (!isExpensifyLink && allowedDomains.length > 0 && !allowedDomains.includes(hostname)) {
                    node.remove();
                }
            } catch {
                node.remove();
            }
        }
    });
}

function getTitleFromURL(url) {
    return url.split('/').pop().replace(/-/g, ' ');
}

/**
 * Clone a template element by its ID.
 *
 * @param {string} templateId
 * @returns {DocumentFragment}
 */
function cloneTemplate(templateId) {
    return document.getElementById(templateId).content.cloneNode(true);
}

function searchPageQuery(query) {
    const resultsContainer = document.getElementById('search-page-results');
    if (!query.trim()) {
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(cloneTemplate('search-loading-template'));

    askHelpsiteAI(query);

    const formData = new FormData();
    formData.append('command', 'SearchHelpsite');
    formData.append('query', query.trim());

    const platform = new URLSearchParams(window.location.search).get('platform');
    if (platform) {
        formData.append('platform', platform);
    }

    fetch(SEARCH_API_URL, {method: 'POST', body: formData})
        .then((response) => response.json())
        .then((data) => {
            const results = (data.searchResults || []).filter((result) => !result.url.includes('/Unlisted/'));
            resultsContainer.innerHTML = '';
            if (results.length === 0) {
                resultsContainer.appendChild(cloneTemplate('search-no-results-template'));
                return;
            }
            results.forEach((result) => {
                const item = cloneTemplate('search-result-item-template');
                const link = item.querySelector('.search-result-item');
                link.href = result.url;
                link.querySelector('.search-result-title').textContent = getTitleFromURL(result.url);
                const description = link.querySelector('.search-result-description');
                if (result.description) {
                    description.textContent = result.description;
                } else {
                    description.remove();
                }
                resultsContainer.appendChild(item);
            });
        })
        .catch(() => {
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(cloneTemplate('search-error-template'));
        });
}

function clearSearchInput() {
    const input = document.getElementById('search-page-input');
    input.value = '';
    input.focus();
}

let aiAbortController = null;

let turndownService = null;
if (typeof TurndownService !== 'undefined') {
    turndownService = new TurndownService({headingStyle: 'atx', bulletListMarker: '-'});
    turndownService.escape = (text) => text;
    turndownService.addRule('bold', {
        filter: ['strong', 'b'],
        replacement: (content) => '*' + content + '*',
    });
}

function copyAIResponseToClipboard(button, content) {
    const text = turndownService ? turndownService.turndown(content.innerHTML) : content.innerText;
    navigator.clipboard
        .writeText(text)
        .then(() => {
            button.classList.add('copied');
            setTimeout(() => {
                button.classList.remove('copied');
            }, 1500);
        })
        .catch(() => {});
}

function askHelpsiteAI(query) {
    const aiContainer = document.getElementById('ai-answer-container');
    if (!aiContainer) {
        return;
    }

    if (aiAbortController) {
        aiAbortController.abort();
    }
    aiAbortController = new AbortController();

    aiContainer.innerHTML = '';
    aiContainer.appendChild(cloneTemplate('ai-thinking-template'));

    const formData = new FormData();
    formData.append('command', 'AskHelpsiteAI');
    formData.append('query', query.trim());

    const platform = new URLSearchParams(window.location.search).get('platform');
    if (platform) {
        formData.append('platform', platform);
    }

    fetch(ASK_AI_API_URL, {
        method: 'POST',
        body: formData,
        signal: aiAbortController.signal,
    })
        .then((response) => response.json())
        .then((data) => {
            const answer = data.answer || '';
            if (!answer) {
                aiContainer.innerHTML = '';
                return;
            }

            const template = cloneTemplate('ai-response-template');
            const content = template.querySelector('.ai-content');
            content.innerHTML = DOMPurify.sanitize(answer, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'a', 'code', 'pre'],
                ALLOWED_ATTR: ['href', 'target', 'rel'],
            });

            const showMoreButton = template.querySelector('.ai-show-more');
            aiContainer.innerHTML = '';
            aiContainer.appendChild(template);

            const renderedCopyButton = aiContainer.querySelector('.ai-copy-button');
            const renderedContentForCopy = aiContainer.querySelector('.ai-content');
            renderedCopyButton.addEventListener('click', () => {
                copyAIResponseToClipboard(renderedCopyButton, renderedContentForCopy);
            });

            // Show "Show more" button if content overflows
            const renderedContent = aiContainer.querySelector('.ai-content');
            if (renderedContent.scrollHeight > renderedContent.clientHeight) {
                renderedContent.classList.add('has-overflow');
                showMoreButton.classList.remove('hidden');
                showMoreButton.addEventListener('click', () => {
                    renderedContent.classList.toggle('expanded');
                    showMoreButton.firstChild.textContent = renderedContent.classList.contains('expanded') ? 'Show less ' : 'Show more ';
                });
            }
        })
        .catch((error) => {
            if (error.name === 'AbortError') {
                return;
            }
            aiContainer.innerHTML = '';
            aiContainer.appendChild(cloneTemplate('ai-error-template'));
        });
}

function initSearchPage() {
    const searchForm = document.getElementById('search-page-form');
    if (!searchForm) {
        return;
    }

    const input = document.getElementById('search-page-input');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    const platform = params.get('platform') || '';

    const title = document.getElementById('search-page-title');
    if (query) {
        input.value = query;
        title.textContent = 'Search results';
        searchPageQuery(query);
    }

    input.focus();

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (query) {
            const url = '/search?q=' + encodeURIComponent(query) + (platform ? '&platform=' + encodeURIComponent(platform) : '');
            history.replaceState(null, '', url);
            title.textContent = 'Search results';
            searchPageQuery(query);
        }
    });

    document.getElementById('search-page-clear').addEventListener('click', clearSearchInput);
}

const ARTICLE_TOC_SELECTOR = '.article-toc';
const TOC_LINK_CLASS = 'link';
const ACTIVE_TOC_LINK_CLASS = 'selected-article';

function getArticleTocLinks() {
    return document.querySelectorAll(`${ARTICLE_TOC_SELECTOR} .${TOC_LINK_CLASS}`);
}

/**
 * decodeURIComponent throws on a stray %, which would skip search and header-menu setup.
 * Keep the raw fragment so a bad hash only fails to highlight.
 *
 * @param {String} value
 * @returns {String}
 */
function decodeHashFragment(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

function getHeadingForTocLink(link) {
    const headingID = decodeHashFragment(link.href.split('#').pop());
    return headingID ? document.getElementById(headingID) : null;
}

function setActiveTocLink(activeLink) {
    getArticleTocLinks().forEach((link) => {
        link.classList.toggle(ACTIVE_TOC_LINK_CLASS, link === activeLink);
    });
}

// Highlights the entry matching the URL hash, so that landing on a deep link, or coming back to one
// through the browser's history, bolds the same section a click on that entry would have.
function highlightTocLinkForHash() {
    if (!window.location.hash) {
        return;
    }
    const headingID = decodeHashFragment(window.location.hash.slice(1)).toLowerCase();
    const link = Array.from(getArticleTocLinks()).find((tocLink) => getHeadingForTocLink(tocLink)?.id.toLowerCase() === headingID);
    if (!link) {
        return;
    }
    setActiveTocLink(link);
}

const tocbotOptions = {
    // Where to render the table of contents.
    tocSelector: ARTICLE_TOC_SELECTOR,

    // Where to grab the headings to build the table of contents.
    contentSelector: '',

    // Disable the collapsible functionality of the library by
    // setting the maximum number of heading levels (6)
    collapseDepth: 6,
    headingSelector: 'h1, h2, h3, summary',

    // Main class to add to lists.
    listClass: 'lhn-items',

    // Main class to add to links.
    linkClass: TOC_LINK_CLASS,

    // The highlight follows what the reader asked for, so it is applied in `onClick` and by
    // `highlightTocLinkForHash`. tocbot's own scrollspy would fight that by reassigning the class
    // from the scroll position, so its active class is pointed at an unstyled name to disable it.
    activeLinkClass: 'tocbot-active-link',

    // `overflow-x: hidden` on `html, body` in _main.scss makes `overflow-y` compute to `auto`, so
    // `body` is the element that scrolls the page. tocbot scrolls with `window.scrollTo`, which does
    // nothing when the documentElement is not the scrolling element, so `onClick` uses
    // `scrollIntoView`: it scrolls whichever ancestor scrolls and honours its `scroll-padding-top`.
    scrollSmooth: false,

    onClick: (e) => {
        e.preventDefault();

        setActiveTocLink(e.target);

        const heading = getHeadingForTocLink(e.target);
        if (!heading) {
            return;
        }

        const hashText = e.target.href.split('#').pop();
        // Append hashText to the current URL without saving to history
        const newUrl = `${window.location.pathname}#${hashText}`;
        history.replaceState(null, '', newUrl);

        heading.scrollIntoView({behavior: 'smooth', block: 'start'});
    },
};

window.addEventListener('DOMContentLoaded', () => {
    injectFooterCopyright();

    if (window.tocbot) {
        window.tocbot.init({
            ...tocbotOptions,
            contentSelector: '.article-toc-content',
        });
    }

    highlightTocLinkForHash();

    initSearchPage();

    document.getElementById('header-button').addEventListener('click', toggleHeaderMenu);

    // Back button doesn't exist on all the pages
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    }

    const articleContent = document.getElementById('article-content');
    const lhnContent = document.getElementById('lhn-content');

    // This event listener checks if a link clicked in the LHN points to some section of the same page and toggles
    // the LHN menu in responsive view.
    lhnContent.addEventListener('click', (event) => {
        const clickedLink = event.target;
        if (clickedLink) {
            const href = clickedLink.getAttribute('href');
            if (href && href.startsWith('#') && !!document.getElementById(href.slice(1))) {
                toggleHeaderMenu();
            }
        }
    });
    lhnContent.addEventListener('wheel', (e) => {
        const scrollTop = lhnContent.scrollTop;
        const isScrollingPastLHNTop = e.deltaY < 0 && scrollTop === 0;
        const isScrollingPastLHNBottom = e.deltaY > 0 && isInRange(lhnContent.scrollHeight - lhnContent.offsetHeight, scrollTop - 1, scrollTop + 1);
        if (isScrollingPastLHNTop || isScrollingPastLHNBottom) {
            e.preventDefault();
        }
    });
    window.addEventListener('scroll', (e) => {
        const scrollingElement = e.target.scrollingElement;
        const scrollPercentageInArticleContent = clamp(scrollingElement.scrollTop - articleContent.offsetTop, 0, articleContent.scrollHeight) / articleContent.scrollHeight;
        lhnContent.scrollTop = scrollPercentageInArticleContent * lhnContent.scrollHeight;
    });
});

if (window.location.hash) {
    const lowerCaseHash = window.location.hash.toLowerCase();
    const element = document.getElementById(lowerCaseHash.slice(1));

    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
        });
    }
}

// Handle hash changes (like back/forward navigation)
window.addEventListener('hashchange', () => {
    if (!window.location.hash) {
        return;
    }
    const lowerCaseHash = window.location.hash.toLowerCase();
    document.getElementById(lowerCaseHash.slice(1))?.scrollIntoView({
        behavior: 'smooth',
    });
    highlightTocLinkForHash();
});
