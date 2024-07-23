/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';

const run = function (): Promise<void> {
    const oldList = Number(core.getInput('OLD_LIST', {required: true}));
    const newList = Number(core.getInput('NEW_LIST', {required: true}));

    console.log(`Old list: ${oldList}`);
    console.log(`New list: ${newList}`);

    return Promise.resolve();
};

if (require.main === module) {
    run();
}

export default run;
