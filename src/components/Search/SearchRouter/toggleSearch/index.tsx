function openSearch(setSearchState: React.Dispatch<React.SetStateAction<boolean>>) {
    return setSearchState(true);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- afterTransition is used on native only
function closeSearch(setSearchState: React.Dispatch<React.SetStateAction<boolean>>, afterTransition?: () => void) {
    return setSearchState(false);
}

export {openSearch, closeSearch};
