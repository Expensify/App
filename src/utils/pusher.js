// src/utils/pusher.js

import Pusher from 'pusher-js';

let pusherInstance = null;

function initializePusher(appKey, cluster) {
  if (!pusherInstance) {
    pusherInstance = new Pusher(appKey, {
      cluster: cluster,
      forceTLS: true,
      disableStats: true,
      authEndpoint: '/api/pusher/auth',
      reconnectAttempts: Infinity,
      reconnectInterval: 1000
    });
  }
  return pusherInstance;
}

function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
  }
}

export { initializePusher, disconnectPusher };
