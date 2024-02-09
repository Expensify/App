const {SERVER_PORT} = require('../config');
const execAsync = require('./execAsync');

export default function () {
    return execAsync(`adb reverse tcp:${SERVER_PORT} tcp:${SERVER_PORT}`);
}
