import {render} from '@testing-library/react-native';

import UserAvatar from '@components/Avatar/UserAvatar';
import AvatarWithTextCell from '@components/Search/SearchList/ListItem/AvatarWithTextCell';
import TaskListItem from '@components/Search/SearchList/ListItem/TaskListItem';
import type {TaskListItemType} from '@components/Search/SearchList/ListItem/types';
import ListItemComposed from '@components/SelectionList/ListItemComposed';
import TextWithTooltip from '@components/TextWithTooltip';

import CONST from '@src/CONST';

import type {PropsWithChildren} from 'react';

import React from 'react';

let mockIsLargeScreenWidth = true;

jest.mock('@components/Avatar/UserAvatar', () => jest.fn(() => null));
jest.mock('@components/Badge', () => jest.fn(() => null));
jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/Search/SearchList/ListItem/AvatarWithTextCell', () => jest.fn(() => null));
jest.mock('@components/Search/SearchList/ListItem/DateCell', () => jest.fn(() => null));
jest.mock('@components/Search/SearchList/ListItem/UserInfoCell', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItemComposed', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/TextWithTooltip', () => jest.fn(() => null));

jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => ({accountID: 1})}));
jest.mock('@components/Search/SearchSelectionProvider', () => ({useRowSelection: () => ({isSelected: false})}));
jest.mock('@hooks/useHasOutstandingChildTask', () => jest.fn(() => false));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({ArrowRightLong: 'arrow'})}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useParentReport', () => jest.fn(() => undefined));
jest.mock('@hooks/useParentReportAction', () => jest.fn(() => undefined));
jest.mock('@hooks/useReportIsArchived', () => jest.fn(() => false));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isLargeScreenWidth: mockIsLargeScreenWidth})));
jest.mock('@hooks/useStyleUtils', () => jest.fn(() => new Proxy({}, {get: () => () => ({})})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({icon: '', reportStatusBadge: {paid: {backgroundColor: '', textColor: ''}}})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@libs/actions/Task', () => ({canActionTask: () => false, completeTask: jest.fn()}));
jest.mock('@libs/Fullstory', () => ({__esModule: true, default: {getChatFSClass: () => ''}}));

const TASK_ITEM = {
    keyForList: 'task-1',
    type: CONST.SEARCH.DATA_TYPES.TASK,
    accountID: 1,
    created: '2026-10-02 12:00:00',
    description: 'Review the expense',
    managerID: 2,
    parentReportID: 'parent-1',
    reportID: 'task-1',
    reportName: 'Review expense',
    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
    assignee: {accountID: 2, avatar: 'assignee.png'},
    createdBy: {accountID: 1, avatar: 'creator.png'},
    formattedAssignee: 'Assignee',
    formattedCreatedBy: 'Creator',
    parentReportName: 'Shared chat',
    parentReportIcon: {source: 'chat.png', type: CONST.ICON_TYPE_AVATAR, name: 'Shared chat', id: 3},
    report: {reportID: 'task-1'},
    shouldShowYear: false,
} as TaskListItemType;

const mockedListItemComposed = jest.mocked(ListItemComposed);
const mockedTextWithTooltip = jest.mocked(TextWithTooltip);
const mockedAvatarWithTextCell = jest.mocked(AvatarWithTextCell);

function renderTaskItem() {
    return render(
        <TaskListItem
            item={TASK_ITEM}
            showTooltip={false}
            onSelectRow={jest.fn()}
        />,
    );
}

describe('TaskListItem text selection', () => {
    beforeEach(() => {
        mockIsLargeScreenWidth = true;
        jest.clearAllMocks();
    });

    it('enables copyable-row handling and marks the task title, description, and shared chat as copyable', () => {
        // Given a task displayed in the wide search table.
        renderTaskItem();

        // When the row is rendered, then its press handling allows native selection for each copyable value.
        expect(mockedListItemComposed).toHaveBeenCalledWith(expect.objectContaining({shouldAllowTextSelection: true}), undefined);
        expect(mockedTextWithTooltip).toHaveBeenCalledWith(expect.objectContaining({text: 'Review expense', isCopyable: true}), undefined);
        expect(mockedTextWithTooltip).toHaveBeenCalledWith(expect.objectContaining({text: 'Review the expense', isCopyable: true}), undefined);
        expect(mockedAvatarWithTextCell).toHaveBeenCalledWith(expect.objectContaining({reportName: 'Shared chat', isCopyable: true}), undefined);
    });

    it('excludes the compact assignee avatar from copied content', () => {
        // Given a task displayed in the narrow search layout.
        mockIsLargeScreenWidth = false;

        // When the row is rendered, then its avatar is hidden from copied text.
        const renderResult = renderTaskItem();
        const avatar = renderResult.UNSAFE_getByType(UserAvatar);
        expect(avatar.parent?.props).toMatchObject({
            dataSet: {[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true},
        });
    });
});
