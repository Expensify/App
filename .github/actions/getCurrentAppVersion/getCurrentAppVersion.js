const core = require('@actions/core');
const fs = require('fs');

const {version} = JSON.parse(fs.readFileSync('./package.json'));
core.setOutput('CURRENT_VERSION', version);
