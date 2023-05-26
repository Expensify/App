const utils = require('../utils/utils');

// checklist
const AUTHORCHECKLIST__CHECKLIST__AUTHORCHECKLIST_JS__STEP_MOCK = utils.createMockStep('authorChecklist.js', 'Running authorChecklist.js', 'CHECKLIST', ['GITHUB_TOKEN'], []);
const AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS = [AUTHORCHECKLIST__CHECKLIST__AUTHORCHECKLIST_JS__STEP_MOCK];

module.exports = {
    AUTHORCHECKLIST__CHECKLIST__STEP_MOCKS,
};
