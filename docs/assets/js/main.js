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

function closeSidebar() {
    document.getElementById('sidebar-layer').style.display = 'none';

    // Make the body scrollable again
    const body = document.body;
    const scrollY = body.style.top;

    // Reset the position and top styles of the body element
    body.style.position = '';
    body.style.top = '';

    // Scroll to the original scroll position
    window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
}

function closeSidebarOnClickOutside(event) {
    const sidebarLayer = document.getElementById('sidebar-layer');

    if (event.target !== sidebarLayer) {
        return;
    }
    closeSidebar();
}

function openSidebar() {
    document.getElementById('sidebar-layer').style.display = 'block';
    document.getElementById('search-input').focus();

    // Make body unscrollable
    const yAxis = document.documentElement.style.getPropertyValue('y-axis');
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${yAxis}`;

    // Close the sidebar when clicking sidebar layer (outside the sidebar search)
    const sidebarLayer = document.getElementById('sidebar-layer');
    if (sidebarLayer) {
        sidebarLayer.addEventListener('click', closeSidebarOnClickOutside);
    }
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

/**
 * Search the help site using the SearchHelpsite API.
 *
 * @param {string} query
 */
function searchHelpsite(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!query.trim()) {
        resultsContainer.innerHTML = '';
        return;
    }

    resultsContainer.innerHTML = '';
    resultsContainer.appendChild(cloneTemplate('search-loading-template'));

    const formData = new FormData();
    formData.append('command', 'SearchHelpsite');
    formData.append('query', query.trim());

    fetch('https://www.expensify.com/api/SearchHelpsite', {
        method: 'POST',
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            const results = data.searchResults || [];
            resultsContainer.innerHTML = '';

            if (results.length === 0) {
                resultsContainer.appendChild(cloneTemplate('search-no-results-template'));
                return;
            }

            results.forEach((result) => {
                const item = cloneTemplate('search-result-item-template');
                const link = item.querySelector('.search-result-item');
                link.href = result.url;
                link.querySelector('.search-result-title').textContent = result.url.split('/').pop().replace(/-/g, ' ');
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

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                searchHelpsite(searchInput.value);
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            searchHelpsite(searchInput.value);
        });
    }
}

const FIXED_HEADER_HEIGHT = 80;

const tocbotOptions = {
    // Where to render the table of contents.
    tocSelector: '.article-toc',

    // Where to grab the headings to build the table of contents.
    contentSelector: '',

    // Disable the collapsible functionality of the library by
    // setting the maximum number of heading levels (6)
    collapseDepth: 6,
    headingSelector: 'h1, h2, h3, summary',

    // Main class to add to lists.
    listClass: 'lhn-items',

    // Main class to add to links.
    linkClass: 'link',

    // Class to add to active links,
    // the link corresponding to the top most heading on the page.
    activeLinkClass: 'selected-article',

    // Headings offset between the headings and the top of the document (requires scrollSmooth enabled)
    headingsOffset: FIXED_HEADER_HEIGHT,
    scrollSmoothOffset: -FIXED_HEADER_HEIGHT,
    scrollSmooth: true,

    // If there is a fixed article scroll container, set to calculate titles' offset
    scrollContainer: 'content-area',

    onClick: (e) => {
        e.preventDefault();
        const hashText = e.target.href.split('#').pop();
        // Append hashText to the current URL without saving to history
        const newUrl = `${window.location.pathname}#${hashText}`;
        history.replaceState(null, '', newUrl);
    },
};

// Define the media query string for the mobile breakpoint
const mobileBreakpoint = window.matchMedia('(max-width: 799px)');

// Function to update tocbot options and refresh
function updateTocbotOptions(headingsOffset, scrollSmoothOffset) {
    tocbotOptions.headingsOffset = headingsOffset;
    tocbotOptions.scrollSmoothOffset = scrollSmoothOffset;
    window.tocbot.refresh({
        ...tocbotOptions,
    });
}

function handleBreakpointChange() {
    const isMobile = mobileBreakpoint.matches;
    const headingsOffset = isMobile ? FIXED_HEADER_HEIGHT : 0;
    const scrollSmoothOffset = isMobile ? -FIXED_HEADER_HEIGHT : 0;

    // Update tocbot options only if there is a change in offsets
    if (tocbotOptions.headingsOffset !== headingsOffset || tocbotOptions.scrollSmoothOffset !== scrollSmoothOffset) {
        updateTocbotOptions(headingsOffset, scrollSmoothOffset);
    }
}

// Add listener for changes to the media query status using addEventListener
mobileBreakpoint.addEventListener('change', handleBreakpointChange);

// Initial check
handleBreakpointChange();

window.addEventListener('DOMContentLoaded', () => {
    injectFooterCopyright();

    // Handle open & close the sidebar
    const buttonOpenSidebar = document.getElementById('toggle-search-open');
    if (buttonOpenSidebar) {
        buttonOpenSidebar.addEventListener('click', openSidebar);
    }

    const buttonCloseSidebar = document.getElementById('toggle-search-close');
    if (buttonCloseSidebar) {
        buttonCloseSidebar.addEventListener('click', closeSidebar);
    }

    if (window.tocbot) {
        window.tocbot.init({
            ...tocbotOptions,
            contentSelector: '.article-toc-content',
        });
    }

    initSearch();

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

        // Count property of y-axis to keep scroll position & reference it later for making the body fixed when sidebar opened
        document.documentElement.style.setProperty('y-axis', `${window.scrollY}px`);
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
});

