const {execSync} = require('node:child_process');

const getCurrentBranchName = () => {
    const stdout = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
    });
    return stdout.trim();
};

module.exports = getCurrentBranchName;
