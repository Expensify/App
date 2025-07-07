"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
describe('tokenizedSearch', function () {
    it('WorkspaceMembersSelectionList & WorkspaceWorkflowsPayerPage & WorkspaceWorkflowsApprovalsApproverPage & WorkspaceWorkflowsApprovalsExpensesFromPage', function () {
        var tokenizeSearch = 'One Three';
        var items = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
            {
                alternateText: 'example2@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example2@test.com',
                login: 'example2@test.com',
                text: 'Example Test',
            },
        ];
        var searchResultList = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
        ];
        var tokenizeSearchResult = (0, tokenizedSearch_1.default)(items, tokenizeSearch, function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : '']; });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });
    it('InviteReportParticipantsPage', function () {
        var tokenizeSearch = 'One Three';
        var items = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
            {
                alternateText: 'example2@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example2@test.com',
                login: 'example2@test.com',
                text: 'Example Test',
            },
        ];
        var searchResultList = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
        ];
        var tokenizeSearchResult = (0, tokenizedSearch_1.default)(items, tokenizeSearch, function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : '']; });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });
    it('WorkspaceCompanyCardAccountSelectCardPage', function () {
        var tokenizeSearch = 'One Three';
        var items = [
            {
                brickRoadIndicator: undefined,
                icons: [],
                isBold: false,
                isPolicyAdmin: true,
                isSelected: false,
                keyForList: '390A7184965D8FAE',
                policyID: '390A7184965D8FAE',
                text: "One Two Three's Workspace",
            },
            {
                brickRoadIndicator: undefined,
                icons: [],
                isBold: false,
                isPolicyAdmin: true,
                isSelected: false,
                keyForList: '8AFC0DA9A57EF975',
                policyID: '8AFC0DA9A57EF975',
                text: "Test's Workspace",
            },
        ];
        var searchResultList = [
            {
                brickRoadIndicator: undefined,
                icons: [],
                isBold: false,
                isPolicyAdmin: true,
                isSelected: false,
                keyForList: '390A7184965D8FAE',
                policyID: '390A7184965D8FAE',
                text: "One Two Three's Workspace",
            },
        ];
        var tokenizeSearchResult = (0, tokenizedSearch_1.default)(items, tokenizeSearch, function (option) { var _a; return [(_a = option.text) !== null && _a !== void 0 ? _a : '']; });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });
    it('expensifyCard/issueNew/AssigneeStep', function () {
        var tokenizeSearch = 'One Three';
        var items = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
            {
                alternateText: 'example2@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example2@test.com',
                login: 'example2@test.com',
                text: 'Example Test',
            },
        ];
        var searchResultList = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
        ];
        var tokenizeSearchResult = (0, tokenizedSearch_1.default)(items, tokenizeSearch, function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.alternateText) !== null && _b !== void 0 ? _b : '']; });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });
});
