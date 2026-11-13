import {act, renderHook} from '@testing-library/react-native';

import type {ComposerRef} from '@components/Composer/types';

import {editReportComment} from '@libs/actions/Report';

import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useEditMessage from '@pages/inbox/report/ReportActionCompose/useEditMessage';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import * as LHNTestUtils from '../../utils/LHNTestUtils';
import * as TestHelper from '../../utils/TestHelper';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/actions/Report', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/actions/Report');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        editReportComment: jest.fn(),
        clearAllReportActionDrafts: jest.fn(),
    };
});

jest.mock('@pages/inbox/report/ReportActionEditMessageContext', () => ({
    useReportActionActiveEditActions: () => ({
        submitEdit: jest.fn(),
        stopEditing: jest.fn(),
    }),
}));

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@pages/inbox/report/ContextMenu/ReportActionContextMenu');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        showDeleteModal: jest.fn(),
        isActiveReportAction: jest.fn(() => false),
    };
});

jest.mock('@hooks/useAncestors', () => ({
    __esModule: true,
    default: () => [],
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({email: 'user@test.com'}),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => false,
}));

const mockScrollToBottom = jest.fn();
jest.mock('@hooks/useReportScrollManager', () => ({
    __esModule: true,
    default: () => ({scrollToBottom: mockScrollToBottom}),
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/ReportUtils');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        getOriginalReportID: () => undefined,
    };
});

const mockEditReportComment = jest.mocked(editReportComment);
const mockShowDeleteModal = jest.mocked(showDeleteModal);

type HookProps = Parameters<typeof useEditMessage>[0];

type DebouncedValidator = HookProps['debouncedCommentMaxLengthValidation'];

function makeDebouncedValidator({flushResult}: {flushResult: boolean}): DebouncedValidator {
    const validator = jest.fn<boolean, [string]>(() => flushResult);
    return Object.assign(validator, {
        flush: jest.fn(() => flushResult),
        cancel: jest.fn(),
    });
}

describe('useEditMessage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    function renderUseEditMessage(overrides?: Partial<HookProps>) {
        const report = LHNTestUtils.getFakeReport();
        const reportAction = LHNTestUtils.getFakeReportAction();

        const props: HookProps = {
            reportID: report.reportID,
            originalReportID: report.reportID,
            reportAction,
            debouncedCommentMaxLengthValidation: makeDebouncedValidator({flushResult: true}),
            composerRef: {current: createMock<ComposerRef>({blur: jest.fn()})},
            ...overrides,
        };
        const hook = renderHook(() => useEditMessage(props));
        return {hook, props};
    }

    it('should not publish when validation flush fails', async () => {
        const {hook} = renderUseEditMessage({
            debouncedCommentMaxLengthValidation: makeDebouncedValidator({flushResult: false}),
        });

        act(() => {
            hook.result.current.publishDraft('Hello');
        });

        expect(mockEditReportComment).toHaveBeenCalledTimes(0);
        expect(mockShowDeleteModal).toHaveBeenCalledTimes(0);
    });

    it('should open delete modal when publishing an empty (trimmed) message', async () => {
        const {hook, props} = renderUseEditMessage();

        act(() => {
            hook.result.current.publishDraft('   ');
        });

        expect(mockEditReportComment).toHaveBeenCalledTimes(0);
        expect(mockShowDeleteModal).toHaveBeenCalledTimes(1);

        const args = mockShowDeleteModal.mock.calls.at(0);
        expect(args?.[1]?.reportActionID).toBe(props.reportAction?.reportActionID);
    });

    it('scrolls to the bottom after deleting the newest message draft without a list-specific callback', () => {
        // Given the newest message uses the list registered with the scroll manager.
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: true});

        // When deleting the draft closes its editor.
        act(() => {
            hook.result.current.publishDraft('   ');
        });
        act(() => {
            mockShowDeleteModal.mock.calls.at(0)?.[3]?.();
        });

        // Then the list receives the request immediately and owns its layout scheduling.
        expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
    });

    it('uses the list-specific scroll after deleting the newest message draft', () => {
        // Given the list supplies its own edit-scroll request handler.
        const scrollToLastMessage = jest.fn();
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: true, scrollToLastMessage});

        // When deleting the draft closes its editor.
        act(() => {
            hook.result.current.publishDraft('   ');
        });
        act(() => {
            mockShowDeleteModal.mock.calls.at(0)?.[3]?.();
        });

        // Then scheduling belongs to that list instead of a callback on the unmounting editor.
        expect(scrollToLastMessage).toHaveBeenCalledTimes(1);
        expect(mockScrollToBottom).not.toHaveBeenCalled();
    });

    it('requests the newest action after saving without scheduling an editor frame', () => {
        // Given a draft on the newest action.
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: true});

        // When the edit is submitted and the editor closes.
        act(() => hook.result.current.publishDraft('Updated message'));
        expect(mockEditReportComment).toHaveBeenCalledTimes(1);

        // Then the list already owns the scroll request before the editor can unmount.
        expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
    });

    it('saves with the names of only the rooms the original message mentions', async () => {
        // Given an original message that mentions one room, and another room it does not mention
        const mentionedReportID = '111';
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mentionedReportID}`, {reportID: mentionedReportID, reportName: '#mentioned'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}222`, {reportID: '222', reportName: '#other'});
        });
        const reportAction = LHNTestUtils.getFakeReportAction();
        const {hook} = renderUseEditMessage({
            reportAction: {...reportAction, message: [{type: 'COMMENT', text: '#mentioned', html: `<mention-report reportID="${mentionedReportID}"/>`}]},
        });

        // When the edit is saved
        act(() => hook.result.current.publishDraft('Updated message'));

        // Then the unchanged check gets the mentioned room, which is all it needs to turn the original HTML back into markdown
        expect(mockEditReportComment.mock.calls.at(0)?.[7]).toEqual({[mentionedReportID]: '#mentioned'});
    });

    it('does not re-render when an unrelated report or personal details change', async () => {
        // Given an edit of a message that mentions no rooms
        let renderCount = 0;
        const report = LHNTestUtils.getFakeReport();
        const props: HookProps = {
            reportID: report.reportID,
            originalReportID: report.reportID,
            reportAction: LHNTestUtils.getFakeReportAction(),
            debouncedCommentMaxLengthValidation: makeDebouncedValidator({flushResult: true}),
            composerRef: {current: createMock<ComposerRef>({blur: jest.fn()})},
        };
        renderHook(() => {
            renderCount++;
            return useEditMessage(props);
        });
        await waitForBatchedUpdates();
        const renderCountBefore = renderCount;

        // When another report and the personal details list are written
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}999`, {reportID: '999', reportName: '#unrelated', lastReadTime: '2026-11-10 10:00:00.000'});
            await TestHelper.setPersonalDetails('someone@test.com', 5);
        });

        // Then publishDraft keeps its inputs, so the composer reading it from context does not re-render
        expect(renderCount).toBe(renderCountBefore);
    });

    it('does not scroll after deleting a non-newest message draft', () => {
        const scrollToLastMessage = jest.fn();
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: false, scrollToLastMessage});

        act(() => {
            hook.result.current.deleteDraft();
        });

        expect(scrollToLastMessage).not.toHaveBeenCalled();
        expect(mockScrollToBottom).not.toHaveBeenCalled();
    });
});
