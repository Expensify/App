const yaml = require('yaml');
const fs = require('fs');
const kieActJs = require('@kie/act-js');

class ExtendedAct extends kieActJs.Act {
    async parseRunOpts(opts) {
        const {cwd, actArguments, proxy} = await super.parseRunOpts(opts);
        if (opts?.actor) {
            actArguments.push('--actor', opts?.actor);
        }
        return {cwd, actArguments, proxy};
    }
}

const setUpActParams = (act, event = null, event_options = null, secrets = null, github_token = null, env_vars = null) => {
    let updated_act = act;

    if (event && event_options) {
        updated_act = updated_act.setEvent({
            [event]: event_options,
        });
    }

    if (secrets) {
        for (const [key, value] of Object.entries(secrets)) {
            updated_act = updated_act.setSecret(key, value);
        }
    }

    if (github_token) {
        updated_act = updated_act.setGithubToken(github_token);
    }

    if (env_vars) {
        for (const [key, value] of Object.entries(env_vars)) {
            updated_act = updated_act.setEnv(key, value);
        }
    }

    return updated_act;
};

const getMockStep = (name, message, job_id = null, inputs = null, in_envs = null, outputs = null, out_envs = null, isSuccessful = true) => {
    const mockStepName = name;
    let mockWithCommand = 'echo [MOCK]';
    if (job_id) {
        mockWithCommand += ` [${job_id}]`;
    }
    mockWithCommand += ` ${message}`;
    if (inputs) {
        for (const input of inputs) {
            mockWithCommand += `, ${input}="\${{ inputs.${input} }}"`;
        }
    }
    if (in_envs) {
        for (const env of in_envs) {
            mockWithCommand += `, ${env}="\${{ env.${env} }}"`;
        }
    }
    if (outputs) {
        for (const [key, value] of Object.entries(outputs)) {
            mockWithCommand += `\necho "${key}=${value}" >> "$GITHUB_OUTPUT"`;
        }
    }
    if (out_envs) {
        for (const [key, value] of Object.entries(out_envs)) {
            mockWithCommand += `\necho "${key}=${value}" >> "$GITHUB_ENV"`;
        }
    }
    if (!isSuccessful) {
        mockWithCommand += '\nexit 1';
    }
    return {
        name: mockStepName,
        mockWith: mockWithCommand,
    };
};

const getStepAssertion = (name, isSuccessful = true, expectedOutput = null, jobId = null, message = null, inputs = null, envs = null) => {
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
            for (const input of inputs) {
                stepOutput += `, ${input.key}=${input.value}`;
            }
        }
        if (envs) {
            for (const env of envs) {
                stepOutput += `, ${env.key}=${env.value}`;
            }
        }
    }
    return {
        name: stepName,
        status: stepStatus,
        output: stepOutput,
    };
};

const setJobRunners = (act, jobs, workflowPath) => {
    if (!act || !jobs || !workflowPath) {
        return act;
    }

    const workflow = yaml.parse(fs.readFileSync(workflowPath, 'utf8'));
    for (const [jobId, runner] of Object.entries(jobs)) {
        const job = workflow.jobs[jobId];
        job['runs-on'] = runner;
    }
    fs.writeFileSync(workflowPath, yaml.stringify(workflow), 'utf8');
    return act;
};

module.exports = {
    setUpActParams,
    getMockStep,
    getStepAssertion,
    setJobRunners,
    ExtendedAct,
};
