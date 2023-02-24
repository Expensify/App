const setUpActParams = (act, event = null, event_options = null, secrets = null, github_token = null) => {
    let updated_act = act;

    if (event && event_options) {
        updated_act = updated_act.setEvent({
            event: event_options,
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

    return updated_act;
};

const getMockStep = (name, message, job_id = null, inputs = null, in_envs = null, outputs = null, out_envs = null) => {
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
    return {
        name: mockStepName,
        mockWith: mockWithCommand,
    };
};

module.exports = {
    setUpActParams,
    getMockStep,
};
