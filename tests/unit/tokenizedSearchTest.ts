import type {SelectionListApprover} from '@components/WorkspaceMembersSelectionList';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import tokenizedSearch from '@libs/tokenizedSearch';

describe('tokenizedSearch', () => {
    it('WorkspaceMembersSelectionList & WorkspaceWorkflowsPayerPage & WorkspaceWorkflowsApprovalsApproverPage & WorkspaceWorkflowsApprovalsExpensesFromPage', () => {
        const tokenizeSearch = 'One Three';

        const items: SelectionListApprover[] = [
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

        const searchResultList: SelectionListApprover[] = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
        ];

        const tokenizeSearchResult = tokenizedSearch(items, tokenizeSearch, (option) => [option.text ?? '', option.login ?? '']);
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });

    it('InviteReportParticipantsPage', () => {
        const tokenizeSearch = 'One Three';

        const items: SelectionListApprover[] = [
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

        const searchResultList: SelectionListApprover[] = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
        ];

        const tokenizeSearchResult = tokenizedSearch(items, tokenizeSearch, (option) => [option.text ?? '', option.login ?? '']);
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });

    it('WorkspaceCompanyCardAccountSelectCardPage', () => {
        const tokenizeSearch = 'One Three';

        const items: WorkspaceListItem[] = [
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

        const searchResultList: WorkspaceListItem[] = [
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

        const tokenizeSearchResult = tokenizedSearch(items, tokenizeSearch, (option) => [option.text ?? '']);
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });

    it('expensifyCard/issueNew/AssigneeStep', () => {
        const tokenizeSearch = 'One Three';

        const items: SelectionListApprover[] = [
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

        const searchResultList: SelectionListApprover[] = [
            {
                alternateText: 'example@test.com',
                icons: [],
                isSelected: false,
                keyForList: 'example@test.com',
                login: 'example@test.com',
                text: 'One Two Three',
            },
        ];

        const tokenizeSearchResult = tokenizedSearch(items, tokenizeSearch, (option) => [option.text ?? '', option.alternateText ?? '']);
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });
});
