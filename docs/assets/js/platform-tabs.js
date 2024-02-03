const expensifyClassicContent = document.getElementById('expensify-classic');
const newExpensifyContent = document.getElementById('new-expensify');
const platformTabs = document.getElementById('platform-tabs');

if (expensifyClassicContent) {
    const tab = document.createElement('div');
    tab.innerHTML = 'Expensify Classic';
    tab.id = 'platform-tab-expensify-classic';
    tab.classList.add('active');
    platformTabs.appendChild(tab);
}

if (newExpensifyContent) {
    const tab = document.createElement('div');
    tab.innerHTML = 'New Expensify';
    tab.id = 'platform-tab-new-expensify';

    if (!expensifyClassicContent) {
        tab.classList.add('active');
    }
    platformTabs.appendChild(tab);
}
