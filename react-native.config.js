const path = require('path');
const pak = require('./modules/ContactsNitroModule/package.json');

module.exports = {
    project: {
        ios: {sourceDir: 'ios'},
        android: {},
    },
    assets: ['./assets/fonts/native'],
    dependencies: {
        [pak.name]: {
            root: path.join(__dirname, 'modules', 'ContactsNitroModule'),
        },
    },
};
