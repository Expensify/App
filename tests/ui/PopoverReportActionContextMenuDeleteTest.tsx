import {act, render, screen} from '@testing-library/react-native';

import type {ConfirmModalProps} from '@components/ConfirmModal';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {deleteReportComment} from '@libs/actions/Report';

import PopoverReportActionContextMenu from '@pages/inbox/report/ContextMenu/PopoverReportActionContextMenu';
import type {ReportActionContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {View} from 'react-native';

import React, {createRef} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockConfirmModalProps: ConfirmModalProps[] = [];

jest.mock('@components/ActionSheetAwareScrollView', () => ({
    Actions: {CLOSE_POPOVER: 'CLOSE_POPOVER'},
    useActionSheetAwareScrollViewActions: () => ({transitionActionSheetState: jest.fn()}),
}));
jest.mock('@components/PopoverWithMeasuredContent', () => () => null);
jest.mock('@pages/inbox/report/ContextMenu/BaseReportActionContextMenu', () => () => null);
jest.mock('@components/ConfirmModal', () => {
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    function MockConfirmModal(props: ConfirmModalProps) {
        mockConfirmModalProps.push(props);
        return <MockView testID="DeleteReportActionConfirmModal" />;
    }
    return MockConfirmModal;
});
jest.mock('@libs/actions/Report', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@libs/actions/Report');
    return {...actual, deleteReportComment: jest.fn()};
});

const REPORT_ID = '1';
const reportAction = {
    reportActionID: '100',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2026-11-03 10:00:00.000',
    message: [{type: 'COMMENT', html: 'Hello', text: 'Hello'}],
} as ReportAction;

function getLatestConfirmModalProps(): ConfirmModalProps {
    const props = mockConfirmModalProps.at(-1);
    if (!props) {
        throw new Error('Expected the delete confirmation to be rendered');
    }
    return props;
}

function renderContextMenu() {
    const ref = createRef<ReportActionContextMenu>();
    render(
        <OnyxListItemProvider>
            <PopoverReportActionContextMenu ref={ref} />
        </OnyxListItemProvider>,
    );
    if (!ref.current) {
        throw new Error('Expected the context menu imperative API');
    }
    return ref.current;
}

describe('PopoverReportActionContextMenu delete confirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockConfirmModalProps.length = 0;
        jest.mocked(deleteReportComment).mockClear();
        await Onyx.clear();
    });

    it('should not mount the delete confirmation until a delete is requested', async () => {
        // Given the context menu that stays mounted for the whole app
        const contextMenu = renderContextMenu();

        // Then the delete confirmation and its Onyx reads are not mounted while nothing is being deleted
        expect(screen.queryByTestId('DeleteReportActionConfirmModal')).toBeNull();

        // When a delete is requested for a comment
        act(() => contextMenu.showDeleteModal(REPORT_ID, reportAction));
        await waitForBatchedUpdatesWithAct();

        // Then the confirmation mounts already visible
        expect(screen.getByTestId('DeleteReportActionConfirmModal')).toBeTruthy();
        expect(getLatestConfirmModalProps().isVisible).toBe(true);
    });

    it('should delete the comment after the confirmation hides and then unmount the confirmation', async () => {
        // Given a delete confirmation shown for a comment, with an onConfirm callback from the caller
        const contextMenu = renderContextMenu();
        const onConfirm = jest.fn();
        act(() => contextMenu.showDeleteModal(REPORT_ID, reportAction, true, onConfirm));
        await waitForBatchedUpdatesWithAct();

        // When the user confirms
        act(() => getLatestConfirmModalProps().onConfirm?.());
        await waitForBatchedUpdatesWithAct();

        // Then the caller is told right away, but the comment is deleted only once the modal finished hiding,
        // so the row does not disappear under the closing modal
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(getLatestConfirmModalProps().isVisible).toBe(false);
        expect(deleteReportComment).not.toHaveBeenCalled();

        // When the modal finishes hiding
        act(() => getLatestConfirmModalProps().onModalHide?.());
        await waitForBatchedUpdatesWithAct();

        // Then the comment is deleted once and the confirmation unmounts, dropping its Onyx reads
        expect(deleteReportComment).toHaveBeenCalledTimes(1);
        expect(jest.mocked(deleteReportComment).mock.calls.at(0)?.at(0)).toEqual(expect.objectContaining({reportAction}));
        expect(screen.queryByTestId('DeleteReportActionConfirmModal')).toBeNull();
    });

    it('should not delete anything when the user cancels', async () => {
        // Given a delete confirmation shown for a comment, with an onCancel callback from the caller
        const contextMenu = renderContextMenu();
        const onCancel = jest.fn();
        act(() => contextMenu.showDeleteModal(REPORT_ID, reportAction, true, undefined, onCancel));
        await waitForBatchedUpdatesWithAct();

        // When the user cancels and the modal finishes hiding
        act(() => getLatestConfirmModalProps().onCancel?.());
        await waitForBatchedUpdatesWithAct();
        act(() => getLatestConfirmModalProps().onModalHide?.());
        await waitForBatchedUpdatesWithAct();

        // Then only the cancel callback runs and the confirmation unmounts
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(deleteReportComment).not.toHaveBeenCalled();
        expect(screen.queryByTestId('DeleteReportActionConfirmModal')).toBeNull();
    });
});
