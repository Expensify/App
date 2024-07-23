import type {EventJSON, StepIdentifier} from '@kie/act-js';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import type ExtendedAct from './ExtendedAct';

type StepAssertionInputEntry = {key: string; value: string | boolean};

type StepAssertion = {
    name: string;
    status: number;
    output: string;
};

type Jobs = Record<
    string,
    {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'runs-on': string;
    }
>;

type Workflow = {
    jobs: Jobs;
};

function setUpActParams(
    act: ExtendedAct,
    event: string | null = null,
    eventOptions: EventJSON | null = null,
    secrets: Record<string, string> | null = null,
    githubToken: string | null = null,
    envVars: Record<string, string> | null = null,
    inputs: Record<string, string> | null = null,
): ExtendedAct {
    let updatedAct = act;

    if (event && eventOptions) {
        // according to `Act` docs event data should be under the key with the event name (`[event]: eventOptions`), but
        // for some event types this does not work (like `issues`), but providing the data on the JSON top level does,
        // hence `...eventOptions` - this seems to cover all options
        const eventData = {
            [event]: eventOptions,
            ...eventOptions,
        };
        updatedAct = updatedAct.setEvent(eventData);
    }

    if (secrets) {
        Object.entries(secrets).forEach(([key, value]) => {
            updatedAct = updatedAct.setSecret(key, value);
        });
    }

    if (githubToken) {
        updatedAct = updatedAct.setGithubToken(githubToken);
    }

    if (envVars) {
        Object.entries(envVars).forEach(([key, value]) => {
            updatedAct = updatedAct.setEnv(key, value);
        });
    }

    if (inputs) {
        Object.entries(inputs).forEach(([key, value]) => {
            updatedAct = updatedAct.setInput(key, value);
        });
    }

    return updatedAct;
}

function createMockStep(
    name: string,
    message: string,
    jobId: string | null = null,
    inputs: string[] | null = null,
    inEnvs: string[] | null = null,
    outputs: Record<string, string | boolean | number> | null = null,
    outEnvs: Record<string, string> | null = null,
    isSuccessful = true,
    id: string | null = null,
): StepIdentifier {
    const mockStepName = name;
    let mockWithCommand = 'echo [MOCK]';
    if (jobId) {
        mockWithCommand += ` [${jobId}]`;
    }
    mockWithCommand += ` ${message}`;
    if (inputs) {
        inputs.forEach((input) => {
            mockWithCommand += `, ${input}="\${{ inputs.${input} && inputs.${input} || github.event.inputs.${input} }}"`;
        });
    }
    if (inEnvs) {
        inEnvs.forEach((env) => {
            mockWithCommand += `, ${env}="\${{ env.${env} }}"`;
        });
    }
    if (outputs) {
        Object.entries(outputs).forEach(([key, value]) => {
            mockWithCommand += `\necho "${key}=${value}" >> "$GITHUB_OUTPUT"`;
        });
    }
    if (outEnvs) {
        Object.entries(outEnvs).forEach(([key, value]) => {
            mockWithCommand += `\necho "${key}=${value}" >> "$GITHUB_ENV"`;
        });
    }
    if (!isSuccessful) {
        mockWithCommand += '\nexit 1';
    }
    if (!id) {
        return {
            name: mockStepName,
            mockWith: mockWithCommand,
        };
    }

    return {
        id,
        name: mockStepName,
        mockWith: mockWithCommand,
    };
}

function createStepAssertion(
    name: string,
    isSuccessful = true,
    expectedOutput: string | null = null,
    jobId: string | null = null,
    message: string | null = null,
    inputs: StepAssertionInputEntry[] | null = null,
    envs: StepAssertionInputEntry[] | null = null,
): StepAssertion {
    const stepName = `Main ${name}`;
    const stepStatus = isSuccessful ? 0 : 1;
    let stepOutput: string;
    if (expectedOutput !== null) {
        stepOutput = expectedOutput;
    } else {
        stepOutput = '[MOCK]';
        if (jobId) {
            stepOutput += ` [${jobId}]`;
        }
        if (message) {
            stepOutput += ` ${message}`;
        }
        if (inputs) {
            inputs.forEach((input) => {
                stepOutput += `, ${input.key}=${input.value}`;
            });
        }
        if (envs) {
            envs.forEach((env) => {
                stepOutput += `, ${env.key}=${env.value}`;
            });
        }
    }
    return {
        name: stepName,
        status: stepStatus,
        output: stepOutput,
    };
}

function setJobRunners(act: ExtendedAct, jobs: Record<string, string>, workflowPath: string): ExtendedAct {
    if (!act || !jobs || !workflowPath) {
        return act;
    }

    const workflow = yaml.parse(fs.readFileSync(workflowPath, 'utf8')) as Workflow;
    Object.entries(jobs).forEach(([jobId, runner]) => {
        const job = workflow.jobs[jobId];
        job['runs-on'] = runner;
    });
    fs.writeFileSync(workflowPath, yaml.stringify(workflow), 'utf8');
    return act;
}

function deepCopy<TObject>(originalObject: TObject): TObject {
    return JSON.parse(JSON.stringify(originalObject)) as TObject;
}

function getLogFilePath(workflowName: string, testName: string | undefined): string {
    if (!testName) {
        throw new Error();
    }

    const logsDir = path.resolve(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    const workflowTestsLogDir = path.resolve(logsDir, workflowName);
    if (!fs.existsSync(workflowTestsLogDir)) {
        fs.mkdirSync(workflowTestsLogDir);
    }
    const cleanTestName = testName.replace(' ', '_').replace('-', '_').substr(0, 240);
    return path.resolve(workflowTestsLogDir, `${cleanTestName}.log`);
}

function removeMockRepoDir() {
    const mockDirRepo = path.resolve(__dirname, '..', '..', 'repo');
    if (fs.existsSync(mockDirRepo)) {
        fs.rmSync(mockDirRepo, {recursive: true, force: true});
    }
}

const FILES_TO_COPY_INTO_TEST_REPO = [
    {
        src: path.resolve(__dirname, '..', '..', '.github', 'actions'),
        dest: '.github/actions',
    },
    {
        src: path.resolve(__dirname, '..', '..', '.github', 'libs'),
        dest: '.github/libs',
    },
    {
        src: path.resolve(__dirname, '..', '..', '.github', 'scripts'),
        dest: '.github/scripts',
    },
];

export {setUpActParams, createMockStep, createStepAssertion, setJobRunners, deepCopy, getLogFilePath, FILES_TO_COPY_INTO_TEST_REPO, removeMockRepoDir};
