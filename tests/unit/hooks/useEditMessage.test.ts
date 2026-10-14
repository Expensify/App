import {act, renderHook} from '@testing-library/react-native';

import type {ComposerRef} from '@components/Composer/types';

import {editReportComment} from '@libs/actions/Report';

import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useEditMessage from '@pages/inbox/report/ReportActionCompose/useEditMessage';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import * as LHNTestUtils from '../../utils/LHNTestUtils';

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
    let pendingAnimationFrame: FrameRequestCallback | undefined;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        pendingAnimationFrame = undefined;
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            pendingAnimationFrame = callback;
            return 1;
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    function finishActionLayout() {
        act(() => pendingAnimationFrame?.(0));
    }

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
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: true});

        act(() => {
            hook.result.current.publishDraft('   ');
        });
        act(() => {
            mockShowDeleteModal.mock.calls.at(0)?.[3]?.();
        });

        expect(mockScrollToBottom).not.toHaveBeenCalled();
        finishActionLayout();
        expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
    });

    it('uses the list-specific scroll after deleting the newest message draft', () => {
        const scrollToLastMessage = jest.fn();
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: true, scrollToLastMessage});

        act(() => {
            hook.result.current.publishDraft('   ');
        });
        act(() => {
            mockShowDeleteModal.mock.calls.at(0)?.[3]?.();
        });

        expect(scrollToLastMessage).not.toHaveBeenCalled();
        finishActionLayout();
        expect(scrollToLastMessage).toHaveBeenCalledTimes(1);
        expect(mockScrollToBottom).not.toHaveBeenCalled();
    });

    it('scrolls to the final saved action after the editor layout has been replaced', () => {
        // Given a draft on the newest action.
        const {hook} = renderUseEditMessage({shouldScrollToLastMessage: true});

        // When the edit is submitted, its optimistic update is queued before layout settles.
        act(() => hook.result.current.publishDraft('Updated message'));
        expect(mockEditReportComment).toHaveBeenCalledTimes(1);
        expect(mockScrollToBottom).not.toHaveBeenCalled();

        // Then scrolling runs after the restored action row gets a layout frame.
        finishActionLayout();
        expect(mockScrollToBottom).toHaveBeenCalledTimes(1);
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
