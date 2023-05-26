const utils = require('../utils/utils');

// cla
const CLA__CLA__CLA_COMMENT_CHECK__NO_MATCH__STEP_MOCK = utils.createMockStep('CLA comment check', 'CLA comment check', 'CLA', ['text', 'regex'], [], {match: ''});
const CLA__CLA__CLA_COMMENT_CHECK__MATCH__STEP_MOCK = utils.createMockStep('CLA comment check', 'CLA comment check', 'CLA', ['text', 'regex'], [], {
    match: 'I have read the CLA Document and I hereby sign the CLA',
});
const CLA__CLA__CLA_COMMENT_RE_CHECK__NO_MATCH__STEP_MOCK = utils.createMockStep('CLA comment re-check', 'CLA comment re-check', 'CLA', ['text', 'regex'], [], {match: ''});
const CLA__CLA__CLA_COMMENT_RE_CHECK__MATCH__STEP_MOCK = utils.createMockStep('CLA comment re-check', 'CLA comment re-check', 'CLA', ['text', 'regex'], [], {match: 'recheck'});
const CLA__CLA__CLA_ASSISTANT__STEP_MOCK = utils.createMockStep(
    'CLA Assistant',
    'CLA Assistant',
    'CLA',
    ['path-to-signatures', 'path-to-document', 'branch', 'remote-organization-name', 'remote-repository-name', 'lock-pullrequest-aftermerge', 'allowlist'],
    ['GITHUB_TOKEN', 'PERSONAL_ACCESS_TOKEN'],
);
const CLA__CLA__NO_MATCHES__STEP_MOCKS = [CLA__CLA__CLA_COMMENT_CHECK__NO_MATCH__STEP_MOCK, CLA__CLA__CLA_COMMENT_RE_CHECK__NO_MATCH__STEP_MOCK, CLA__CLA__CLA_ASSISTANT__STEP_MOCK];
const CLA__CLA__CHECK_MATCH__STEP_MOCKS = [CLA__CLA__CLA_COMMENT_CHECK__MATCH__STEP_MOCK, CLA__CLA__CLA_COMMENT_RE_CHECK__NO_MATCH__STEP_MOCK, CLA__CLA__CLA_ASSISTANT__STEP_MOCK];
const CLA__CLA__RECHECK_MATCH__STEP_MOCKS = [CLA__CLA__CLA_COMMENT_CHECK__NO_MATCH__STEP_MOCK, CLA__CLA__CLA_COMMENT_RE_CHECK__MATCH__STEP_MOCK, CLA__CLA__CLA_ASSISTANT__STEP_MOCK];

module.exports = {
    CLA__CLA__NO_MATCHES__STEP_MOCKS,
    CLA__CLA__CHECK_MATCH__STEP_MOCKS,
    CLA__CLA__RECHECK_MATCH__STEP_MOCKS,
};
