import type * as ReactNavigation from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasOutstandingChildTask from '@hooks/useHasOutstandingChildTask';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSearchSelector from '@hooks/useSearchSelector';
import {TaskAssigneeSelectorModal} from '@pages/tasks/TaskAssigneeSelectorModal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useRoute: jest.fn(),
        useFocusEffect: jest.fn(),
    };
});
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useHasOutstandingChildTask');
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (value: string) => value,
    })),
);
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/useReportIsArchived');
jest.mock('@hooks/useSearchSelector');
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flex1: {},
        w100: {},
        pRelative: {},
    })),
);
jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));
jest.mock('@libs/actions/Task', () => ({
    canModifyTask: jest.fn(() => true),
    editTaskAssignee: jest.fn(),
    setAssigneeValue: jest.fn(() => ({report: undefined, isOptimisticReport: false})),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    dismissModalWithReport: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));
jest.mock('@libs/ReportUtils', () => ({
    getDisplayNameForParticipant: jest.fn(({accountID, shouldAddCurrentUserPostfix}: {accountID?: number; shouldAddCurrentUserPostfix?: boolean}) =>
        accountID === 1 && shouldAddCurrentUserPostfix ? 'Current User (you)' : `User ${accountID ?? ''}`,
    ),
    isOpenTaskReport: jest.fn(() => true),
    isTaskReport: jest.fn(() => false),
}));

describe('TaskAssigneeSelectorModal', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);
    const mockedUseSearchSelector = jest.mocked(useSearchSelector);
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedUseRoute = jest.mocked(useRoute);

    const personalDetails = Object.fromEntries([
        [1, {accountID: 1, login: 'current@test.com', displayName: 'Current User', avatar: 'current-avatar'}],
        [2, {accountID: 2, login: 'recent@test.com', displayName: 'Recent User', avatar: 'recent-avatar'}],
        [3, {accountID: 3, login: 'contact@test.com', displayName: 'Contact User', avatar: 'contact-avatar'}],
        [4, {accountID: 4, login: 'recent2@test.com', displayName: 'Recent User 2', avatar: 'recent2-avatar'}],
        [5, {accountID: 5, login: 'recent3@test.com', displayName: 'Recent User 3', avatar: 'recent3-avatar'}],
        [6, {accountID: 6, login: 'recent4@test.com', displayName: 'Recent User 4', avatar: 'recent4-avatar'}],
        [7, {accountID: 7, login: 'contact2@test.com', displayName: 'Contact User 2', avatar: 'contact2-avatar'}],
        [8, {accountID: 8, login: 'contact3@test.com', displayName: 'Contact User 3', avatar: 'contact3-avatar'}],
        [9, {accountID: 9, login: 'contact4@test.com', displayName: 'Contact User 4', avatar: 'contact4-avatar'}],
    ]);

    const availableOptions = {
        currentUserOption: {
            accountID: 1,
            login: 'current@test.com',
            text: 'Current User',
            keyForList: 'current-user',
            alternateText: 'current@test.com',
            icons: [],
        },
        recentReports: [
            {accountID: 2, login: 'recent@test.com', text: 'Recent User', keyForList: 'recent-2', alternateText: 'recent@test.com', icons: []},
            {accountID: 4, login: 'recent2@test.com', text: 'Recent User 2', keyForList: 'recent-4', alternateText: 'recent2@test.com', icons: []},
            {accountID: 5, login: 'recent3@test.com', text: 'Recent User 3', keyForList: 'recent-5', alternateText: 'recent3@test.com', icons: []},
            {accountID: 6, login: 'recent4@test.com', text: 'Recent User 4', keyForList: 'recent-6', alternateText: 'recent4@test.com', icons: []},
        ],
        personalDetails: [
            {accountID: 3, login: 'contact@test.com', text: 'Contact User', keyForList: 'contact-3', alternateText: 'contact@test.com', icons: []},
            {accountID: 7, login: 'contact2@test.com', text: 'Contact User 2', keyForList: 'contact-7', alternateText: 'contact2@test.com', icons: []},
            {accountID: 8, login: 'contact3@test.com', text: 'Contact User 3', keyForList: 'contact-8', alternateText: 'contact3@test.com', icons: []},
            {accountID: 9, login: 'contact4@test.com', text: 'Contact User 4', keyForList: 'contact-9', alternateText: 'contact4@test.com', icons: []},
        ],
        userToInvite: null,
    };

    let taskData: {assigneeAccountID?: number; report?: {managerID?: number}; shareDestination?: string};

    beforeEach(() => {
        jest.clearAllMocks();
        taskData = {
            assigneeAccountID: 2,
            shareDestination: 'share-destination',
        };

        mockedUseRoute.mockReturnValue({
            key: 'task-assignee',
            name: 'TASK_ASSIGNEE',
            params: {backTo: ''},
        } as never);

        jest.mocked(usePersonalDetails).mockReturnValue(personalDetails as ReturnType<typeof usePersonalDetails>);
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
            accountID: 1,
            email: 'current@test.com',
            login: 'current@test.com',
        } as ReturnType<typeof useCurrentUserPersonalDetails>);
        jest.mocked(useHasOutstandingChildTask).mockReturnValue(false);
        jest.mocked(useReportIsArchived).mockReturnValue(false);

        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.COLLECTION.REPORT:
                    return [undefined, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.TASK:
                    return [taskData, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return [false, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.COUNTRY_CODE:
                    return [CONST.DEFAULT_COUNTRY_CODE, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.LOGIN_LIST:
                    return [{}, jest.fn()] as ReturnType<typeof useOnyx>;
                default:
                    return [undefined, jest.fn()] as ReturnType<typeof useOnyx>;
            }
        });

        mockedUseSearchSelector.mockReturnValue({
            searchTerm: '',
            debouncedSearchTerm: '',
            setSearchTerm: jest.fn(),
            availableOptions,
            areOptionsInitialized: true,
        } as ReturnType<typeof useSearchSelector>);
    });

    it('renders a selected-top section for a recent assignee and excludes it from lower sections', () => {
        render(<TaskAssigneeSelectorModal />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([expect.objectContaining({accountID: 2, isSelected: true})]);
        expect(selectionListProps?.sections[1].title).toBe('newTaskPage.assignMe');
        expect(selectionListProps?.sections[2].title).toBe('common.recents');
        expect(selectionListProps?.sections[2].data).not.toEqual(expect.arrayContaining([expect.objectContaining({accountID: 2})]));
        expect(selectionListProps?.sections[3].title).toBe('common.contacts');
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(false);
        expect(selectionListProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('renders a selected-top section for a contact assignee and excludes it from contacts', () => {
        taskData.assigneeAccountID = 3;

        render(<TaskAssigneeSelectorModal />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([expect.objectContaining({accountID: 3, isSelected: true})]);
        expect(selectionListProps?.sections[3].data).not.toEqual(expect.arrayContaining([expect.objectContaining({accountID: 3})]));
    });

    it('shows the current user once when they are the selected assignee', () => {
        taskData.assigneeAccountID = 1;

        render(<TaskAssigneeSelectorModal />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([expect.objectContaining({accountID: 1, text: 'Current User (you)', isSelected: true})]);
        expect(selectionListProps?.sections.map((section: {title?: string}) => section.title)).not.toContain('newTaskPage.assignMe');
    });

    it('keeps the originally pinned assignee at the top during the same mount', () => {
        const {rerender} = render(<TaskAssigneeSelectorModal />);

        taskData.assigneeAccountID = 3;
        rerender(<TaskAssigneeSelectorModal />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([expect.objectContaining({accountID: 2, isSelected: false})]);
        expect(selectionListProps?.sections[3].data).toEqual(expect.arrayContaining([expect.objectContaining({accountID: 3, isSelected: true})]));
    });
});
