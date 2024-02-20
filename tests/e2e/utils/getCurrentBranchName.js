import {execSync} from 'child_process';

const getCurrentBranchName = () => {
    const stdout = execSync('git rev-parse --abbrev-ref HEAD', {
        encoding: 'utf8',
    });
    return stdout.trim();
};

export default getCurrentBranchName;
