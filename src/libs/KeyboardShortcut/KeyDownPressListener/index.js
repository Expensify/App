function addKeyDownPressListner(callbackFunction) {
    document.addEventListener('keydown', callbackFunction);
}

function removeKeyDownPressListner(callbackFunction) {
    document.removeEventListener('keydown', callbackFunction);
}

export {addKeyDownPressListner, removeKeyDownPressListner};
