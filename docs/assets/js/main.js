/* eslint-disable no-unused-vars */
function toggleHeaderMenu() {
    const lhn = document.getElementById('lhn');
    const lhnContent = document.getElementById('lhn-content');
    const anguleUpIcon = document.getElementById('angle-up-icon');
    const barsIcon = document.getElementById('bars-icon');
    if (lhnContent.className === 'expanded') {
        // Collapse the LHN in mobile
        lhn.className = '';
        lhnContent.className = '';
        barsIcon.classList.remove('hide');
        anguleUpIcon.classList.add('hide');
        document.body.classList.remove('disable-scrollbar');
    } else {
        // Expand the LHN in mobile
        lhn.className = 'expanded';
        lhnContent.className = 'expanded';
        barsIcon.classList.add('hide');
        anguleUpIcon.classList.remove('hide');
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

function injectFooterCopywrite() {
    const footer = document.getElementById('footer-copywrite-date');
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
    document.getElementById('gsc-i-id1').focus();

    // Make body unscrollable
    const yAxis = document.documentElement.style.getPropertyValue('y-axis');
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${yAxis}`;

    document.getElementById('gsc-i-id1').focus();

    // Close the sidebar when clicking sidebar layer (outside the sidebar search)
    const sidebarLayer = document.getElementById('sidebar-layer');
    if (sidebarLayer) {
        sidebarLayer.addEventListener('click', closeSidebarOnClickOutside);
    }
}

// Function to adapt & fix cropped SVG viewBox from Google based on viewport (Mobile or Tablet-Desktop)
function changeSVGViewBoxGoogle() {
    // Get all inline Google SVG elements on the page
    const svgsGoogle = document.querySelectorAll('svg');

    Array.from(svgsGoogle).forEach((svg) => {
        // Set the viewBox attribute to '0 0 13 13' to make the svg fit in the mobile view
        svg.setAttribute('viewBox', '0 0 20 20');
        svg.setAttribute('height', '16');
        svg.setAttribute('width', '16');
    });
}

// Function to insert element after another
// In this case, we insert the label element after the Google Search Input so we can have the same label animation effect
function insertElementAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

// Update the ICON for search input.
/* Change the path of the Google Search Button icon into Expensify icon */
function updateGoogleSearchIcon() {
    const node = document.querySelector('.gsc-search-button.gsc-search-button-v2 svg path');
    node.setAttribute(
        'd',
        'M8 1c3.9 0 7 3.1 7 7 0 1.4-.4 2.7-1.1 3.8l5.2 5.2c.6.6.6 1.5 0 2.1-.6.6-1.5.6-2.1 0l-5.2-5.2C10.7 14.6 9.4 15 8 15c-3.9 0-7-3.1-7-7s3.1-7 7-7zm0 3c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z',
    );
}

// Need to wait up until page is load, so the svg viewBox can be changed
// And the search label can be inserted
window.addEventListener('load', () => {
    changeSVGViewBoxGoogle();

    updateGoogleSearchIcon();

    // Add required into the search input
    const searchInput = document.getElementById('gsc-i-id1');
    searchInput.setAttribute('required', '');

    // Insert search label after the search input
    const searchLabel = document.createElement('label');
    searchLabel.classList.add('search-label');
    searchLabel.innerHTML = 'Search for something...';
    insertElementAfter(searchInput, searchLabel);
});

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

function selectNewExpensify(newExpensifyTab, newExpensifyContent, expensifyClassicTab, expensifyClassicContent) {
    newExpensifyTab.classList.add('active');
    newExpensifyContent.classList.remove('hidden');

    if (expensifyClassicTab && expensifyClassicContent) {
        expensifyClassicTab.classList.remove('active');
        expensifyClassicContent.classList.add('hidden');
    }
    window.tocbot.refresh({
        ...tocbotOptions,
        contentSelector: '#new-expensify',
    });
}

function selectExpensifyClassic(newExpensifyTab, newExpensifyContent, expensifyClassicTab, expensifyClassicContent) {
    expensifyClassicTab.classList.add('active');
    expensifyClassicContent.classList.remove('hidden');

    if (newExpensifyTab && newExpensifyContent) {
        newExpensifyTab.classList.remove('active');
        newExpensifyContent.classList.add('hidden');
    }

    window.tocbot.refresh({
        ...tocbotOptions,
        contentSelector: '#expensify-classic',
    });
}

window.addEventListener('DOMContentLoaded', () => {
    injectFooterCopywrite();

    // Handle open & close the sidebar
    const buttonOpenSidebar = document.getElementById('toggle-search-open');
    if (buttonOpenSidebar) {
        buttonOpenSidebar.addEventListener('click', openSidebar);
    }

    const buttonCloseSidebar = document.getElementById('toggle-search-close');
    if (buttonCloseSidebar) {
        buttonCloseSidebar.addEventListener('click', closeSidebar);
    }

    const expensifyClassicTab = document.getElementById('platform-tab-expensify-classic');
    const newExpensifyTab = document.getElementById('platform-tab-new-expensify');

    const expensifyClassicContent = document.getElementById('expensify-classic');
    const newExpensifyContent = document.getElementById('new-expensify');

    let contentSelector = '.article-toc-content';
    if (expensifyClassicContent) {
        contentSelector = '#expensify-classic';
        selectExpensifyClassic(newExpensifyTab, newExpensifyContent, expensifyClassicTab, expensifyClassicContent);
    } else if (newExpensifyContent) {
        contentSelector = '#new-expensify';
        selectNewExpensify(newExpensifyTab, newExpensifyContent, expensifyClassicTab, expensifyClassicContent);
    }

    if (window.tocbot) {
        window.tocbot.init({
            ...tocbotOptions,
            contentSelector,
        });
    }

    // eslint-disable-next-line es/no-optional-chaining
    expensifyClassicTab?.addEventListener('click', () => {
        selectExpensifyClassic(newExpensifyTab, newExpensifyContent, expensifyClassicTab, expensifyClassicContent);
    });

    // eslint-disable-next-line es/no-optional-chaining
    newExpensifyTab?.addEventListener('click', () => {
        selectNewExpensify(newExpensifyTab, newExpensifyContent, expensifyClassicTab, expensifyClassicContent);
    });

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
