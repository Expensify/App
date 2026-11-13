import {render, screen} from '@testing-library/react-native';

import SupportTicketView from '@components/ReportActionItem/SupportTicketView';
import TaskView from '@components/ReportActionItem/TaskView';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from '@components/ShowContextMenuContext';

import ReportActionItemContentCreated from '@pages/inbox/report/ReportActionItemContentCreated';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@components/ReportActionItem/SupportTicketView', () => jest.fn(() => null));
jest.mock('@components/ReportActionItem/TaskView', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/AnimatedEmptyStateBackground', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{testID?: string}>>>('react-native');
    return () => <RN.View testID="animated-background" />;
});

const action = createMock<ReportAction>({reportActionID: '3', actionName: CONST.REPORT.ACTIONS.TYPE.CREATED});
const actionsContext: ShowContextMenuActionsContextType = {
    checkIfContextMenuActive: () => {},
    onShowContextMenu: () => {},
};

function renderCreatedContent(report: Report) {
    const stateContext: ShowContextMenuStateContextType = {
        anchor: null,
        report,
        action,
        transactionThreadReport: undefined,
        isDisabled: true,
        shouldDisplayContextMenu: false,
    };

    return render(
        <ShowContextMenuStateContext.Provider value={stateContext}>
            <ShowContextMenuActionsContext.Provider value={actionsContext}>
                <ReportActionItemContentCreated
                    parentReportAction={undefined}
                    transactionID={undefined}
                    draftMessage={undefined}
                    shouldHideThreadDividerLine={false}
                />
            </ShowContextMenuActionsContext.Provider>
        </ShowContextMenuStateContext.Provider>,
    );
}

describe('ReportActionItemContentCreated support-ticket presentation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps support-ticket metadata and errors without a decorative background', () => {
        // Given a support ticket whose creation error still needs to be dismissible
        const report: Report = {
            reportID: '2',
            type: CONST.REPORT.TYPE.SUPPORT_TICKET,
            reportName: 'Support ticket',
            managerID: 123,
            errorFields: {createReport: {[Date.now()]: 'Unable to create ticket'}},
        };

        // When the ticket header is rendered
        renderCreatedContent(report);

        // Then its functional metadata view is retained, but the decorative background is not
        expect(jest.mocked(SupportTicketView).mock.calls.at(-1)?.at(0)).toEqual({report, action});
        expect(screen.queryByTestId('animated-background')).toBeNull();
        expect(TaskView).not.toHaveBeenCalled();
    });

    it('preserves the background for task headers', () => {
        // Given an unrelated task report
        const report: Report = {reportID: '4', type: CONST.REPORT.TYPE.TASK};

        // When its created content is rendered
        renderCreatedContent(report);

        // Then only the support-ticket presentation has changed
        expect(screen.getByTestId('animated-background')).toBeTruthy();
        expect(TaskView).toHaveBeenCalled();
        expect(SupportTicketView).not.toHaveBeenCalled();
    });
});
