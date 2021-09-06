const {isPackagerRunning} = require('@react-native-community/cli-tools');

isPackagerRunning().then((result) => {
    if (result === 'unrecognized') {
        console.error(
            'The port 8081 is currently in use.',
            'You can run `lsof -i :8081` to see which program is using it.\n',
        );
        process.exit(1);
    }
});
