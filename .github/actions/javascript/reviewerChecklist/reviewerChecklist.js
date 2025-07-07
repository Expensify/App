"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var github = require("@actions/github");
var https_1 = require("https");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var pathToReviewerChecklist = 'https://raw.githubusercontent.com/Expensify/App/main/contributingGuides/REVIEWER_CHECKLIST.md';
var reviewerChecklistContains = '# Reviewer Checklist';
var issue = (_d = (_b = (_a = github.context.payload.issue) === null || _a === void 0 ? void 0 : _a.number) !== null && _b !== void 0 ? _b : (_c = github.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.number) !== null && _d !== void 0 ? _d : -1;
var combinedComments = [];
function getNumberOfItemsFromReviewerChecklist() {
    console.log('Getting the number of items in the reviewer checklist...');
    return new Promise(function (resolve, reject) {
        https_1.default
            .get(pathToReviewerChecklist, function (res) {
            var fileContents = '';
            res.on('data', function (chunk) {
                fileContents += chunk;
            });
            res.on('end', function () {
                var _a;
                var numberOfChecklistItems = ((_a = fileContents.match(/- \[ \]/g)) !== null && _a !== void 0 ? _a : []).length;
                console.log("There are ".concat(numberOfChecklistItems, " items in the reviewer checklist."));
                resolve(numberOfChecklistItems);
            });
        })
            .on('error', function (err) {
            console.error(err);
            reject(err);
        });
    });
}
function checkIssueForCompletedChecklist(numberOfChecklistItems) {
    GithubUtils_1.default.getAllReviewComments(issue)
        .then(function (reviewComments) {
        console.log("Pulled ".concat(reviewComments.length, " review comments, now adding them to the list..."));
        combinedComments.push.apply(combinedComments, reviewComments);
    })
        .then(function () { return GithubUtils_1.default.getAllComments(issue); })
        .then(function (comments) {
        console.log("Pulled ".concat(comments.length, " comments, now adding them to the list..."));
        combinedComments.push.apply(combinedComments, comments.filter(Boolean));
    })
        .then(function () {
        var _a, _b, _c;
        console.log("Looking through all ".concat(combinedComments.length, " comments for the reviewer checklist..."));
        var foundReviewerChecklist = false;
        var numberOfFinishedChecklistItems = 0;
        var numberOfUnfinishedChecklistItems = 0;
        // Once we've gathered all the data, loop through each comment and look to see if it contains the reviewer checklist
        for (var i = 0; i < combinedComments.length; i++) {
            // Skip all other comments if we already found the reviewer checklist
            if (foundReviewerChecklist) {
                break;
            }
            var whitespace = /([\n\r])/gm;
            var comment = (_a = combinedComments.at(i)) === null || _a === void 0 ? void 0 : _a.replace(whitespace, '');
            console.log("Comment ".concat(i, " starts with: ").concat(comment === null || comment === void 0 ? void 0 : comment.slice(0, 20), "..."));
            // Found the reviewer checklist, so count how many completed checklist items there are
            if ((comment === null || comment === void 0 ? void 0 : comment.indexOf(reviewerChecklistContains)) !== -1) {
                console.log('Found the reviewer checklist!');
                foundReviewerChecklist = true;
                numberOfFinishedChecklistItems = ((_b = comment === null || comment === void 0 ? void 0 : comment.match(/- \[x\]/gi)) !== null && _b !== void 0 ? _b : []).length;
                numberOfUnfinishedChecklistItems = ((_c = comment === null || comment === void 0 ? void 0 : comment.match(/- \[ \]/g)) !== null && _c !== void 0 ? _c : []).length;
            }
        }
        if (!foundReviewerChecklist) {
            core.setFailed('No PR Reviewer Checklist was found');
            return;
        }
        var maxCompletedItems = numberOfChecklistItems + 2;
        var minCompletedItems = numberOfChecklistItems - 2;
        console.log("You completed ".concat(numberOfFinishedChecklistItems, " out of ").concat(numberOfChecklistItems, " checklist items with ").concat(numberOfUnfinishedChecklistItems, " unfinished items"));
        if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfFinishedChecklistItems <= maxCompletedItems && numberOfUnfinishedChecklistItems === 0) {
            console.log('PR Reviewer checklist is complete 🎉');
            return;
        }
        console.log("Make sure you are using the most up to date checklist found here: ".concat(pathToReviewerChecklist));
        core.setFailed("PR Reviewer Checklist is not completely filled out. Please check every box to verify you've thought about the item.");
    });
}
getNumberOfItemsFromReviewerChecklist()
    .then(checkIssueForCompletedChecklist)
    .catch(function (err) {
    console.error(err);
    core.setFailed(err);
});
