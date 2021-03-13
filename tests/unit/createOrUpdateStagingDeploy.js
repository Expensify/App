const createOrUpdateStagingDeploy = require('../../.github/actions/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy').default();

describe('createOrUpdateStagingDeploy.js', () => {
    test('', () => {
        createOrUpdateStagingDeploy().then((issueBody) => {
            expect(issueBody).toBe('andrew');
        });
    });
});
