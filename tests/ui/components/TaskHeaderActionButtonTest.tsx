import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import TaskHeaderActionButton from '@components/TaskHeaderActionButton';

import {completeTask} from '@userActions/Task';
import type * as TaskType from '@userActions/Task';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createRandomReport} from '../../utils/collections/reports';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Task', () => ({
    ...jest.requireActual<typeof TaskType>('@userActions/Task'),
    canActionTask: jest.fn(() => true),
    completeTask: jest.fn(),
    reopenTask: jest.fn(),
}));

describe('TaskHeaderActionButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('should complete the task with the full stored report', async () => {
        // Given an open task report stored with a read position, because completing the task restores lastReadTime from
        // that report if the request fails, and the header's own report projection drops it
        const taskReport: Report = {
            ...createRandomReport(1, undefined),
            type: CONST.REPORT.TYPE.TASK,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
            lastReadTime: '2026-10-08 12:00:00.000',
        };
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
        await waitForBatchedUpdates();
        render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <TaskHeaderActionButton reportID={taskReport.reportID} />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();

        // When the user marks the task as complete
        fireEvent.press(screen.getByText(translateLocal('task.markAsComplete')));

        // Then the action gets the stored report, including the read position it needs for its failure data
        expect(jest.mocked(completeTask).mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({reportID: taskReport.reportID, lastReadTime: taskReport.lastReadTime}));
    });
});
