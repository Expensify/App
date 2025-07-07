"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @jest-environment node
 */
var core = require("@actions/core");
var awaitStagingDeploys_1 = require("@github/actions/javascript/awaitStagingDeploys/awaitStagingDeploys");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var asMutable_1 = require("@src/types/utils/asMutable");
// Lower poll rate to speed up tests
var TEST_POLL_RATE = 1;
var COMPLETED_WORKFLOW = { status: 'completed' };
var INCOMPLETE_WORKFLOW = { status: 'in_progress' };
var consoleSpy = jest.spyOn(console, 'log');
var mockGetInput = jest.fn();
var mockListDeploysForTag = jest.fn();
var mockListDeploys = jest.fn();
var mockListPreDeploys = jest.fn();
var mockListWorkflowRuns = jest.fn().mockImplementation(function (args) {
    var defaultReturn = Promise.resolve({ data: { workflow_runs: [] } });
    if (!args.workflow_id) {
        return defaultReturn;
    }
    if (args.branch !== undefined) {
        return mockListDeploysForTag();
    }
    if (args.workflow_id === 'deploy.yml') {
        return mockListDeploys();
    }
    if (args.workflow_id === 'preDeploy.yml') {
        return mockListPreDeploys();
    }
    return defaultReturn;
});
jest.mock('@github/libs/CONST', function () { return (__assign(__assign({}, jest.requireActual('@github/libs/CONST')), { POLL_RATE: TEST_POLL_RATE })); });
beforeAll(function () {
    // Mock core module
    (0, asMutable_1.default)(core).getInput = mockGetInput;
    // Mock octokit module
    var mockOctokit = {
        rest: {
            actions: __assign(__assign({}, GithubUtils_1.default.internalOctokit), { listWorkflowRuns: mockListWorkflowRuns }),
        },
    };
    GithubUtils_1.default.internalOctokit = mockOctokit;
});
beforeEach(function () {
    consoleSpy.mockClear();
});
describe('awaitStagingDeploys', function () {
    test('Should wait for all running staging deploys to finish', function () {
        mockGetInput.mockImplementation(function () { return undefined; });
        // First ping
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [],
            },
        });
        // Second ping
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [],
            },
        });
        // Third ping
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        // Fourth ping
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW],
            },
        });
        return (0, awaitStagingDeploys_1.default)().then(function () {
            expect(consoleSpy).toHaveBeenCalledTimes(4);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 2 staging deploys still running...');
            expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
            expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Found 1 staging deploy still running...');
            expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
        });
    });
    test('Should only wait for a specific staging deploy to finish', function () {
        mockGetInput.mockImplementation(function () { return 'my-tag'; });
        // First ping
        mockListDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        // Second ping
        mockListDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW],
            },
        });
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW],
            },
        });
        // Third ping
        mockListDeploysForTag.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW],
            },
        });
        mockListDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [INCOMPLETE_WORKFLOW, COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        mockListPreDeploys.mockResolvedValueOnce({
            data: {
                workflow_runs: [COMPLETED_WORKFLOW, COMPLETED_WORKFLOW, INCOMPLETE_WORKFLOW],
            },
        });
        return (0, awaitStagingDeploys_1.default)().then(function () {
            expect(consoleSpy).toHaveBeenCalledTimes(3);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Found 1 staging deploy still running...');
            expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Found 1 staging deploy still running...');
            expect(consoleSpy).toHaveBeenLastCalledWith('No current staging deploys found');
        });
    });
});
