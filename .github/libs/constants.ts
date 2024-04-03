const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');
const PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`);
const ISSUE_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`);
const ISSUE_OR_PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`);

/**
 * The standard rate in ms at which we'll poll the GitHub API to check for status changes.
 * It's 10 seconds :)
 */
const POLL_RATE = 10000;

export {ISSUE_OR_PULL_REQUEST_REGEX, POLL_RATE, PULL_REQUEST_REGEX, ISSUE_REGEX, GITHUB_BASE_URL_REGEX};
