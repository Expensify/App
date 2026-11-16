// Web decimal keypads need a separate sign button because they may omit the minus key.
function getAmountFilterInputKeyboard() {
    return {keyboardType: undefined, shouldShowFlipButton: true};
}

export default getAmountFilterInputKeyboard;
