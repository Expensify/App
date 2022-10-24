// Development entry point of the desktop app with support for live reload
// We keep this file (dev.js) out Webpack bundling process and provide it raw to Electron
// Reloading Electron on change requires some native Node dependencies which cannot be
// easily bundled with webpack, and we don't really need them bundled for staging/prod
// We are free to load any bundled code from this file, and we load the bundled main.js from dist

// The `dist` folder is not part of the source and does not exist until we build or start Desktop
// eslint-disable-next-line import/extensions
require('./dist/main');
