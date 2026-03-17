const platformTabs = document.getElementById('platform-tabs');

// Path name is of the form /articles/[platform]/[hub]/[resource]
const path = window.location.pathname.split('/');
const currentPlatform = path.length >= 3 ? path[2] : '';

function createTab(name, id) {
    const tab = document.createElement('div');
    tab.innerHTML = name;
    tab.id = `platform-tab-${id}`;
    tab.classList.add('badge');
    platformTabs.appendChild(tab);
}

if (currentPlatform === 'expensify-classic') {
    createTab('Expensify Classic', currentPlatform);
} else if (currentPlatform === 'new-expensify') {
    createTab('New Expensify', currentPlatform);
} else if (currentPlatform === 'travel') {
    createTab('Expensify Travel', currentPlatform);
}
