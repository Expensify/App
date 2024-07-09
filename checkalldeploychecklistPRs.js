/* eslint-disable */
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const {spawn} = require('child_process');

rl.question('Enter App deploy checklist URL: ', (deployChecklistURL) => {
    console.log('Fetching PR numbers...');
    fetch(deployChecklistURL)
        .then((response) => response.text())
        .then((deployChecklistHtml) => {
            const prListStartDelineator = '<p dir="auto"><strong>This release contains changes from the following pull requests:</strong></p>';
            const prListEndDelineator = '<p dir="auto"><strong>Deploy Blockers:</strong></p>';

            // Fetch all the strings with the pattern `href="https://github.com/Expensify/App/pull/<PR number>"`
            const prListHtml = deployChecklistHtml.substring(deployChecklistHtml.indexOf(prListStartDelineator) + 1, deployChecklistHtml.indexOf(prListEndDelineator));
            const regex = /href="https:\/\/github.com\/Expensify\/App\/pull\/(\d+)"/g;
            let match;
            const prNumbers = [];
            while ((match = regex.exec(prListHtml)) !== null) {
                prNumbers.push(match[1]);
            }

            console.log(`Got PR numbers (${prNumbers.length}): `, prNumbers);

            // Now fetch the merge commit of each PR in the list
            console.log('Fetching merge commmits...');
            const prNumbersToMergeCommits = {};

            prNumbers.forEach((prNumber) => {
                const process = spawn(`gh pr view ${prNumber}`, ['--json', 'mergeCommit', '-q', '.mergeCommit.oid']);
                process.stdout.on('data', (data) => {
                    console.log(`Got merge commit for ${prNumber}: `, data);
                    prNumbersToMergeCommits[prNumber] = data;
                });
                process.stderr.on('data', (data) => {
                    console.log('problem', data);
                });

                process.on('error', (err) => {
                    console.log('problem', err);
                });
            });
        });
});
