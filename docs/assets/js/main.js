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
