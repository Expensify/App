module.exports = {
    setUpActParams:
(act, event = null, event_options = null, secrets = null, github_token = null) => {
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
},
};
