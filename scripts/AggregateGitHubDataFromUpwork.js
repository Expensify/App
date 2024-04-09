/*
 * To run this script from the root of E/App:
 *
 * node ./scripts/AggregateGitHubDataFromUpwork.js <path_to_csv> <github_pat>
 */

/* eslint-disable no-console, @lwc/lwc/no-async-await, no-restricted-syntax, no-await-in-loop */
const _ = require('underscore');
const fs = require('fs');
const {GitHub, getOctokitOptions} = require('@actions/github/lib/utils');
const {throttling} = require('@octokit/plugin-throttling');
const {paginateRest} = require('@octokit/plugin-paginate-rest');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'output.csv',
    header: [
        {id: 'number', title: 'number'},
        {id: 'title', title: 'title'},
        {id: 'labels', title: 'labels'},
        {id: 'type', title: 'type'},
    ],
});

if (process.argv.length < 3) {
    throw new Error('Error: must provide filepath for CSV data');
}

if (process.argv.length < 4) {
    throw new Error('Error: must provide GitHub token');
}

// Get filepath for csv
const filepath = process.argv[2];

// Get data from csv
let issues = _.filter(fs.readFileSync(filepath).toString().split('\n'), (issue) => !_.isEmpty(issue));

// Skip header row
issues = issues.slice(1);

// Get GitHub token
const token = process.argv[3].trim();
const Octokit = GitHub.plugin(throttling, paginateRest);
const octokit = new Octokit(
    getOctokitOptions(token, {
        throttle: {
            onRateLimit: (retryAfter, options) => {
                console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);

                // Retry once after hitting a rate limit error, then give up
                if (options.request.retryCount <= 1) {
                    console.log(`Retrying after ${retryAfter} seconds!`);
                    return true;
                }
            },
            onAbuseLimit: (retryAfter, options) => {
                // does not retry, only logs a warning
                console.warn(`Abuse detected for request ${options.method} ${options.url}`);
            },
        },
    }),
);

function getType(labels) {
    if (_.contains(labels, 'Bug')) {
        return 'bug';
    }
    if (_.contains(labels, 'NewFeature')) {
        return 'feature';
    }
    return 'other';
}

async function getGitHubData() {
    const gitHubData = [];
    for (const issueNumber of issues) {
        const num = issueNumber.trim();
        console.info(`Fetching ${num}`);
        const result = await octokit.rest.issues
            .get({
                owner: 'Expensify',
                repo: 'App',
                issue_number: num,
            })
            .catch(() => {
                console.warn(`Error getting issue ${num}`);
            });
        if (result) {
            const issue = result.data;
            const labels = _.map(issue.labels, (label) => label.name);
            const type = getType(labels);
            let capSWProjects = [];
            if (type === 'NewFeature') {
                // eslint-disable-next-line rulesdir/prefer-underscore-method
                capSWProjects = await octokit
                    .graphql(
                        `
                {
                  repository(owner: "Expensify", name: "App") {
                    issue(number: 39322) {
                      projectsV2(last: 30) {
                        nodes {
                          title
                        }
                      }
                    }
                  }
                }
                `,
                    )
                    .repository.issue.projectsV2.nodes.map((node) => node.title)
                    .join(',');
            }
            gitHubData.push({
                number: issue.number,
                title: issue.title,
                labels,
                type: getType(labels),
                capSWProjects,
            });
        }
    }
    return gitHubData;
}

getGitHubData()
    .then((gitHubData) => csvWriter.writeRecords(gitHubData))
    .then(() => console.info('Done ✅ Wrote file to output.csv'));
