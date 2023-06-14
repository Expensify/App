const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

function setUpActParams(act, event = null, eventOptions = null, secrets = null, githubToken = null, envVars = null, inputs = null) {
    let updated_act = act;

    if (event && eventOptions) {
        // according to `Act` docs event data should be under the key with the event name (`[event]: eventOptions`), but
        // for some event types this does not work (like `issues`), but providing the data on the JSON top level does,
        // hence `...eventOptions` - this seems to cover all options
        const eventData = {
            [event]: eventOptions,
            ...eventOptions,
        };
        updated_act = updated_act.setEvent(eventData);
    }

    if (secrets) {
        Object.entries(secrets).forEach(([key, value]) => {
            updated_act = updated_act.setSecret(key, value);
        });
    }

    if (githubToken) {
        updated_act = updated_act.setGithubToken(githubToken);
    }

    if (envVars) {
        Object.entries(envVars).forEach(([key, value]) => {
            updated_act = updated_act.setEnv(key, value);
        });
    }

    if (inputs) {
        Object.entries(inputs).forEach(([key, value]) => {
            updated_act = updated_act.setInput(key, value);
        });
    }

    return updated_act;
}

function createMockStep(name, message, job_id = null, inputs = null, in_envs = null, outputs = null, out_envs = null, isSuccessful = true, id = null) {
    const mockStepName = name;
    let mockWithCommand = 'echo [MOCK]';
    if (job_id) {
        mockWithCommand += ` [${job_id}]`;
    }
    mockWithCommand += ` ${message}`;
    if (inputs) {
        inputs.forEach((input) => {
            mockWithCommand += `, ${input}="\${{ inputs.${input} && inputs.${input} || github.event.inputs.${input} }}"`;
        });
    }
    if (in_envs) {
        in_envs.forEach((env) => {
            mockWithCommand += `, ${env}="\${{ env.${env} }}"`;
        });
    }
    if (outputs) {
        Object.entries(outputs).forEach(([key, value]) => {
            mockWithCommand += `\necho "${key}=${value}" >> "$GITHUB_OUTPUT"`;
        });
    }
    if (out_envs) {
        Object.entries(out_envs).forEach(([key, value]) => {
            mockWithCommand += `\necho "${key}=${value}" >> "$GITHUB_ENV"`;
        });
    }
    if (!isSuccessful) {
        mockWithCommand += '\nexit 1';
    }
    const mockStep = {
        name: mockStepName,
        mockWith: mockWithCommand,
    };
    if (id) {
        mockStep.id = id;
    }
    return mockStep;
}

function createStepAssertion(name, isSuccessful = true, expectedOutput = null, jobId = null, message = null, inputs = null, envs = null) {
    const stepName = `Main ${name}`;
    const stepStatus = isSuccessful ? 0 : 1;
    let stepOutput;
    if (expectedOutput !== undefined && expectedOutput !== null) {
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

function setJobRunners(act, jobs, workflowPath) {
    if (!act || !jobs || !workflowPath) {
        return act;
    }

    const workflow = yaml.parse(fs.readFileSync(workflowPath, 'utf8'));
    Object.entries(jobs).forEach(([jobId, runner]) => {
        const job = workflow.jobs[jobId];
        job['runs-on'] = runner;
    });
    fs.writeFileSync(workflowPath, yaml.stringify(workflow), 'utf8');
    return act;
}

function deepCopy(originalObject) {
    return JSON.parse(JSON.stringify(originalObject));
}

function getLogFilePath(workflowName, testName) {
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

module.exports = {
    setUpActParams,
    createMockStep,
    createStepAssertion,
    setJobRunners,
    deepCopy,
    getLogFilePath,
    FILES_TO_COPY_INTO_TEST_REPO,
    removeMockRepoDir,
};
