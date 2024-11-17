function updateURLHashOnScroll() {
    const activeLink = document.querySelector('.toc-sidebar .is-active-link');
    if (activeLink) {
        const hash = activeLink.getAttribute('href');
        if (history.pushState) {
            history.pushState(null, null, hash);
        } else {
            window.location.hash = hash;
        }
    }
}

function scrollActiveLinkIntoView() {
    const activeLink = document.querySelector('.toc-sidebar .is-active-link');
    if (activeLink) {
        activeLink.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

tocbot.init({
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
  headingObjectCallback: function(obj, element) {
    const tocTitle = element.getAttribute('data-toc-title');
    if (tocTitle) {
        obj.textContent = tocTitle;
    }
    return obj;
  },
  onClick: function(e) {
      setTimeout(scrollActiveLinkIntoView, 300);
      document.getElementById('toc-sidebar').classList.remove('open'); // Close TOC after clicking
  },
  scrollEndCallback: function() {
      updateURLHashOnScroll();
      scrollActiveLinkIntoView();
  }
});

function adjustAnchorOnLoad() {
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            window.scrollTo({
                top: element.getBoundingClientRect().top + window.pageYOffset - 80,
                behavior: 'smooth'
            });
        }
    }
}

window.addEventListener('load', adjustAnchorOnLoad);

// Toggle sidebar on hamburger click
document.getElementById('hamburger').addEventListener('click', function() {
    var sidebar = document.getElementById('toc-sidebar');
    sidebar.classList.toggle('open');
});

// Keep track of the search results
let g_searchResultsArray = [];
let g_currentSelectionIndex = -1;
let g_highlightedSection = null;

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
        g_searchResults.focus(); // Focus on search results if they exist
    } else {
        g_searchInput.focus();
    }
}

// Open modal when search icon is clicked
g_searchIcon.addEventListener('click', showSearchModal);

// Open modal when Cmd+K is pressed
document.addEventListener('keydown', function(event) {
    if (event.metaKey && event.key === 'k') {
        event.preventDefault();
        showSearchModal();
    }
});

// Close modal when pressing "Escape"
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && g_searchModal.style.display === 'flex') {
        g_searchModal.style.display = 'none';
    }
});

// Close modal when clicking outside of modal content
window.addEventListener('click', function(event) {
    if (event.target == g_searchModal) {
        g_searchModal.style.display = 'none';
    }
});

// Handle keyboard navigation (arrow keys and enter)
g_searchResults.addEventListener('keydown', function(event) {
    // If the modal is being shown and has active search results, capture keydown
    if (g_searchModal.style.display === 'flex' && g_searchResultsArray.length > 0) {
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
            g_searchInput.focus(); // Focus back on input if typing occurs
        }
    }
});

function selectNextResult() {
    if (g_currentSelectionIndex < g_searchResultsArray.length - 1) {
        g_currentSelectionIndex++;
        updateSelectedResult();
    }
}

function selectPreviousResult() {
    if (g_currentSelectionIndex > 0) {
        g_currentSelectionIndex--;
        updateSelectedResult();
    }
}

function updateSelectedResult() {
    g_searchResultsArray.forEach((result, index) => {
        if (index === g_currentSelectionIndex) {
            result.classList.add('highlight');
            result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            result.classList.remove('highlight');
        }
    });
}

function navigateToSelectedResult() {
    const selectedResult = g_searchResultsArray[g_currentSelectionIndex];
    const link = selectedResult.querySelector('a');
    if (link) {
        link.click();
    }
}

// Execute search when pressing "Enter" in the input field
g_searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        g_searchSubmit.click();
    }
});

// Perform search when search button is clicked
const g_searchSubmit = document.getElementById('search-submit');

// Handle submitting the search query
g_searchSubmit.addEventListener('click', async function() {
    const query = g_searchInput.value.trim().toLowerCase();
    g_searchResults.innerHTML = '';
    g_currentSelectionIndex = -1;

    if (query.length === 0) {
        g_searchResults.style.display = 'none';
        return;
    }

    // Load the JSON search index file, if not already defined
    if (g_index === null) {
        console.log('Loading search index from:', '/searchIndex.json');
        const response = await fetch('/searchIndex.json');
        const indexData = await response.json();
        g_index = new FlexSearch.Document({
            document: {
                id: 'id',
                index: ['content'], // Index on the content field
                store: ['title', 'url', 'content'], // Store title, URL, and content
            }
        });

        // Import the index
        for (const [key, data] of Object.entries(indexData)) {
            await g_index.import(key, data);
        }
    } else {
        console.log('Reusing existing search index');
    }

    // Perform search
    const results = await g_index.search({
        query,
        field: 'content'
    });

    if (results.length > 0) {
        g_searchResultsArray = [];
        results.forEach(result => {
            result.result.forEach(docId => {
                const doc = g_index.store[docId];
                if (doc && doc.content) {
                    const searchTermIndex = doc.content.toLowerCase().indexOf(query);
                    const contextBefore = doc.content.substring(Math.max(0, searchTermIndex - 30), searchTermIndex);
                    const contextAfter = doc.content.substring(searchTermIndex + query.length, Math.min(doc.content.length, searchTermIndex + query.length + 30));
                    const searchResultHtml = `
                      <div class="search-result">
                        <a href="${doc.url}" class="search-result-title" onclick="scrollToTOC('${doc.url}')">${doc.title}</a>
                        <div class="search-result-context">...${contextBefore}<strong>${query}</strong>${contextAfter}...</div>
                      </div>
                    `;
                    const resultElement = document.createElement('div');
                    resultElement.innerHTML = searchResultHtml;
                    g_searchResults.appendChild(resultElement);
                    g_searchResultsArray.push(resultElement);

                    // Automatically select the first result
                    if (g_searchResultsArray.length === 1) {
                        g_currentSelectionIndex = 0;
                        updateSelectedResult();
                    }
                }
            });
        });
        g_searchResults.style.display = 'block';
        g_searchResults.focus();  // Focus on search results whenever there are results
    } else {
        g_searchResults.style.display = 'none';
    }
});

// Trigger the TOC link click to use TocBot's smooth scrolling behavior
function scrollToTOC(url) {
    const elementId = url.split('#')[1];
    const tocLink = document.querySelector(`.toc-sidebar a[href="#${elementId}"]`);

    if (tocLink) {
        tocLink.click(); // Simulate a click on the TOC link for smooth scroll
        highlightSelectedSection(elementId); // Highlight the section in yellow
        closeModalAfterClick();
    }
}

// Highlight the selected section
function highlightSelectedSection(sectionId) {
    // Remove the previous highlight, if any
    if (g_highlightedSection) {
        g_highlightedSection.classList.remove('highlight-section');
    }

    // Highlight the new section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        sectionElement.classList.add('highlight-section');
        g_highlightedSection = sectionElement;
    }
}

// Close modal after clicking a search result
function closeModalAfterClick() {
    g_searchModal.style.display = 'none';
}