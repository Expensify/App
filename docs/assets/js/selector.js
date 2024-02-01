function selectOption(s) {
    if (!s) {
        return;
    }

    // Keep all selects on the page in sync
    const allSelects = document.querySelectorAll('select');
    for (let i = 0; i < allSelects.length; i++) {
        allSelects[i].selectedIndex = s.selectedIndex;
    }

    const allOptions = Array.from(s.options);
    const selectedValue = s.options[s.selectedIndex].value;

    // Hide section that isn't selected, and show section that is selected.
    allOptions.forEach((option) => {
        if (option.value === selectedValue) {
            const toShow = document.getElementsByClassName(option.value);
            for (let i = 0; i < toShow.length; i++) {
                toShow[i].classList.remove('hidden');
            }
            return;
        }

        const toHide = document.getElementsByClassName(option.value);
        for (let i = 0; i < toHide.length; i++) {
            toHide[i].classList.add('hidden');
        }
    });
}

window.onload = selectOption(document.getElementsByClassName('selector')[0]);
