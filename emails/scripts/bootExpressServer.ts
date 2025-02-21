import LiveReloadServer from '../LiveReloadServer';

const {spawn} = require('child_process');

console.log('♻️  Restarting server...');

const serverProcess = spawn('node', ['dist/server.bundle.js'], {
    stdio: 'inherit',
    shell: true,
});

serverProcess.on('exit', LiveReloadServer.trigger);
