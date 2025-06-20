"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var core_1 = require("@actions/core");
var github_1 = require("@actions/github");
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var sanitizeJSONStringValues_1 = require("@github/libs/sanitizeJSONStringValues");
var NumberUtils_1 = require("@libs/NumberUtils");
var OpenAIUtils_1 = require("@scripts/utils/OpenAIUtils");
function isCommentCreatedEvent(payload) {
    return payload.action === CONST_1.default.ACTIONS.CREATED;
}
function isCommentEditedEvent(payload) {
    return payload.action === CONST_1.default.ACTIONS.EDITED;
}
var ProposalPoliceTemplates = /** @class */ (function () {
    function ProposalPoliceTemplates() {
    }
    ProposalPoliceTemplates.getPromptForNewProposalTemplateCheck = function (commentBody) {
        return "I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH \"".concat(CONST_1.default.NO_ACTION, "\" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ").concat(commentBody);
    };
    ProposalPoliceTemplates.getPromptForNewProposalDuplicateCheck = function (existingProposal, newProposalBody) {
        return "I NEED HELP WITH CASE (3.) [INSTRUCTIONS SECTION: IX. DUPLICATE PROPOSAL DETECTION], COMPARE THE FOLLOWING TWO PROPOSALS AND RETURN A SIMILARITY PERCENTAGE (0-100) REPRESENTING HOW SIMILAR THESE TWO PROPOSALS ARE IN THOSE SECTIONS AS PER THE INSTRUCTIONS. \n\nProposal 1:\n".concat(existingProposal, "\n\nProposal 2:\n").concat(newProposalBody);
    };
    ProposalPoliceTemplates.getPromptForEditedProposal = function (previousBody, editedBody) {
        return "I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH \"".concat(CONST_1.default.NO_ACTION, "\" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ").concat(previousBody, ".\n\nEdited comment content: ").concat(editedBody);
    };
    ProposalPoliceTemplates.getDuplicateCheckWithdrawMessage = function () {
        return '#### 🚫 Duplicated proposal withdrawn by 🤖 ProposalPolice.';
    };
    ProposalPoliceTemplates.getDuplicateCheckNoticeMessage = function (proposalAuthor) {
        return "\u26A0\uFE0F @".concat(proposalAuthor, " Your proposal is a duplicate of an already existing proposal and has been automatically withdrawn to prevent spam. Please review the existing proposals before submitting a new one.");
    };
    return ProposalPoliceTemplates;
}());
// Main function to process the workflow event
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var now, zonedDate, formattedDate, payload, apiKey, assistantID, openAI, issueNumber, commentID, newProposalCreatedAt_1, newProposalBody, newProposalAuthor, commentsResponse, previousProposals, didFindDuplicate, _i, previousProposals_1, previousProposal, isProposal, isAuthorBot, duplicateCheckPrompt, duplicateCheckResponse, similarityPercentage, parsedDuplicateCheckResponse, _a, similarity, duplicateCheckWithdrawMessage, duplicateCheckNoticeMessage, prompt, assistantResponse, parsedAssistantResponse, _b, _c, action, _d, message, isNoAction, isActionEdit, isActionRequired, formattedResponse, formattedResponse;
        var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        return __generator(this, function (_1) {
            switch (_1.label) {
                case 0:
                    now = Date.now();
                    zonedDate = (0, date_fns_tz_1.toZonedTime)(now, 'UTC');
                    formattedDate = (0, date_fns_1.format)(zonedDate, "yyyy-MM-dd HH:mm:ss 'UTC'");
                    // Verify this is running for an expected webhook event
                    if (github_1.context.eventName !== CONST_1.default.EVENTS.ISSUE_COMMENT) {
                        throw new Error('ProposalPolice™ only supports the issue_comment webhook event');
                    }
                    payload = github_1.context.payload;
                    // Return early unless issue is open AND has the "Help Wanted" label
                    if (((_e = payload.issue) === null || _e === void 0 ? void 0 : _e.state) !== CONST_1.default.STATE.OPEN || !((_f = payload.issue) === null || _f === void 0 ? void 0 : _f.labels.some(function (issueLabel) { return issueLabel.name === CONST_1.default.LABELS.HELP_WANTED; }))) {
                        console.log('Issue is not open or does not have the "Help Wanted" label, skipping checks.');
                        return [2 /*return*/];
                    }
                    // Verify that the comment is not empty and contains the case sensitive `Proposal` keyword
                    if (!((_g = payload.comment) === null || _g === void 0 ? void 0 : _g.body.trim()) || !((_h = payload.comment) === null || _h === void 0 ? void 0 : _h.body.includes(CONST_1.default.PROPOSAL_KEYWORD))) {
                        console.log('Comment body is either empty or doesn\'t contain the keyword "Proposal": ', (_j = payload.comment) === null || _j === void 0 ? void 0 : _j.body);
                        return [2 /*return*/];
                    }
                    // If event is `edited` and comment was already edited by the bot, return early
                    if (isCommentEditedEvent(payload) && ((_k = payload.comment) === null || _k === void 0 ? void 0 : _k.body.trim().includes('Edited by **proposal-police**'))) {
                        console.log('Comment was already edited by proposal-police once.\n', (_l = payload.comment) === null || _l === void 0 ? void 0 : _l.body);
                        return [2 /*return*/];
                    }
                    console.log('ProposalPolice™ Action triggered for comment:', (_m = payload.comment) === null || _m === void 0 ? void 0 : _m.body);
                    console.log('-> GitHub Action Type: ', (_o = payload.action) === null || _o === void 0 ? void 0 : _o.toUpperCase());
                    if (!isCommentCreatedEvent(payload) && !isCommentEditedEvent(payload)) {
                        console.error('Unsupported action type:', payload === null || payload === void 0 ? void 0 : payload.action);
                        (0, core_1.setFailed)(new Error("Unsupported action type ".concat(payload === null || payload === void 0 ? void 0 : payload.action)));
                        return [2 /*return*/];
                    }
                    apiKey = (0, core_1.getInput)('PROPOSAL_POLICE_API_KEY', { required: true });
                    assistantID = (0, core_1.getInput)('PROPOSAL_POLICE_ASSISTANT_ID', { required: true });
                    openAI = new OpenAIUtils_1.default(apiKey);
                    issueNumber = (_q = (_p = payload.issue) === null || _p === void 0 ? void 0 : _p.number) !== null && _q !== void 0 ? _q : -1;
                    commentID = (_s = (_r = payload.comment) === null || _r === void 0 ? void 0 : _r.id) !== null && _s !== void 0 ? _s : -1;
                    if (!isCommentCreatedEvent(payload)) return [3 /*break*/, 8];
                    console.log('Starting DUPLICATE PROPOSAL DETECTION Check');
                    newProposalCreatedAt_1 = new Date(payload.comment.created_at).getTime();
                    newProposalBody = payload.comment.body;
                    newProposalAuthor = payload.comment.user.login;
                    // Fetch all comments in the issue
                    console.log('Get comments for issue #', issueNumber);
                    return [4 /*yield*/, GithubUtils_1.default.getAllCommentDetails(issueNumber)];
                case 1:
                    commentsResponse = _1.sent();
                    console.log('commentsResponse', commentsResponse);
                    previousProposals = commentsResponse === null || commentsResponse === void 0 ? void 0 : commentsResponse.filter(function (comment) { var _a; return new Date(comment.created_at).getTime() < newProposalCreatedAt_1 && ((_a = comment.body) === null || _a === void 0 ? void 0 : _a.includes(CONST_1.default.PROPOSAL_KEYWORD)); });
                    didFindDuplicate = false;
                    _i = 0, previousProposals_1 = previousProposals;
                    _1.label = 2;
                case 2:
                    if (!(_i < previousProposals_1.length)) return [3 /*break*/, 5];
                    previousProposal = previousProposals_1[_i];
                    isProposal = !!((_t = previousProposal.body) === null || _t === void 0 ? void 0 : _t.includes(CONST_1.default.PROPOSAL_KEYWORD));
                    isAuthorBot = ((_u = previousProposal.user) === null || _u === void 0 ? void 0 : _u.login) === CONST_1.default.COMMENT.NAME_GITHUB_ACTIONS || ((_v = previousProposal.user) === null || _v === void 0 ? void 0 : _v.type) === CONST_1.default.COMMENT.TYPE_BOT;
                    // Skip prompting if comment is author is the GH bot or comment is empty / not a proposal
                    if (isAuthorBot || !isProposal) {
                        return [3 /*break*/, 4];
                    }
                    duplicateCheckPrompt = ProposalPoliceTemplates.getPromptForNewProposalDuplicateCheck(previousProposal.body, newProposalBody);
                    return [4 /*yield*/, openAI.promptAssistant(assistantID, duplicateCheckPrompt)];
                case 3:
                    duplicateCheckResponse = _1.sent();
                    similarityPercentage = 0;
                    try {
                        parsedDuplicateCheckResponse = JSON.parse((0, sanitizeJSONStringValues_1.default)(duplicateCheckResponse));
                        console.log('parsedDuplicateCheckResponse: ', parsedDuplicateCheckResponse);
                        _a = (parsedDuplicateCheckResponse !== null && parsedDuplicateCheckResponse !== void 0 ? parsedDuplicateCheckResponse : {}).similarity, similarity = _a === void 0 ? 0 : _a;
                        similarityPercentage = (0, NumberUtils_1.convertToNumber)(similarity);
                    }
                    catch (e) {
                        console.error('Failed to parse AI response:', duplicateCheckResponse);
                    }
                    if (similarityPercentage >= 90) {
                        console.log("Found duplicate with ".concat(similarityPercentage, "% similarity."));
                        didFindDuplicate = true;
                        return [3 /*break*/, 5];
                    }
                    _1.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (!didFindDuplicate) return [3 /*break*/, 8];
                    duplicateCheckWithdrawMessage = ProposalPoliceTemplates.getDuplicateCheckWithdrawMessage();
                    duplicateCheckNoticeMessage = ProposalPoliceTemplates.getDuplicateCheckNoticeMessage(newProposalAuthor);
                    // If a duplicate proposal is detected, update the comment to withdraw it
                    console.log('ProposalPolice™ withdrawing duplicated proposal...');
                    return [4 /*yield*/, GithubUtils_1.default.octokit.issues.updateComment(__assign(__assign({}, github_1.context.repo), { 
                            /* eslint-disable @typescript-eslint/naming-convention */
                            comment_id: commentID, body: duplicateCheckWithdrawMessage }))];
                case 6:
                    _1.sent();
                    // Post a comment to notify the user about the withdrawn duplicated proposal
                    console.log('ProposalPolice™ notifying contributor of withdrawn proposal...');
                    return [4 /*yield*/, GithubUtils_1.default.createComment(CONST_1.default.APP_REPO, issueNumber, duplicateCheckNoticeMessage)];
                case 7:
                    _1.sent();
                    console.log('DUPLICATE PROPOSAL DETECTION Check Completed, returning early.');
                    return [2 /*return*/];
                case 8:
                    prompt = isCommentCreatedEvent(payload)
                        ? ProposalPoliceTemplates.getPromptForNewProposalTemplateCheck((_w = payload.comment) === null || _w === void 0 ? void 0 : _w.body)
                        : ProposalPoliceTemplates.getPromptForEditedProposal((_x = payload.changes.body) === null || _x === void 0 ? void 0 : _x.from, (_y = payload.comment) === null || _y === void 0 ? void 0 : _y.body);
                    return [4 /*yield*/, openAI.promptAssistant(assistantID, prompt)];
                case 9:
                    assistantResponse = _1.sent();
                    parsedAssistantResponse = JSON.parse((0, sanitizeJSONStringValues_1.default)(assistantResponse));
                    console.log('parsedAssistantResponse: ', parsedAssistantResponse);
                    _b = parsedAssistantResponse !== null && parsedAssistantResponse !== void 0 ? parsedAssistantResponse : {}, _c = _b.action, action = _c === void 0 ? '' : _c, _d = _b.message, message = _d === void 0 ? '' : _d;
                    isNoAction = action.trim() === CONST_1.default.NO_ACTION;
                    isActionEdit = action.trim() === CONST_1.default.ACTION_EDIT;
                    isActionRequired = action.trim() === CONST_1.default.ACTION_REQUIRED;
                    // If assistant response is NO_ACTION and there's no message, return early
                    if (isNoAction && !message) {
                        console.log('Detected NO_ACTION for comment, returning early.');
                        return [2 /*return*/];
                    }
                    if (!(isCommentCreatedEvent(payload) && isActionRequired)) return [3 /*break*/, 11];
                    formattedResponse = message
                        // replace {user} from response template with @username
                        .replaceAll('{user}', "@".concat((_z = payload.comment) === null || _z === void 0 ? void 0 : _z.user.login));
                    // Create a comment with the assistant's response
                    console.log('ProposalPolice™ commenting on issue...');
                    return [4 /*yield*/, GithubUtils_1.default.createComment(CONST_1.default.APP_REPO, issueNumber, formattedResponse)];
                case 10:
                    _1.sent();
                    return [3 /*break*/, 13];
                case 11:
                    if (!isActionEdit) return [3 /*break*/, 13];
                    formattedResponse = message.replace('{updated_timestamp}', formattedDate);
                    console.log('ProposalPolice™ editing issue comment...', commentID);
                    return [4 /*yield*/, GithubUtils_1.default.octokit.issues.updateComment(__assign(__assign({}, github_1.context.repo), { 
                            /* eslint-disable @typescript-eslint/naming-convention */
                            comment_id: commentID, body: "".concat(formattedResponse, "\n\n").concat((_0 = payload.comment) === null || _0 === void 0 ? void 0 : _0.body) }))];
                case 12:
                    _1.sent();
                    _1.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
run().catch(function (error) {
    console.error(error);
    // Zero status ensures that the action is marked as successful regardless the outcome
    // which means that no failure notification is sent to issue's subscribers
    process.exit(0);
});
