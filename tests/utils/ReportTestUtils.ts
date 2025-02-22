import * as NativeNavigation from '@react-navigation/native';
import {act, fireEvent, screen, within} from '@testing-library/react-native';
import {translateLocal} from '@libs/Localize';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type ReportActionName from '@src/types/onyx/ReportActionName';
import type {NativeNavigationMock} from '../../__mocks__/@react-navigation/native';
import createRandomReportAction from './collections/reportActions';
import waitForBatchedUpdatesWithAct from './waitForBatchedUpdatesWithAct';

const actionNames: ReportActionName[] = ['ADDCOMMENT', 'IOU', 'REPORTPREVIEW', 'CLOSED'];

const getFakeReportAction = (index: number, actionName?: ReportActionName): ReportAction =>
    ({
        actionName,
        actorAccountID: index,
        automatic: false,
        avatar: '',
        created: '2023-09-12 16:27:35.124',
        isAttachmentOnly: true,
        isFirstItem: false,
        lastModified: '2021-07-14T15:00:00Z',
        message: [
            {
                html: 'hey',
                isDeletedParentAction: false,
                isEdited: false,
                text: 'test',
                type: 'TEXT',
                whisperedTo: [],
            },
        ],
        originalMessage: {
            html: 'hey',
            lastModified: '2021-07-14T15:00:00Z',
            // IOUReportID: index,
            linkedReportID: index.toString(),
            whisperedTo: [],
            reason: '',
            violationName: '',
        },
        pendingAction: null,
        person: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'email@test.com',
            },
        ],
        reportActionID: index.toString(),
        sequenceNumber: 0,
        shouldShow: true,
    } as ReportAction);

const getMockedSortedReportActions = (length = 100): ReportAction[] =>
    Array.from({length}, (element, index): ReportAction => {
        const actionName: ReportActionName = index === 0 ? 'CREATED' : 'ADDCOMMENT';
        return getFakeReportAction(index + 1, actionName);
    }).reverse();

const getMockedReportActionsMap = (length = 100): ReportActions => {
    const mockReports: ReportActions[] = Array.from({length}, (element, index): ReportActions => {
        const reportID = index + 1;
        const actionName: ReportActionName = index === 0 ? 'CREATED' : actionNames.at(index % actionNames.length) ?? 'CREATED';
        const reportAction = {
            ...createRandomReportAction(reportID),
            actionName,
            originalMessage: {
                linkedReportID: reportID.toString(),
            },
        } as ReportAction;

        return {[reportID]: reportAction};
    });
    return Object.assign({}, ...mockReports) as ReportActions;
};

const REPORT_ID = '1';
const LIST_SIZE = {
    width: 300,
    height: 400,
};
const LIST_CONTENT_SIZE = {
    width: 300,
    height: 600,
};

function getReportScreen(reportID = REPORT_ID) {
    return screen.getByTestId(`report-screen-${reportID}`);
}

function scrollToOffset(offset: number) {
    const hintText = translateLocal('sidebarScreen.listOfChatMessages');
    fireEvent.scroll(within(getReportScreen()).getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: offset,
            },
            contentSize: LIST_CONTENT_SIZE,
            layoutMeasurement: LIST_SIZE,
        },
    });
}

function triggerListLayout(reportID?: string) {
    const report = getReportScreen(reportID);
    fireEvent(within(report).getByTestId('report-actions-view-wrapper'), 'onLayout', {
        nativeEvent: {
            layout: {
                x: 0,
                y: 0,
                ...LIST_SIZE,
            },
        },
    });

    fireEvent(within(report).getByTestId('report-actions-list'), 'onContentSizeChange', LIST_CONTENT_SIZE.width, LIST_CONTENT_SIZE.height);
}

async function navigateToSidebarOption(reportID: string): Promise<void> {
    const optionRow = screen.getByTestId(reportID);
    fireEvent(optionRow, 'press');
    await act(() => {
        (NativeNavigation as NativeNavigationMock).triggerTransitionEnd();
    });
    // ReportScreen relies on the onLayout event to receive updates from onyx.
    triggerListLayout(reportID);
    await waitForBatchedUpdatesWithAct();
}

export {
    getFakeReportAction,
    getMockedSortedReportActions,
    getMockedReportActionsMap,
    REPORT_ID,
    LIST_CONTENT_SIZE,
    getReportScreen,
    scrollToOffset,
    triggerListLayout,
    navigateToSidebarOption,
};
