function openSearch(setSearchState: React.Dispatch<React.SetStateAction<boolean>>) {
    return setSearchState(true);
}

function closeSearch(setSearchState: React.Dispatch<React.SetStateAction<boolean>>) {
    return setSearchState(false);
}

export {openSearch, closeSearch};
