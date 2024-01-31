/**
 * 1. The selector can have any name
 * 2. The selector should be in sync in all pages
 * 3. Minimal code in article
 * 
 * 

This can be derived from class name .

 */




const selectors = document.getElementsByClassName('selector');
for (let selector of selectors) {
    // selector.addEventListener('onchange')
}

function select(e) {
    const selectedValue = e.options[e.selectedIndex].value;
    const toHide = document.getElementsByClassName(selectedValue);
    for (element of toHide) {
        element.classList.add('hidden');
    }
}