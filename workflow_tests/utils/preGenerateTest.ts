/* eslint no-console: ["error", { allow: ["warn", "log"] }] */
import type {StepIdentifier} from '@kie/act-js';
import type {PathLike} from 'fs';
import fs from 'fs';
import path from 'path';
import {exit} from 'process';
import yaml from 'yaml';
import type {YamlMockJob, YamlWorkflow} from './JobMocker';

const workflowsDirectory = path.resolve(__dirname, '..', '..', '.github', 'workflows');
const workflowTestsDirectory = path.resolve(__dirname, '..');
const workflowTestMocksDirectory = path.join(workflowTestsDirectory, 'mocks');
const workflowTestAssertionsDirectory = path.join(workflowTestsDirectory, 'assertions');
const workflowFilePattern = '\\w+\\.yml';
const workflowFileRegex = new RegExp(workflowFilePattern, 'g');

const capitalize = (s: string): string => (s && s.charAt(0).toUpperCase() + s.slice(1)) || '';
const mockFileTemplate = (mockSteps: string, exports: string) => `const utils = require('../utils/utils');
${mockSteps}
${exports}
`;

const assertionFileTemplate = (jobAssertions: string, exports: string) => `import type {Step} from '@kie/act-js';
import * as utils from 'workflow_tests/utils/utils';

${jobAssertions}
${exports}
`;

const testFileTemplate = (workflowName: string) => `const path = require('path');
const kieMockGithub = require('@kie/mock-github');
const utils = require('./utils/utils');
const assertions = require('./assertions/${workflowName}Assertions');
const mocks = require('./mocks/${workflowName}Mocks');
const ExtendedAct = require('./utils/ExtendedAct').default;

jest.setTimeout(90 * 1000);
let mockGithub;
const FILES_TO_COPY_INTO_TEST_REPO = [
    ...utils.deepCopy(utils.FILES_TO_COPY_INTO_TEST_REPO),
    {
        src: path.resolve(__dirname, '..', '.github', 'workflows', '${workflowName}.yml'),
        dest: '.github/workflows/${workflowName}.yml',
    },
];

describe('test workflow ${workflowName}', () => {
    const githubToken = 'dummy_github_token';
    const actor = 'Dummy Actor';
    
    beforeEach(async () => {
        // create a local repository and copy required files
        mockGithub = new kieMockGithub.MockGithub({
            repo: {
                test${capitalize(workflowName)}WorkflowRepo: {
                    files: FILES_TO_COPY_INTO_TEST_REPO,
                    
                    // if any branches besides main are need add: pushedBranches: ['staging', 'production'],
                },
            },
        });
    
        await mockGithub.setup();
    });
    
    afterEach(async () => {
        await mockGithub.teardown();
    });
    it('test stub', async () => {
        const repoPath = mockGithub.repo.getPath('test${capitalize(workflowName)}WorkflowRepo') || '';
        const workflowPath = path.join(repoPath, '.github', 'workflows', '${workflowName}.yml');
        let act = new ExtendedAct(repoPath, workflowPath);
        act = utils.setUpActParams(
            act,
            '[EVENT]',
            {},
            {},
            githubToken,
        );
        const testMockSteps = {
            // mock steps with imported mocks
        };
        const result = await act
            .runEvent('[EVENT]', {
                workflowFile: path.join(repoPath, '.github', 'workflows', '${workflowName}.yml'),
                mockSteps: testMockSteps,
                actor,
            });
            
        // assert execution with imported assertions
    });
});
`;

const mockStepTemplate = (stepMockName: string, step: StepIdentifier, jobId: string | undefined) => `
const ${stepMockName} = utils.createMockStep(
    '${step.name ?? ''}',
    '${step.name ?? ''}',
    ${jobId ? `'${jobId.toUpperCase()}'` : 'null'},
    ${step.inputs ? JSON.stringify(step.inputs).replaceAll('"', "'") : 'null'},
    ${step.envs ? JSON.stringify(step.envs).replaceAll('"', "'") : 'null'},
    // add outputs if needed
);`;

const stepAssertionTemplate = (stepName: string, jobId: string, stepMessage: string, inputs: string[] = [], envs: string[] = []): string => {
    const inputsString = inputs.map((input) => `{key: '${input}', value: '[FILL_IN]'}`).join(',');
    const envsString = envs.map((env) => `{key: '${env}', value: '[FILL_IN]'}`).join(',');

    return `
        utils.createStepAssertion(
            '${stepName}',
            true,
            null,
            '${jobId}',
            '${stepMessage}',
            [${inputsString}],
            [${envsString}],
        ),`;
};

const jobMocksTemplate = (jobMocksName: string, stepMocks: string[]): string => {
    const stepMocksString = stepMocks.map((stepMock) => `${stepMock}`).join(',');

    return `const ${jobMocksName} = [${stepMocksString}\n];`;
};

const jobAssertionTemplate = (jobAssertionName: string, stepAssertionsContent: string) => `
function ${jobAssertionName}(workflowResult: Step[], didExecute = true) {
    const steps = [\n${stepAssertionsContent}\n];

    for (const expectedStep of steps) {
        if (didExecute) {
            expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    }
};`;

const mocksExportsTemplate = (jobMocks: string[]): string => {
    const jobMocksString = jobMocks.map((jobMock) => `  ${jobMock}`).join(',\n');

    return `\nmodule.exports = {\n${jobMocksString}\n};\n`;
};

const assertionsExportsTemplate = (jobAssertions: string[]): string => {
    const assertionsString = jobAssertions.join(',\n');
    // There are other pre-generated files using imports from here, so to keep the interface uniform it's better to just disable it
    const eslintDisable = jobAssertions.length === 1 ? '// eslint-disable-next-line import/prefer-default-export\n' : '';

    return `\n${eslintDisable}export default {\n${assertionsString}\n};\n`;
};

const checkArguments = (args: string[]) => {
    if (args.length > 0 && args[0]) {
        return;
    }
    console.warn('Please provide workflow file name');
    exit(1);
};
const checkWorkflowFileName = (fileName: string) => {
    if (workflowFileRegex.test(fileName)) {
        return;
    }
    console.warn(`Please provide a valid workflow file name ([workflow].yml) instead of ${fileName}`);
    exit(1);
};
const checkWorkflowFilePath = (filePath: PathLike) => {
    if (fs.existsSync(filePath)) {
        return;
    }
    console.warn(`Provided workflow file does not exist: ${filePath.toString()}`);
    exit(1);
};
const checkIfTestFileExists = (testsDirectory: string, testFileName: string) => {
    if (!fs.existsSync(path.join(testsDirectory, testFileName))) {
        return;
    }
    console.warn(`The test file ${testFileName} already exists, exiting`);
    exit(1);
};
const checkIfMocksFileExists = (mocksDirectory: string, mocksFileName: string) => {
    if (!fs.existsSync(path.join(mocksDirectory, mocksFileName))) {
        return;
    }
    console.warn(`The mocks file ${mocksFileName} already exists, exiting`);
    exit(1);
};
const checkIfAssertionsFileExists = (assertionsDirectory: string, assertionsFileName: string) => {
    if (!fs.existsSync(path.join(assertionsDirectory, assertionsFileName))) {
        return;
    }
    console.warn(`The assertions file ${assertionsFileName} already exists, exiting`);
    exit(1);
};
const parseWorkflowFile = (workflow: YamlWorkflow) => {
    const workflowJobs: Record<string, YamlMockJob> = {};
    Object.entries(workflow.jobs).forEach(([jobId, job]) => {
        workflowJobs[jobId] = {
            steps: [],
        };
        job.steps.forEach((step) => {
            const workflowStep = {
                name: step.name ?? '',
                inputs: Object.keys(step.with ?? {}),
                envs: step.envs ?? [],
            } as StepIdentifier;
            workflowJobs[jobId].steps.push(workflowStep);
        });
    });
    return workflowJobs;
};
const getMockFileContent = (workflowName: string, jobs: Record<string, YamlMockJob>): string => {
    let content = '';
    const jobMocks: string[] = [];
    Object.entries(jobs).forEach(([jobId, job]) => {
        let mockStepsContent = `\n// ${jobId.toLowerCase()}`;
        const stepMocks: string[] = [];
        job.steps.forEach((step) => {
            const stepMockName = `${workflowName.toUpperCase()}__${jobId.toUpperCase()}__${step.name
                .replaceAll(' ', '_')
                .replaceAll('-', '_')
                .replaceAll(',', '')
                .replaceAll('#', '')
                .replaceAll('.ts', '')
                .replaceAll('.js', '')
                .toUpperCase()}__STEP_MOCK`;
            stepMocks.push(stepMockName);
            mockStepsContent += mockStepTemplate(stepMockName, step, jobId);
        });

        const jobMocksName = `${workflowName.toUpperCase()}__${jobId.toUpperCase()}__STEP_MOCKS`;
        jobMocks.push(jobMocksName);
        mockStepsContent += jobMocksTemplate(jobMocksName, stepMocks);
        content += mockStepsContent;
    });
    return mockFileTemplate(content, mocksExportsTemplate(jobMocks));
};

const getAssertionsFileContent = (jobs: Record<string, YamlMockJob>): string => {
    let content = '';
    const jobAssertions: string[] = [];

    Object.entries(jobs).forEach(([jobId, job]) => {
        let stepAssertionsContent = '';
        job.steps.forEach((step: StepIdentifier) => {
            stepAssertionsContent += stepAssertionTemplate(step.name, jobId.toUpperCase(), step.name, step.inputs, step.envs);
        });
        const jobAssertionName = `assert${jobId.charAt(0).toUpperCase() + jobId.slice(1)}JobExecuted`;
        jobAssertions.push(jobAssertionName);
        content += jobAssertionTemplate(jobAssertionName, stepAssertionsContent);
    });

    return assertionFileTemplate(content, assertionsExportsTemplate(jobAssertions));
};

const getTestFileContent = (workflowName: string): string => testFileTemplate(workflowName);

const callArgs = process.argv.slice(2);
checkArguments(callArgs);

const workflowFileName = callArgs[0];
checkWorkflowFileName(workflowFileName);

const workflowName = workflowFileName.slice(0, -4);
const workflowFilePath = path.join(workflowsDirectory, workflowFileName);
checkWorkflowFilePath(workflowFilePath);

const workflowTestFileName = `${workflowName}.test.js`;
checkIfTestFileExists(workflowTestsDirectory, workflowTestFileName);

const workflowTestMocksFileName = `${workflowName}Mocks.js`;
checkIfMocksFileExists(workflowTestMocksDirectory, workflowTestMocksFileName);

const workflowTestAssertionsFileName = `${workflowName}Assertions.ts`;
checkIfAssertionsFileExists(workflowTestAssertionsDirectory, workflowTestAssertionsFileName);

const workflow = yaml.parse(fs.readFileSync(workflowFilePath, 'utf8')) as YamlWorkflow;
const workflowJobs = parseWorkflowFile(workflow);

const mockFileContent = getMockFileContent(workflowName, workflowJobs);
const mockFilePath = path.join(workflowTestMocksDirectory, workflowTestMocksFileName);
console.log(`Creating mock file ${mockFilePath}`);
fs.writeFileSync(mockFilePath, mockFileContent);
console.log(`Mock file ${mockFilePath} created`);

const assertionsFileContent = getAssertionsFileContent(workflowJobs);
const assertionsFilePath = path.join(workflowTestAssertionsDirectory, workflowTestAssertionsFileName);
console.log(`Creating assertions file ${assertionsFilePath}`);
fs.writeFileSync(assertionsFilePath, assertionsFileContent);
console.log(`Assertions file ${assertionsFilePath} created`);

const testFileContent = getTestFileContent(workflowName);
const testFilePath = path.join(workflowTestsDirectory, workflowTestFileName);
console.log(`Creating test file ${testFilePath}`);
fs.writeFileSync(testFilePath, testFileContent);
console.log(`Test file ${testFilePath} created`);
