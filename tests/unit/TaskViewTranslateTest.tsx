import {fireEvent, render, screen} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import TaskView from '@components/ReportActionItem/TaskView';

import * as ModalActions from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameForParticipant, isOpenTaskReport} from '@libs/ReportUtils';

import * as TaskActions from '@userActions/Task';

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
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn(), getActiveRoute: () => ''}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => (route: string) => route);

jest.mock('@hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: () => ({didScreenTransitionEnd: true}),
}));

jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<{isOpenTaskReport: typeof isOpenTaskReport}>('@libs/ReportUtils');
    return {
        ...actual,
        __esModule: true,
        getDisplayNameForParticipant: jest.fn(() => 'SPY_NAME'),
        isOpenTaskReport: jest.fn(actual.isOpenTaskReport),
    };
});

const mockGetDisplayNameForParticipant = jest.mocked(getDisplayNameForParticipant);

const TASK_MANAGER_ACCOUNT_ID = 616161;

describe('TaskView', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        jest.mocked(isOpenTaskReport).mockReturnValue(true);
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe.each([false, true])('assignee assigned=%s', (hasAssignee) => {
        it.each([
            [true, true],
            [true, false],
            [false, true],
            [false, false],
        ])('modifiable=%s open=%s only enables editable rows without dimming', async (isModifiable, isOpen) => {
            // Given every combination of task edit permission and open/completed state.
            jest.spyOn(TaskActions, 'canModifyTask').mockReturnValue(isModifiable);
            jest.spyOn(TaskActions, 'canActionTask').mockReturnValue(false);
            jest.mocked(isOpenTaskReport).mockReturnValue(isOpen);
            const taskReport: Report = {...createRegularTaskReport(1, TASK_MANAGER_ACCOUNT_ID), managerID: hasAssignee ? TASK_MANAGER_ACCOUNT_ID : undefined};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
            await waitForBatchedUpdates();

            // When the assigned UserPill or empty field row is rendered and pressed.
            render(
                <OnyxListItemProvider>
                    <TaskView
                        report={taskReport}
                        parentReport={undefined}
                        action={undefined}
                    />
                </OnyxListItemProvider>,
            );
            const assigneeRoot = screen.UNSAFE_getAllByType(MenuItem.Root).find((root) => root.props.sentryLabel === CONST.SENTRY_LABEL.TASK.VIEW_ASSIGNEE);
            if (!assigneeRoot) {
                throw new Error('Missing task assignee row');
            }
            fireEvent.press(assigneeRoot, {nativeEvent: {}});
            await waitForBatchedUpdates();

            // Then only editable tasks have an action/chevron; no variant receives disabled opacity.
            const isEditable = isModifiable && isOpen;
            expect(assigneeRoot.props.isDisabled).toBeUndefined();
            expect(!!assigneeRoot.props.onPress).toBe(isEditable);
            expect(assigneeRoot.findAll((node) => node.type === MenuItem.Chevron)).toHaveLength(isEditable ? 1 : 0);
            expect(Navigation.navigate).toHaveBeenCalledTimes(isEditable ? 1 : 0);
        });
    });

    it.each([false, true])('retains the title click target across authentication when anonymous=%s', async (isAnonymous) => {
        // Given an editable task and a click target that is valid only during event dispatch
        jest.spyOn(TaskActions, 'canModifyTask').mockReturnValue(true);
        jest.spyOn(TaskActions, 'canActionTask').mockReturnValue(false);
        const closeModal = jest.spyOn(ModalActions, 'close').mockImplementation(() => {});
        await Onyx.set(ONYXKEYS.SESSION, {authTokenType: isAnonymous ? CONST.AUTH_TOKEN_TYPES.ANONYMOUS : undefined});
        const taskReport = createRegularTaskReport(1, TASK_MANAGER_ACCOUNT_ID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
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
        const title = screen.UNSAFE_getAllByType(PressableWithSecondaryInteraction).find((node) => node.props.sentryLabel === CONST.SENTRY_LABEL.TASK.VIEW_TITLE);
        if (!title) {
            throw new Error('Missing task title');
        }
        const blur = jest.fn();
        const event = {type: 'click', currentTarget: {blur} as {blur: () => void} | null};

        // When the event target is cleared before the asynchronous session read resumes
        fireEvent.press(title, event);
        expect(blur).not.toHaveBeenCalled();
        event.currentTarget = null;
        await waitForBatchedUpdates();

        // Then authentication still gates both blurring the captured target and navigation
        expect(blur).toHaveBeenCalledTimes(isAnonymous ? 0 : 1);
        expect(Navigation.navigate).toHaveBeenCalledTimes(isAnonymous ? 0 : 1);
        expect(closeModal).toHaveBeenCalledTimes(isAnonymous ? 1 : 0);
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
        expect(mockGetDisplayNameForParticipant).toHaveBeenCalledWith(expect.objectContaining({accountID: TASK_MANAGER_ACCOUNT_ID, hiddenTranslation: 'common.hidden'}));
    });
});
