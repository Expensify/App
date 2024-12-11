const path = require('path');
const pak = require('./modules/ContactsNitroModule/package.json');

module.exports = {
    project: {
        ios: {sourceDir: process.env.PROJECT_ROOT_PATH + 'ios'},
        android: {sourceDir: process.env.PROJECT_ROOT_PATH + 'android'},
    },
    assets: ['./assets/fonts/native'],
    dependencies: {
        [pak.name]: {
            root: path.join(__dirname, 'modules', 'ContactsNitroModule'),
        },
    },
};
