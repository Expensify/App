const core = require('@actions/core');
const semverParse = require('semver/functions/parse');
const semverSatisfies = require('semver/functions/satisfies');

class GithubUtils {
    constructor(octokit) {
        this.octokit = octokit;
    }

    /**
     * Generate a comparison URL between two versions following the semverLevel passed
     *
     * @param {String} repoSlug is the slug of the repository <owner>/<repository_name>
     * @param {String} tag is the tag to compare first the previous semverLevel
     * @param {String} semverLevel is the semantic versioning MAJOR, MINOR, PATCH and BUILD
     * @return {Promise} the url generated
     */
    generateVersionComparisonURL(repoSlug, tag, semverLevel) {
        return new Promise((resolve, reject) => {
            // eslint-disable-next-line max-len
            const getComparisonURL = (previousTag, currentTag) => `https://github.com/Expensify/Expensify.cash/compare/${previousTag}...${currentTag}`;

            const [repoOwner, repoName] = repoSlug.split('/');
            const tagSemver = semverParse(tag);

            return this.octokit.repos.listTags({
                owner: repoOwner,
                repo: repoName,
            })
                .then(githubResponse => githubResponse.data.some(({name: repoTag}) => {
                    if (
                        semverLevel === 'MAJOR'
                            && semverSatisfies(repoTag, `<${tagSemver.major}.x.x`)
                    ) {
                        resolve(getComparisonURL(repoTag, tagSemver));
                        return true;
                    }

                    if (
                        semverLevel === 'MINOR'
                            && semverSatisfies(repoTag, `<${tagSemver.major}.${tagSemver.minor}.x`)
                    ) {
                        resolve(getComparisonURL(repoTag, tagSemver));
                        return true;
                    }

                    if (
                        semverLevel === 'PATCH'
                            && semverSatisfies(repoTag, `<${tagSemver}`)
                    ) {
                        resolve(getComparisonURL(repoTag, tagSemver));
                        return true;
                    }

                    if (
                        semverLevel === 'BUILD'
                            && semverSatisfies(repoTag, `<=${tagSemver.major}.${tagSemver.minor}.${tagSemver.patch}`)
                    ) {
                        resolve(getComparisonURL(repoTag, tagSemver));
                        return true;
                    }
                    return false;
                }))
                .catch(githubError => reject(core.setFailed(githubError)));
        });
    }
}

module.exports = GithubUtils;
