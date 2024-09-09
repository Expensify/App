/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';

type ReactCompilerOutput = {
    success: string[];
    failure: string[];
};

const run = function (): Promise<void> {
    const oldList = JSON.parse(core.getInput('OLD_LIST', {required: true})) as ReactCompilerOutput;
    const newList = JSON.parse(core.getInput('NEW_LIST', {required: true})) as ReactCompilerOutput;

    const errors: string[] = [];

    oldList.success.forEach((file) => {
        if (newList.success.includes(file) || !newList.failure.includes(file)) {
            return;
        }

        errors.push(file);
    });

    if (errors.length > 0) {
        errors.forEach((error) => console.error(error));
        throw new Error(
            'Some files could be compiled with react-compiler before successfully, but now they can not be compiled. Check https://github.com/Expensify/App/blob/main/contributingGuides/REACT_COMPILER.md documentation to see how you can fix this.',
        );
    }

    return Promise.resolve();
};

if (require.main === module) {
    run();
}

export default run;
