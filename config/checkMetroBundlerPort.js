const {isPackagerRunning} = require('@react-native-community/cli-tools');

/**
 * Function isPackagerRunning indicates whether or not the packager is running. It returns a promise that
 * returns one of these possible values:
 *   - `running`: the packager is running
 *   - `not_running`: the packager nor any process is running on the expected port.
 *   - `unrecognized`: one other process is running on the port we expect the packager to be running.
 */
isPackagerRunning().then((result) => {
    if (result === 'unrecognized') {
        console.error(
            'The port 8081 is currently in use.',
            'You can run `lsof -i :8081` to see which program is using it.\n',
        );
        process.exit(1);
    }
});
