import {render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TaskView from '@components/ReportActionItem/TaskView';

import {getDisplayNameForParticipant} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createRegularTaskReport} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockTranslate = jest.fn((path: string) => path);
const mockFormatPhoneNumber = jest.fn((value: string) => value);

jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate, formatPhoneNumber: mockFormatPhoneNumber, localeCompare: (a: string, b: string) => a.localeCompare(b)}));

jest.mock('@components/RenderHTML', () => () => null);

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const TASK_MANAGER_ACCOUNT_ID = 616161;

describe('TaskView', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('resolves the assignee display name through the translate function from useLocalize', async () => {
        const taskReport: Report = {
            ...createRegularTaskReport(1, TASK_MANAGER_ACCOUNT_ID),
            managerID: TASK_MANAGER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
        await waitForBatchedUpdates();

        render(
            <OnyxListItemProvider>
                <TaskView
                    report={taskReport}
                    parentReport={undefined}
                    action={undefined}
                />
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdates();

        // The assignee menu item resolves its title via getDisplayNameForParticipant, which must receive the translate from useLocalize.
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: TASK_MANAGER_ACCOUNT_ID, translate: mockTranslate}));
    });
});
