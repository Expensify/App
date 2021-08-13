/**
 * For native devices, there will never be more than one
 * client running at a time, so this lib is a big no-op
 */

function init() {}
function isClientTheLeader() {
    return true;
}
function isReady() {
    return Promise.resolve();
}

export {
    init,
    isReady,
    isClientTheLeader,
};
