"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script is used for categorizing upwork costs into cost buckets for accounting purposes.
 *
 * To run this script from the root of E/App:
 *
 * ts-node ./scripts/aggregateGitHubDataFromUpwork.js <path_to_csv> <github_pat> <output_path>
 *
 * The input file must be a CSV with a single column containing just the GitHub issue number. The CSV must have a single header row.
 */
var utils_1 = require("@actions/github/lib/utils");
var plugin_paginate_rest_1 = require("@octokit/plugin-paginate-rest");
var plugin_throttling_1 = require("@octokit/plugin-throttling");
var csv_writer_1 = require("csv-writer");
var fs_1 = require("fs");
if (process.argv.length < 3) {
    throw new Error('Error: must provide filepath for CSV data');
}
if (process.argv.length < 4) {
    throw new Error('Error: must provide GitHub token');
}
if (process.argv.length < 5) {
    throw new Error('Error: must provide output file path');
}
// Get filepath for csv
var inputFilepath = process.argv.at(2);
if (!inputFilepath) {
    throw new Error('Error: must provide filepath for CSV data');
}
// Get GitHub token
var token = ((_a = process.argv.at(3)) !== null && _a !== void 0 ? _a : '').trim();
if (!token) {
    throw new Error('Error: must provide GitHub token');
}
var Octokit = utils_1.GitHub.plugin(plugin_throttling_1.throttling, plugin_paginate_rest_1.paginateRest);
var octokit = new Octokit((0, utils_1.getOctokitOptions)(token, {
    throttle: {
        onRateLimit: function (retryAfter, options) {
            console.warn("Request quota exhausted for request ".concat(options.method, " ").concat(options.url));
            // Retry once after hitting a rate limit error, then give up
            if (options.request.retryCount <= 1) {
                console.log("Retrying after ".concat(retryAfter, " seconds!"));
                return true;
            }
        },
        onAbuseLimit: function (retryAfter, options) {
            // does not retry, only logs a warning
            console.warn("Abuse detected for request ".concat(options.method, " ").concat(options.url));
        },
    },
}));
// Get output filepath
var outputFilepath = process.argv.at(4);
if (!outputFilepath) {
    throw new Error('Error: must provide output file path');
}
// Get data from csv
var issues = fs_1.default
    .readFileSync(inputFilepath)
    .toString()
    .split('\n')
    .reduce(function (acc, issue) {
    if (!issue) {
        return acc;
    }
    var issueNum = Number(issue.trim());
    if (!issueNum) {
        return acc;
    }
    acc.push(issueNum);
    return acc;
}, []);
var csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
    path: outputFilepath,
    header: [
        { id: 'number', title: 'number' },
        { id: 'title', title: 'title' },
        { id: 'labels', title: 'labels' },
        { id: 'type', title: 'type' },
        { id: 'capSWProjects', title: 'capSWProjects' },
    ],
});
function getIssueTypeFromLabels(labels) {
    if (labels.includes('NewFeature')) {
        return 'feature';
    }
    if (labels.includes('Bug')) {
        return 'bug';
    }
    return 'other';
}
/**
 * Returns a comma-delimited string with all projects associated with the given issue.
 */
function getProjectsForIssue(issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, octokit.graphql("\n        {\n                  repository(owner: \"Expensify\", name: \"App\") {\n                    issue(number: ".concat(issueNumber, ") {\n                      projectsV2(last: 30) {\n                        nodes {\n                          title\n                        }\n                      }\n                    }\n                  }\n                }\n        "))];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.repository.issue.projectsV2.nodes.map(function (node) { return node.title; }).join(',')];
            }
        });
    });
}
function getGitHubData() {
    return __awaiter(this, void 0, void 0, function () {
        var gitHubData, _loop_1, _i, issues_1, issueNumber;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gitHubData = [];
                    _loop_1 = function (issueNumber) {
                        var result, issue, labels, type, capSWProjects;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    console.info("Fetching ".concat(issueNumber));
                                    return [4 /*yield*/, octokit.rest.issues
                                            .get({
                                            owner: 'Expensify',
                                            repo: 'App',
                                            // eslint-disable-next-line @typescript-eslint/naming-convention
                                            issue_number: issueNumber,
                                        })
                                            .catch(function () {
                                            console.warn("Error getting issue ".concat(issueNumber));
                                        })];
                                case 1:
                                    result = _b.sent();
                                    if (!result) return [3 /*break*/, 4];
                                    issue = result.data;
                                    labels = issue.labels.reduce(function (acc, label) {
                                        if (typeof label === 'string') {
                                            acc.push(label);
                                        }
                                        else if (label.name) {
                                            acc.push(label.name);
                                        }
                                        return acc;
                                    }, []);
                                    type = getIssueTypeFromLabels(labels);
                                    capSWProjects = '';
                                    if (!(type === 'feature')) return [3 /*break*/, 3];
                                    return [4 /*yield*/, getProjectsForIssue(issueNumber)];
                                case 2:
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                    capSWProjects = _b.sent();
                                    _b.label = 3;
                                case 3:
                                    gitHubData.push({
                                        number: issue.number,
                                        title: issue.title,
                                        labels: labels,
                                        type: type,
                                        capSWProjects: capSWProjects,
                                    });
                                    _b.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, issues_1 = issues;
                    _a.label = 1;
                case 1:
                    if (!(_i < issues_1.length)) return [3 /*break*/, 4];
                    issueNumber = issues_1[_i];
                    return [5 /*yield**/, _loop_1(issueNumber)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, gitHubData];
            }
        });
    });
}
getGitHubData()
    .then(function (gitHubData) { return csvWriter.writeRecords(gitHubData); })
    .then(function () { return console.info("Done \u2705 Wrote file to ".concat(outputFilepath)); });
