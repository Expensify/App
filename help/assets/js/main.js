if (window.tocbot) {
    window.tocbot.init({
        // Where to render the table of contents.
        tocSelector: '.article-toc',

        // Where to grab the headings to build the table of contents.
        contentSelector: '.article-toc-content',

        // Disable the collapsible functionality of the library by
        // setting the maximum number of heading levels (6)
        collapseDepth: 6,
    });
}

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
