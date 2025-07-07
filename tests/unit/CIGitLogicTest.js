"use strict";
/**
 * @jest-environment node
 * @jest-config bail=true
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
var core = require("@actions/core");
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var os_1 = require("os");
var path_1 = require("path");
var getPreviousVersion_1 = require("@github/actions/javascript/getPreviousVersion/getPreviousVersion");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var GitUtils_1 = require("@github/libs/GitUtils");
var VersionUpdater = require("@github/libs/versionUpdater");
var Log = require("../../scripts/utils/Logger");
var DUMMY_DIR = path_1.default.resolve(os_1.default.homedir(), 'DumDumRepo');
var GIT_REMOTE = path_1.default.resolve(os_1.default.homedir(), 'dummyGitRemotes/DumDumRepo');
// Used to mock the Octokit GithubAPI
var mockGetInput = jest.fn();
function exec(command) {
    try {
        Log.info(command);
        (0, child_process_1.execSync)(command, { stdio: 'inherit' });
    }
    catch (error) {
        if (error.stderr) {
            Log.error(error.stderr.toString());
        }
        else {
            Log.error('Error:', error);
        }
        throw new Error(error);
    }
}
function setupGitAsHuman() {
    Log.info('Switching to human git user');
    exec('git config --local user.name test');
    exec('git config --local user.email test@test.com');
}
function setupGitAsOSBotify() {
    Log.info('Switching to OSBotify git user');
    exec("git config --local user.name ".concat(CONST_1.default.OS_BOTIFY));
    exec('git config --local user.email infra+osbotify@expensify.com');
}
function getVersion() {
    var packageJson = JSON.parse(fs_1.default.readFileSync('package.json', { encoding: 'utf-8' }));
    if (!packageJson.version) {
        throw new Error('package.json does not contain a version field');
    }
    return packageJson.version;
}
function initGithubAPIMocking() {
    jest.spyOn(core, 'getInput').mockImplementation(function (name) {
        var _a;
        if (name === 'GITHUB_TOKEN') {
            return 'mock-token';
        }
        return (_a = mockGetInput(name)) !== null && _a !== void 0 ? _a : '';
    });
    // Mock various compareCommits responses with single mocked function
    jest.spyOn(GithubUtils_1.default.octokit.repos, 'compareCommits').mockImplementation(function (params) {
        var base = params === null || params === void 0 ? void 0 : params.base;
        var head = params === null || params === void 0 ? void 0 : params.head;
        var tagPairKey = "".concat(base, "...").concat(head);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var mockCommits = (function () {
            switch (tagPairKey) {
                case '2.0.0-0...2.0.0-1-staging':
                    return [{ sha: 'sha_pr1_merge', commit: { message: 'Merge pull request #1 from Expensify/pr-1', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.0-0...2.0.0-2-staging':
                    return [
                        { sha: 'sha_pr1_merge', commit: { message: 'Merge pull request #1 from Expensify/pr-1', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr3_merge', commit: { message: 'Merge pull request #3 from Expensify/pr-3', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.0-1-staging...2.0.0-2-staging':
                    return [{ sha: 'sha_pr3_merge', commit: { message: 'Merge pull request #3 from Expensify/pr-3', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.0-0...2.0.1-1-staging':
                    return [
                        { sha: 'sha_pr1_merge_alt', commit: { message: 'Merge pull request #1 from Expensify/pr-1', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr3_merge_alt', commit: { message: 'Merge pull request #3 from Expensify/pr-3', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.0-0...2.0.1-0':
                    return [{ sha: 'sha_pr5_merge', commit: { message: 'Merge pull request #5 from Expensify/pr-5', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.0-0...2.0.1-1':
                    return [
                        { sha: 'sha_pr1_merge_v2', commit: { message: 'Merge pull request #1 from Expensify/pr-1', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr3_merge_v2', commit: { message: 'Merge pull request #3 from Expensify/pr-3', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.0-2-staging...2.0.2-0-staging':
                    return [
                        { sha: 'sha_pr2_merge', commit: { message: 'Merge pull request #2 from Expensify/pr-2', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr5_merge', commit: { message: 'Merge pull request #5 from Expensify/pr-5', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.0-2-staging...2.0.2-1-staging':
                    return [
                        { sha: 'sha_pr2_merge', commit: { message: 'Merge pull request #2 from Expensify/pr-2', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr5_merge', commit: { message: 'Merge pull request #5 from Expensify/pr-5', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr6_merge', commit: { message: 'Merge pull request #6 from Expensify/pr-6', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.2-0-staging...2.0.2-1-staging':
                    return [{ sha: 'sha_pr6_merge', commit: { message: 'Merge pull request #6 from Expensify/pr-6', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.0-2-staging...2.0.2-2-staging':
                    return [
                        { sha: 'sha_pr2_merge', commit: { message: 'Merge pull request #2 from Expensify/pr-2', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr5_merge', commit: { message: 'Merge pull request #5 from Expensify/pr-5', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr6_merge', commit: { message: 'Merge pull request #6 from Expensify/pr-6', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr7_merge', commit: { message: 'Merge pull request #7 from Expensify/pr-7', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.2-1-staging...2.0.2-2-staging':
                    return [{ sha: 'sha_pr7_merge', commit: { message: 'Merge pull request #7 from Expensify/pr-7', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.0-2-staging...2.0.2-3-staging':
                    return [
                        { sha: 'sha_pr2_merge', commit: { message: 'Merge pull request #2 from Expensify/pr-2', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr5_merge', commit: { message: 'Merge pull request #5 from Expensify/pr-5', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr6_merge', commit: { message: 'Merge pull request #6 from Expensify/pr-6', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr7_merge', commit: { message: 'Merge pull request #7 from Expensify/pr-7', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr8_merge', commit: { message: 'Merge pull request #8 from Expensify/pr-8', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.2-2-staging...2.0.2-3-staging':
                    return [{ sha: 'sha_pr8_merge', commit: { message: 'Merge pull request #8 from Expensify/pr-8', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.1-1...2.0.2-4':
                    return [
                        { sha: 'sha_pr2_merge', commit: { message: 'Merge pull request #2 from Expensify/pr-2', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr5_merge', commit: { message: 'Merge pull request #5 from Expensify/pr-5', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr6_merge', commit: { message: 'Merge pull request #6 from Expensify/pr-6', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr7_merge', commit: { message: 'Merge pull request #7 from Expensify/pr-7', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr8_merge', commit: { message: 'Merge pull request #8 from Expensify/pr-8', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr10_merge', commit: { message: 'Merge pull request #10 from Expensify/pr-10', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.2-4-staging...2.0.3-0-staging':
                    return [
                        { sha: 'sha_pr9_merge', commit: { message: 'Merge pull request #9 from Expensify/pr-9', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr11_merge', commit: { message: 'Merge pull request #11 from Expensify/pr-11', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.2-4-staging...2.0.3-1-staging':
                    return [
                        { sha: 'sha_pr9_merge', commit: { message: 'Merge pull request #9 from Expensify/pr-9', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr11_merge', commit: { message: 'Merge pull request #11 from Expensify/pr-11', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr13_merge', commit: { message: 'Merge pull request #13 from Expensify/pr-13', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                case '2.0.3-0-staging...2.0.3-1-staging':
                    return [{ sha: 'sha_pr13_merge', commit: { message: 'Merge pull request #13 from Expensify/pr-13', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.3-1-staging...2.0.4-0-staging':
                    return [{ sha: 'sha_pr12_merge', commit: { message: 'Merge pull request #12 from Expensify/pr-12', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.4-0-staging...5.0.0-0-staging':
                    return [{ sha: 'sha_pr14_merge', commit: { message: 'Merge pull request #14 from Expensify/pr-14', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '5.0.0-0-staging...8.0.0-0-staging':
                    return [{ sha: 'sha_pr15_merge', commit: { message: 'Merge pull request #15 from Expensify/pr-15', author: { name: 'Test Author' } }, author: { login: 'email' } }];
                case '2.0.4-0-staging...8.0.0-0-staging':
                    return [
                        { sha: 'sha_pr14_merge', commit: { message: 'Merge pull request #14 from Expensify/pr-14', author: { name: 'Test Author' } }, author: { login: 'email' } },
                        { sha: 'sha_pr15_merge', commit: { message: 'Merge pull request #15 from Expensify/pr-15', author: { name: 'Test Author' } }, author: { login: 'email' } },
                    ];
                default:
                    console.warn("Unhandled tag pair in compareCommits mock: ".concat(tagPairKey));
                    return [];
            }
        })();
        return Promise.resolve({
            data: {
                commits: mockCommits,
            },
            status: 200,
            headers: {},
            url: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        });
    });
}
function initGitServer() {
    Log.info('Initializing git server...');
    if (fs_1.default.existsSync(GIT_REMOTE)) {
        Log.info("".concat(GIT_REMOTE, " exists, removing it now..."));
        fs_1.default.rmSync(GIT_REMOTE, { recursive: true });
    }
    fs_1.default.mkdirSync(GIT_REMOTE, { recursive: true });
    process.chdir(GIT_REMOTE);
    exec('git init -b main');
    setupGitAsHuman();
    exec('npm init -y');
    exec('npm version --no-git-tag-version 1.0.0-0');
    fs_1.default.appendFileSync('.gitignore', 'node_modules/\n');
    exec('git add -A');
    exec('git commit -m "Initial commit"');
    exec('git switch -c staging');
    exec('git switch -c production');
    // Tag the production branch with 1.0.0.0
    exec("git tag ".concat(getVersion()));
    // Bump version to 2.0.0.0
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, true);
    exec('git branch -D staging production');
    exec('git switch -c staging');
    exec('git switch -c production');
    exec("git tag ".concat(getVersion()));
    exec("git switch staging");
    exec('git config --local receive.denyCurrentBranch ignore');
    Log.success("Initialized git server in ".concat(GIT_REMOTE));
}
function checkoutRepo() {
    if (fs_1.default.existsSync(DUMMY_DIR)) {
        Log.warn("Found existing directory at ".concat(DUMMY_DIR, ", deleting it to simulate a fresh checkout..."));
        fs_1.default.rmSync(DUMMY_DIR, { recursive: true });
    }
    fs_1.default.mkdirSync(DUMMY_DIR);
    process.chdir(DUMMY_DIR);
    exec('git init');
    exec("git remote add origin ".concat(GIT_REMOTE));
    exec('git fetch --no-tags --prune --progress --no-recurse-submodules --depth=1 origin +refs/heads/main:refs/remotes/origin/main');
    exec('git checkout --progress --force -B main refs/remotes/origin/main');
    Log.success('Checked out repo at $DUMMY_DIR!');
}
function bumpVersion(level, isRemote) {
    if (isRemote === void 0) { isRemote = false; }
    Log.info('Bumping version...');
    setupGitAsOSBotify();
    exec('git switch main');
    var nextVersion = VersionUpdater.incrementVersion(getVersion(), level);
    exec("npm --no-git-tag-version version ".concat(nextVersion));
    exec('git add package.json');
    exec("git commit -m \"Update version to ".concat(nextVersion, "\""));
    if (!isRemote) {
        exec('git push origin main');
    }
    Log.success("Version bumped to ".concat(nextVersion, " on main"));
}
function updateStagingFromMain() {
    Log.info('Recreating staging from main...');
    exec('git switch main');
    try {
        (0, child_process_1.execSync)('git rev-parse --verify staging', { stdio: 'ignore' });
        exec('git branch -D staging');
        // eslint-disable-next-line no-empty
    }
    catch (e) { }
    exec('git switch -c staging');
    exec('git push --force origin staging');
    Log.success('Recreated staging from main!');
}
function updateProductionFromStaging() {
    Log.info('Recreating production from staging...');
    try {
        (0, child_process_1.execSync)('git rev-parse --verify staging', { stdio: 'ignore' });
    }
    catch (e) {
        exec('git fetch origin staging --depth=1');
    }
    exec('git switch staging');
    try {
        (0, child_process_1.execSync)('git rev-parse --verify production', { stdio: 'ignore' });
        exec('git branch -D production');
        // eslint-disable-next-line no-empty
    }
    catch (e) { }
    exec('git switch -c production');
    exec("git tag ".concat(getVersion()));
    exec('git push --force --tags origin production');
    Log.success('Recreated production from staging!');
}
function createBasicPR(num) {
    var branchName = "pr-".concat(num);
    var content = "Changes from PR #".concat(num);
    var filePath = path_1.default.resolve(process.cwd(), "PR".concat(num, ".txt"));
    Log.info("Creating PR #".concat(num));
    checkoutRepo();
    setupGitAsHuman();
    exec('git pull');
    exec("git switch -c ".concat(branchName));
    fs_1.default.appendFileSync(filePath, content);
    exec("git add ".concat(filePath));
    exec("git commit -m \"".concat(content, "\""));
    Log.success("Created PR #".concat(num, " in branch ").concat(branchName));
}
function mergePR(num) {
    var branchName = "pr-".concat(num);
    Log.info("Merging PR #".concat(num, " to main"));
    exec('git switch main');
    exec("git merge ".concat(branchName, " --no-ff -m \"Merge pull request #").concat(num, " from Expensify/").concat(branchName, "\""));
    exec('git push origin main');
    exec("git branch -d ".concat(branchName));
    Log.success("Merged PR #".concat(num, " to main"));
}
function cherryPickPRToStaging(num, resolveVersionBumpConflicts, resolveMergeCommitConflicts) {
    if (resolveVersionBumpConflicts === void 0) { resolveVersionBumpConflicts = function () { }; }
    if (resolveMergeCommitConflicts === void 0) { resolveMergeCommitConflicts = function () { }; }
    Log.info("Cherry-picking PR ".concat(num, " to staging..."));
    var prMergeCommit = (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    var versionBumpCommit = (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    checkoutRepo();
    setupGitAsOSBotify();
    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    var previousPatchVersion = (0, getPreviousVersion_1.default)();
    // --shallow-exclude is used to speed up the fetch
    exec("git fetch origin main staging --no-tags --shallow-exclude=\"".concat(previousPatchVersion, "\""));
    exec('git switch staging');
    exec('git switch -c cherry-pick-staging');
    try {
        exec("git cherry-pick -x --mainline 1 ".concat(versionBumpCommit));
    }
    catch (e) {
        resolveVersionBumpConflicts();
    }
    setupGitAsHuman();
    try {
        exec("git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs ".concat(prMergeCommit));
    }
    catch (e) {
        resolveMergeCommitConflicts();
    }
    setupGitAsOSBotify();
    exec('git switch staging');
    exec("git merge cherry-pick-staging --no-ff -m \"Merge pull request #".concat(num + 1, " from Expensify/cherry-pick-staging\""));
    exec('git branch -d cherry-pick-staging');
    exec('git push origin staging');
    Log.info("Merged PR #".concat(num + 1, " into staging"));
    tagStaging();
    Log.success("Successfully cherry-picked PR #".concat(num, " to staging!"));
}
function cherryPickPRToProduction(num, resolveVersionBumpConflicts, resolveMergeCommitConflicts) {
    if (resolveVersionBumpConflicts === void 0) { resolveVersionBumpConflicts = function () { }; }
    if (resolveMergeCommitConflicts === void 0) { resolveMergeCommitConflicts = function () { }; }
    Log.info("Cherry-picking PR ".concat(num, " to production..."));
    var prMergeCommit = (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    var versionBumpCommit = (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    checkoutRepo();
    setupGitAsOSBotify();
    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.MINOR);
    var previousPatchVersion = (0, getPreviousVersion_1.default)();
    exec("git fetch origin main production --no-tags --shallow-exclude=\"".concat(previousPatchVersion, "\""));
    exec('git switch production');
    exec('git switch -c cherry-pick-production');
    try {
        exec("git cherry-pick -x --mainline 1 -Xtheirs ".concat(versionBumpCommit));
    }
    catch (e) {
        resolveVersionBumpConflicts();
    }
    setupGitAsHuman();
    try {
        exec("git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs ".concat(prMergeCommit));
    }
    catch (e) {
        resolveMergeCommitConflicts();
    }
    setupGitAsOSBotify();
    exec('git switch production');
    exec("git merge cherry-pick-production --no-ff -m \"Merge pull request #".concat(num + 1, " from Expensify/cherry-pick-production\""));
    exec('git branch -d cherry-pick-production');
    exec('git push origin production');
    Log.info("Merged PR #".concat(num + 1, " into production"));
    tagProduction();
    checkoutRepo();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    versionBumpCommit = (0, child_process_1.execSync)('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    exec("git fetch origin staging --depth=1");
    exec("git switch staging");
    exec("git cherry-pick -x --mainline 1 -Xtheirs ".concat(versionBumpCommit));
    exec('git push origin staging');
    tagStaging();
    Log.success("Pushed to staging after CP to production");
    Log.success("Successfully cherry-picked PR #".concat(num, " to production!"));
}
function tagStaging() {
    Log.info('Tagging new version from the staging branch...');
    checkoutRepo();
    setupGitAsOSBotify();
    try {
        (0, child_process_1.execSync)('git rev-parse --verify staging', { stdio: 'ignore' });
    }
    catch (e) {
        exec('git fetch origin staging --depth=1');
    }
    exec('git switch staging');
    exec("git tag ".concat(getVersion(), "-staging"));
    exec('git push --tags');
    Log.success("Created new tag ".concat(getVersion()));
}
function tagProduction() {
    Log.info('Tagging new version from the production branch...');
    Log.info("Version is: ".concat(getVersion()));
    checkoutRepo();
    setupGitAsOSBotify();
    try {
        (0, child_process_1.execSync)('git rev-parse --verify production', { stdio: 'ignore' });
    }
    catch (e) {
        exec('git fetch origin production --depth=1');
    }
    exec('git switch production');
    exec("git tag ".concat(getVersion()));
    exec('git push --tags');
    Log.success("Created new tag ".concat(getVersion()));
}
function deployStaging() {
    Log.info('Deploying staging...');
    checkoutRepo();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    updateStagingFromMain();
    tagStaging();
    Log.success("Deployed ".concat(getVersion(), " to staging!"));
}
function deployProduction() {
    Log.info('Checklist closed, deploying production and staging...');
    Log.info('Deploying production...');
    updateProductionFromStaging();
    Log.success("Deployed v".concat(getVersion(), " to production!"));
    Log.info('Deploying staging...');
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    updateStagingFromMain();
    tagStaging();
    Log.success("Deployed v".concat(getVersion(), " to staging!"));
}
function assertPRsMergedBetween(from, to, expected) {
    return __awaiter(this, void 0, void 0, function () {
        var PRs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    checkoutRepo();
                    return [4 /*yield*/, GitUtils_1.default.getPullRequestsDeployedBetween(from, to)];
                case 1:
                    PRs = _a.sent();
                    expect(PRs).toStrictEqual(expected);
                    Log.success("Verified PRs merged between ".concat(from, " and ").concat(to, " are [").concat(expected.join(','), "]"));
                    return [2 /*return*/];
            }
        });
    });
}
/*
 * These tests are different from most jest tests. They create a dummy git repo and simulate the GitHub Actions CI environment
 * and ensure that deploy checklists, comments, and releases are created correctly and completely,
 * including a number of real-world edge cases we have encountered and fixed.
 *
 * However, because they are different, there are a few additional "rules" with these tests:
 *   - They should not be run in parallel with other tests on the same machine. They will not play nicely with other tests.
 *   - The whole suite should be run. Running individual tests from the suite may not work as expected.
 */
var startingDir;
describe('CIGitLogic', function () {
    beforeAll(function () {
        Log.info('Starting setup');
        startingDir = process.cwd();
        initGitServer();
        initGithubAPIMocking();
        checkoutRepo();
        Log.success('Setup complete!');
    });
    afterAll(function () {
        jest.restoreAllMocks();
        fs_1.default.rmSync(DUMMY_DIR, { recursive: true, force: true });
        fs_1.default.rmSync(path_1.default.resolve(GIT_REMOTE, '..'), { recursive: true, force: true });
        process.chdir(startingDir);
    });
    test('Merge a pull request while the checklist is unlocked', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createBasicPR(1);
                    mergePR(1);
                    deployStaging();
                    // Verify output for checklist and deploy comment
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-0', '2.0.0-1-staging', [1])];
                case 1:
                    // Verify output for checklist and deploy comment
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test("Merge a pull request with the checklist locked, but don't CP it", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createBasicPR(2);
                    mergePR(2);
                    // Verify output for checklist and deploy comment, and make sure PR #2 is not on staging
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-0', '2.0.0-1-staging', [1])];
                case 1:
                    // Verify output for checklist and deploy comment, and make sure PR #2 is not on staging
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Merge a pull request with the checklist locked and CP it to staging', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createBasicPR(3);
                    mergePR(3);
                    cherryPickPRToStaging(3);
                    // Verify output for checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-0', '2.0.0-2-staging', [1, 3])];
                case 1:
                    // Verify output for checklist
                    _a.sent();
                    // Verify output for deploy comment, and make sure PR #2 is not on staging
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-1-staging', '2.0.0-2-staging', [3])];
                case 2:
                    // Verify output for deploy comment, and make sure PR #2 is not on staging
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Merge a pull request with the checklist locked and CP it to production', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createBasicPR(5);
                    mergePR(5);
                    cherryPickPRToProduction(5);
                    // Verify output for checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-0', '2.0.1-1-staging', [1, 3])];
                case 1:
                    // Verify output for checklist
                    _a.sent();
                    // Verify output for deploy comment
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-0', '2.0.1-0', [5])];
                case 2:
                    // Verify output for deploy comment
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Close the checklist, deploy production and staging', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    deployProduction();
                    // Verify output for release body and production deploy comments
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-0', '2.0.1-1', [1, 3])];
                case 1:
                    // Verify output for release body and production deploy comments
                    _a.sent();
                    // Verify output for new checklist and staging deploy comments
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-0-staging', [2, 5])];
                case 2:
                    // Verify output for new checklist and staging deploy comments
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Merging another pull request when the checklist is unlocked', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createBasicPR(6);
                    mergePR(6);
                    deployStaging();
                    // Verify output for checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-1-staging', [2, 5, 6])];
                case 1:
                    // Verify output for checklist
                    _a.sent();
                    // Verify output for deploy comment
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.2-0-staging', '2.0.2-1-staging', [6])];
                case 2:
                    // Verify output for deploy comment
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Deploying a PR, then CPing a revert, then adding the same code back again before the next production deploy results in the correct code on staging and production', function () { return __awaiter(void 0, void 0, void 0, function () {
        var initialFileContent, newFileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Log.info('Creating myFile.txt in PR #7');
                    setupGitAsHuman();
                    exec('git switch main');
                    exec('git switch -c pr-7');
                    initialFileContent = 'Changes from PR #7';
                    fs_1.default.appendFileSync('myFile.txt', 'Changes from PR #7');
                    exec('git add myFile.txt');
                    exec('git commit -m "Add myFile.txt in PR #7"');
                    mergePR(7);
                    deployStaging();
                    // Verify output for checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-2-staging', [2, 5, 6, 7])];
                case 1:
                    // Verify output for checklist
                    _a.sent();
                    // Verify output for deploy comment
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.2-1-staging', '2.0.2-2-staging', [7])];
                case 2:
                    // Verify output for deploy comment
                    _a.sent();
                    Log.info('Appending and prepending content to myFile.txt in PR #8');
                    setupGitAsHuman();
                    exec('git switch main');
                    exec('git switch -c pr-8');
                    newFileContent = "\nPrepended content\n".concat(initialFileContent, "\nAppended content\n");
                    fs_1.default.writeFileSync('myFile.txt', newFileContent, { encoding: 'utf-8' });
                    exec('git add myFile.txt');
                    exec('git commit -m "Append and prepend content in myFile.txt"');
                    mergePR(8);
                    deployStaging();
                    // Verify output for checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-3-staging', [2, 5, 6, 7, 8])];
                case 3:
                    // Verify output for checklist
                    _a.sent();
                    // Verify output for deploy comment
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.2-2-staging', '2.0.2-3-staging', [8])];
                case 4:
                    // Verify output for deploy comment
                    _a.sent();
                    Log.info('Making an unrelated change in PR #9');
                    setupGitAsHuman();
                    exec('git switch main');
                    exec('git switch -c pr-9');
                    fs_1.default.appendFileSync('anotherFile.txt', 'some content');
                    exec('git add anotherFile.txt');
                    exec('git commit -m "Create another file"');
                    mergePR(9);
                    Log.info('Reverting the append + prepend on main in PR #10');
                    setupGitAsHuman();
                    exec('git switch main');
                    exec('git switch -c pr-10');
                    fs_1.default.writeFileSync('myFile.txt', initialFileContent);
                    exec('git add myFile.txt');
                    exec('git commit -m "Revert append and prepend"');
                    mergePR(10);
                    cherryPickPRToStaging(10);
                    Log.info('Verifying that the revert is present on staging, but the unrelated change is not');
                    expect(fs_1.default.readFileSync('myFile.txt', { encoding: 'utf8' })).toBe(initialFileContent);
                    expect(fs_1.default.existsSync('anotherFile.txt')).toBe(false);
                    Log.info('Repeating previously reverted append + prepend on main in PR #10');
                    setupGitAsHuman();
                    exec('git switch main');
                    exec('git switch -c pr-11');
                    fs_1.default.writeFileSync('myFile.txt', newFileContent, { encoding: 'utf-8' });
                    exec('git add myFile.txt');
                    exec('git commit -m "Append and prepend content in myFile.txt"');
                    mergePR(11);
                    deployProduction();
                    // Verify production release list
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.1-1', '2.0.2-4', [2, 5, 6, 7, 8, 10])];
                case 5:
                    // Verify production release list
                    _a.sent();
                    // Verify PR list for the new checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-0-staging', [9, 11])];
                case 6:
                    // Verify PR list for the new checklist
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Force-pushing to a branch after rebasing older commits', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createBasicPR(12);
                    exec('git push origin pr-12');
                    createBasicPR(13);
                    mergePR(13);
                    deployStaging();
                    // Verify PRs for checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-1-staging', [9, 11, 13])];
                case 1:
                    // Verify PRs for checklist
                    _a.sent();
                    // Verify PRs for deploy comments
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.3-0-staging', '2.0.3-1-staging', [13])];
                case 2:
                    // Verify PRs for deploy comments
                    _a.sent();
                    checkoutRepo();
                    setupGitAsHuman();
                    exec('git fetch origin pr-12');
                    exec('git switch pr-12');
                    exec('git rebase main -Xours');
                    exec('git push --force origin pr-12');
                    mergePR(12);
                    deployProduction();
                    // Verify PRs for deploy comments / release
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-1-staging', [9, 11, 13])];
                case 3:
                    // Verify PRs for deploy comments / release
                    _a.sent();
                    // Verify PRs for new checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.3-1-staging', '2.0.4-0-staging', [12])];
                case 4:
                    // Verify PRs for new checklist
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    test('Manual version bump', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, i, packageJSONBefore;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Log.info('Creating manual version bump in PR #14');
                    checkoutRepo();
                    setupGitAsHuman();
                    exec('git pull');
                    exec('git switch -c "pr-14"');
                    for (i = 0; i < 3; i++) {
                        exec("npm --no-git-tag-version version ".concat(VersionUpdater.incrementVersion(getVersion(), VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)));
                    }
                    exec('git add package.json');
                    exec("git commit -m \"Manually bump version to ".concat(getVersion(), " in PR #14\""));
                    Log.success('Created manual version bump in PR #13 in branch pr-14');
                    mergePR(14);
                    Log.info('Deploying staging...');
                    checkoutRepo();
                    updateStagingFromMain();
                    tagStaging();
                    Log.success("Deployed v".concat(getVersion(), " to staging!"));
                    // Verify PRs for deploy comments / release and new checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.4-0-staging', '5.0.0-0-staging', [14])];
                case 1:
                    // Verify PRs for deploy comments / release and new checklist
                    _a.sent();
                    Log.info('Creating manual version bump in PR #15');
                    checkoutRepo();
                    setupGitAsHuman();
                    exec('git pull');
                    exec('git switch -c "pr-15"');
                    for (i = 0; i < 3; i++) {
                        exec("npm --no-git-tag-version version ".concat(VersionUpdater.incrementVersion(getVersion(), VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)));
                    }
                    exec('git add package.json');
                    exec("git commit -m \"Manually bump version to ".concat(getVersion(), " in PR #15\""));
                    Log.success('Created manual version bump in PR #15 in branch pr-15');
                    packageJSONBefore = fs_1.default.readFileSync('package.json', { encoding: 'utf-8' });
                    mergePR(15);
                    cherryPickPRToStaging(15, function () {
                        fs_1.default.writeFileSync('package.json', packageJSONBefore);
                        exec('git add package.json');
                        exec('git cherry-pick --no-edit --continue');
                    }, function () {
                        exec('git commit --no-edit --allow-empty');
                    });
                    // Verify PRs for deploy comments
                    return [4 /*yield*/, assertPRsMergedBetween('5.0.0-0-staging', '8.0.0-0-staging', [15])];
                case 2:
                    // Verify PRs for deploy comments
                    _a.sent();
                    // Verify PRs for the deploy checklist
                    return [4 /*yield*/, assertPRsMergedBetween('2.0.4-0-staging', '8.0.0-0-staging', [14, 15])];
                case 3:
                    // Verify PRs for the deploy checklist
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
