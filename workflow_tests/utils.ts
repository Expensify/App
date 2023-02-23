import {Act} from '@kie/act-js';

export const setUpActParams = (act: Act, event?: string, event_options?: any, secrets?: Object, github_token?: string) => {
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
