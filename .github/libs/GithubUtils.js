const github = require('@actions/github');

/**
 * Create comment on pull request
 *
 * @param {Number} number - The pull request or issue number
 * @param {String} messageBody - The comment message
 * @param {Object} octokitClient - The ocktokit client
 * @returns {Promise}
 */
exports.createComment = function createComment(number, messageBody, octokitClient) {
    console.log(`Writing comment on #${number}`);
    return octokitClient.issues.createComment({
        ...github.context.repo,
        issue_number: number,
        body: messageBody,
    });
};
