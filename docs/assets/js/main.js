
function openArticle(path) { // eslint-disable-line no-unused-vars
    window.location.href = path;
}

function toggleHeaderMenu() { // eslint-disable-line no-unused-vars
    const lhn = document.getElementById('lhn');
    const anguleUpIcon = document.getElementById('angle-up-icon');
    const barsIcon = document.getElementById('bars-icon');
    if (lhn.className === 'expanded') {
        // Collapse the LHN in mobile
        lhn.className = '';
        barsIcon.classList.remove('hide');
        anguleUpIcon.classList.add('hide');
    } else {
        // Expand the LHN in mobile
        lhn.className = 'expanded';
        barsIcon.classList.add('hide');
        anguleUpIcon.classList.remove('hide');
    }
}

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
        activeLinkClass: 'selected-hub',

        // Only takes affect when `tocSelector` is scrolling,
        // keep the toc scroll position in sync with the content.
        disableTocScrollSync: true,

        // onclick function to apply to all links in toc. will be called with
        // the event as the first parameter, and this can be used to stop,
        // propagation, prevent default or perform action
        onClick() {
            toggleHeaderMenu();
        },
    });
}
