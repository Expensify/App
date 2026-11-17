import getAmountInputKeyboard from '@libs/getAmountInputKeyboard';

function getAmountFilterInputKeyboard() {
    return {...getAmountInputKeyboard(true), shouldShowFlipButton: false};
}

export default getAmountFilterInputKeyboard;
