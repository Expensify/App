function listenKeyDown(callback) {
    document.addEventListener('keydown', callback);
}

function removeListenKeyDown(callback) {
    document.removeEventListener('keydown', callback);
}

export default {listenKeyDown, removeListenKeyDown};

