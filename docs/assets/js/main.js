
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

function navigateBack() {
    if (window.location.pathname.includes('/request-money/')) {
        window.location.href = '/hubs/request-money';
    } else if (window.location.pathname.includes('/send-money/')) {
        window.location.href = '/hubs/send-money';
    } else {
        window.location.href = '/hubs/other';
    }

    // Add a little delay to avoid showing the previous content in a fraction of a time
    setTimeout(toggleHeaderMenu, 250);
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.tocbot) {
        window.tocbot.init({
        // Where to render the table of contents.
            tocSelector: '.article-toc',

            // Where to grab the headings to build the table of contents.
            contentSelector: '.article-toc-content',

            // Disable the collapsible functionality of the library by
            // setting the maximum number of heading levels (6)
            collapseDepth: 6,

            // Main class to add to lists.
            listClass: 'lhn-items',

            // Main class to add to links.
            linkClass: 'link',

            // Class to add to active links,
            // the link corresponding to the top most heading on the page.
            activeLinkClass: 'selected-article',

            // Headings offset between the headings and the top of the document (requires scrollSmooth enabled)
            headingsOffset: 80,
            scrollSmoothOffset: -80,
            scrollSmooth: true,

            // If there is a fixed article scroll container, set to calculate titles' offset
            scrollContainer: 'content-area',

            // onclick function to apply to all links in toc. will be called with
            // the event as the first parameter, and this can be used to stop,
            // propagation, prevent default or perform action
            onClick() {
                toggleHeaderMenu();
            },
        });
    }

    document.getElementById('header-button').addEventListener('click', toggleHeaderMenu);

    // Back button doesn't exist on all the pages
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', navigateBack);
    }
});
