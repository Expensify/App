const utils = require('../utils/utils');

const assertWarnCPLabelJobExecuted = (workflowResult, didExecute = true, isSuccessful = true) => {
    const steps = [
        utils.createStepAssertion(
            'Comment on PR to explain the CP Staging label',
            true,
            null,
            'WARNCPLABEL',
            'Comment on PR to explain the CP Staging label',
            [{key: 'github_token', value: '***'}],
            [],
        ),
    ];

    steps.forEach((expectedStep) => {
        if (didExecute) {
            if (isSuccessful) {
                expect(workflowResult).toEqual(expect.arrayContaining([expectedStep]));
            }
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([expectedStep]));
        }
    });

    const failedSteps = [
        utils.createStepAssertion(
            'Announce failed workflow in Slack',
            true,
            null,
            'WARNCPLABEL',
            'Announce failed workflow in Slack',
            [{key: 'SLACK_WEBHOOK', value: '***'}],
            [],
        ),
    ];

    failedSteps.forEach((step) => {
        if (didExecute && !isSuccessful) {
            expect(workflowResult).toEqual(expect.arrayContaining([step]));
        } else {
            expect(workflowResult).not.toEqual(expect.arrayContaining([step]));
        }
    });
};

module.exports = {
    assertWarnCPLabelJobExecuted,
};
