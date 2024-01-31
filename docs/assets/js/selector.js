/**
 * 1. The selector can have any name
 * 2. The selector should be in sync in all pages
 * 3. Minimal code in article
 * 
 * 

This can be derived from class name .

 */



function selectOption(s) {
    if (!s) {
        return;
    }

    const allOptions = Array.from(s.options);
    const selectedValue = s.options[s.selectedIndex].value;
    
    allOptions.forEach(option => {
        if (option.value === selectedValue) {
            const toShow = document.getElementsByClassName(option.value);
            for (e of toShow) {
                e.classList.remove('hidden');
            }
            return;
        }
        
        const toHide = document.getElementsByClassName(option.value);
        for (e of toHide) {
            e.classList.add('hidden');
        }
    });
}

window.onload = selectOption(document.getElementsByClassName('platform')[0]);