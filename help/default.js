function updateURLHashOnScroll() {
    const activeLink = document.querySelector('.toc-sidebar .is-active-link');
    if (!activeLink) {
        return;
    }
    const hash = activeLink.getAttribute('href');
    if (window.history.pushState) {
        window.history.pushState(null, null, hash);
    } else {
        window.location.hash = hash;
    }
}

function scrollActiveLinkIntoView() {
    const activeLink = document.querySelector('.toc-sidebar .is-active-link');
    if (activeLink) {
        activeLink.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
    }
}

// Assuming tocbot is globally defined
window.tocbot.init({
    tocSelector: '.js-toc',
    contentSelector: '.js-toc-content',
    headingSelector: 'h1, h2, h3, h4, h5, h6',
    collapseDepth: 4,
    orderedList: false,
    scrollSmooth: true,
    scrollToActive: true,
    enableUrlHashUpdateOnScroll: false,
    headingsOffset: 80,
    scrollSmoothOffset: -80,
    tocScrollingWrapper: document.querySelector('.toc-sidebar'),
    tocScrollOffset: 80,
    headingObjectCallback(obj, element) {
        const tocTitle = element.getAttribute('data-toc-title');
        if (tocTitle) {
            const newObj = {...obj};
            newObj.textContent = tocTitle;
            return newObj;
        }
        return obj;
    },
    onClick() {
        setTimeout(scrollActiveLinkIntoView, 300);
        document.getElementById('toc-sidebar').classList.remove('open');
    },
    scrollEndCallback() {
        updateURLHashOnScroll();
        scrollActiveLinkIntoView();
    },
});

function adjustAnchorOnLoad() {
    if (!window.location.hash) {
        return;
    }
    const element = document.querySelector(window.location.hash);
    if (element) {
        window.scrollTo({
            top: element.getBoundingClientRect().top + window.pageYOffset - 80,
            behavior: 'smooth',
        });
    }
}

window.addEventListener('load', adjustAnchorOnLoad);

// Toggle sidebar on hamburger click
document.getElementById('hamburger').addEventListener('click', function () {
    const sidebar = document.getElementById('toc-sidebar');
    sidebar.classList.toggle('open');
});

// Keep track of the search results
let g_searchResultsArray = [];
let g_currentSelectionIndex = -1;

// Declare the index variable globally so it can be reused
let g_index = null;

// Look up some commonly used elements once
const g_searchIcon = document.getElementById('search-icon');
const g_searchModal = document.getElementById('search-modal');
const g_searchResults = document.getElementById('search-results');
const g_searchInput = document.getElementById('search-input');

// Show and initialize the search modal
function showSearchModal() {
    g_searchModal.style.display = 'flex';
    if (g_searchResultsArray.length > 0) {
        g_searchResults.style.display = 'block';
        g_searchResults.focus();
    } else {
        g_searchInput.focus();
    }
}

// Open modal when search icon is clicked
g_searchIcon.addEventListener('click', showSearchModal);

// Open modal when Cmd+K is pressed
document.addEventListener('keydown', function (event) {
    if (!(event.metaKey && event.key === 'k')) {
        return;
    }
    event.preventDefault();
    showSearchModal();
});

// Close modal when pressing "Escape"
document.addEventListener('keydown', function (event) {
    if (!(event.key === 'Escape' && g_searchModal.style.display === 'flex')) {
        return;
    }
    g_searchModal.style.display = 'none';
});

// Close modal when clicking outside of modal content
window.addEventListener('click', function (event) {
    if (!(event.target === g_searchModal)) {
        return;
    }
    g_searchModal.style.display = 'none';
});

// Handle keyboard navigation (arrow keys and enter)
g_searchResults.addEventListener('keydown', function (event) {
    if (g_searchModal.style.display !== 'flex' || g_searchResultsArray.length === 0) {
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        selectNextResult();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        selectPreviousResult();
    } else if (event.key === 'Enter' && g_currentSelectionIndex >= 0) {
        event.preventDefault();
        navigateToSelectedResult();
    } else if (!['Tab', 'Shift'].includes(event.key)) {
        g_searchInput.focus();
    }
});

function selectNextResult() {
    if (g_currentSelectionIndex >= g_searchResultsArray.length - 1) {
        return;
    }
    g_currentSelectionIndex++;
    updateSelectedResult();
}

function selectPreviousResult() {
    if (g_currentSelectionIndex <= 0) {
        return;
    }
    g_currentSelectionIndex--;
    updateSelectedResult();
}

function updateSelectedResult() {
    for (const [index, result] of g_searchResultsArray.entries()) {
        if (index === g_currentSelectionIndex) {
            result.classList.add('highlight');
            result.scrollIntoView({behavior: 'smooth', block: 'nearest'});
        } else {
            result.classList.remove('highlight');
        }
    }
}

function navigateToSelectedResult() {
    const selectedResult = g_searchResultsArray[g_currentSelectionIndex];
    const link = selectedResult.querySelector('a');
    if (link) {
        link.click();
    }
}

// Execute search when pressing "Enter" in the input field
g_searchInput.addEventListener('keydown', function (event) {
    if (!(event.key === 'Enter')) {
        return;
    }
    event.preventDefault();
    document.getElementById('search-submit').click();
});

// Perform search when search button is clicked
// Assuming search-submit is defined
document.getElementById('search-submit').addEventListener('click', function () {
    const query = g_searchInput.value.trim().toLowerCase();
    g_searchResults.innerHTML = '';
    g_currentSelectionIndex = -1;

    if (query.length === 0) {
        g_searchResults.style.display = 'none';
        return;
    }

    if (g_index === null) {
        // Assuming the fetch works correctly without console.log
        fetch('/searchIndex.json')
            .then((response) => response.json())
            .then((indexData) => {
                g_index = new window.FlexSearch.Document({
                    document: {
                        id: 'id',
                        index: ['content'],
                        store: ['title', 'url', 'content'],
                    },
                });

                for (const [key, data] of Object.entries(indexData)) {
                    g_index.import(key, data);
                }

                performSearch(query);
            });
    } else {
        performSearch(query);
    }
});

function performSearch(query) {
    const results = g_index.search({
        query,
        field: 'content',
    });

    if (results && results.length > 0) {
        g_searchResultsArray = [];
        for (const result of results) {
            for (const docId of result.result) {
                const doc = g_index.store[docId];
                if (doc && doc.content) {
                    const searchTermIndex = doc.content.toLowerCase().indexOf(query);
                    const contextBefore = doc.content.substring(Math.max(0, searchTermIndex - 30), searchTermIndex);
                    const contextAfter = doc.content.substring(searchTermIndex + query.length, Math.min(doc.content.length, searchTermIndex + query.length + 30));
                    const searchResultHtml = `
                        <div class="search-result">
                            <a href="${doc.url}" class="search-result-title">${doc.title}</a>
                            <div class="search-result-context">...${contextBefore}<strong>${query}</strong>${contextAfter}...</div>
                        </div>
                    `;
                    const resultElement = document.createElement('div');
                    resultElement.innerHTML = searchResultHtml;
                    g_searchResults.appendChild(resultElement);
                    g_searchResultsArray.push(resultElement);

                    if (g_searchResultsArray.length === 1) {
                        g_currentSelectionIndex = 0;
                        updateSelectedResult();
                    }
                }
            }
        }
        g_searchResults.style.display = 'block';
        g_searchResults.focus();
    } else {
        g_searchResults.style.display = 'none';
    }
}
