/**
 * For native devices, there will never be more than one
 * client running at a time, so this lib is a big no-op
 */

import ActiveClientManagerModule from './types';

function init() {}
function isClientTheLeader() {
    return true;
}
function isReady() {
    return Promise.resolve();
}

const ActiveClientManager: ActiveClientManagerModule = {
    init,
    isClientTheLeader,
    isReady,
};

export default ActiveClientManager;
