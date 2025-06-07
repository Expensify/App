const expensifyClassicContent = document.getElementById('expensify-classic');
const newExpensifyContent = document.getElementById('new-expensify');
const platformTabs = document.getElementById('platform-tabs');

// Path name is of the form /articles/[platform]/[hub]/[resource]
const path = window.location.pathname.split('/');
let needPlatformTabExpensifyClassic = false;
if (path.length >= 3 && path[2] == 'expensify-classic') {
    needPlatformTabExpensifyClassic = true;
}

if (expensifyClassicContent || needPlatformTabExpensifyClassic) {
    const tab = document.createElement('div');
    tab.innerHTML = 'Expensify Classic';
    tab.id = 'platform-tab-expensify-classic';
    tab.classList.add('active');
    platformTabs.appendChild(tab);
}

let needPlatformTabNewExpensify = false;
if (path.length >= 3 && path[2] == 'new-expensify') {
    needPlatformTabNewExpensify = true;
}

if (newExpensifyContent || needPlatformTabNewExpensify) {
    const tab = document.createElement('div');
    tab.innerHTML = 'New Expensify';
    tab.id = 'platform-tab-new-expensify';

    if (!expensifyClassicContent) {
        tab.classList.add('active');
    }
    platformTabs.appendChild(tab);
}
