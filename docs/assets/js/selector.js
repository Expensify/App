function syncSelectors(selectedIndex) {
    const allSelects = document.querySelectorAll('select');
    for (let i = 0; i < allSelects.length; i++) {
        allSelects[i].selectedIndex = selectedIndex;
    }
}

function selectOption(select) {
    if (!select) {
        return;
    }

    syncSelectors(select.selectedIndex);

    const allOptions = Array.from(select.options);
    const selectedValue = select.options[select.selectedIndex].value;

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
