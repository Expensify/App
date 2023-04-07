function removeListenKeyDown(callback) {
    document.removeEventListener('keydown', callback);
}

export default removeListenKeyDown;
