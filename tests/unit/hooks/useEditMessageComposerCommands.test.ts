/** Covers the edit hook's delete-modal blur and deferred cancellation focus. */
import {act, renderHook} from '@testing-library/react-native';

import type * as UseReportScrollManagerModule from '@hooks/useReportScrollManager';

import type * as ReportModule from '@libs/actions/Report';

import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useEditMessage from '@pages/inbox/report/ReportActionCompose/useEditMessage';

import {getFakeReportAction} from '../../utils/LHNTestUtils';

type EditMessageProps = Parameters<typeof useEditMessage>[0];

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({email: 'user@test.com'}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePersonalDetails', () => ({useAllPersonalDetails: () => [undefined]}));
jest.mock('@hooks/useReportIDToNameMap', () => () => ({}));
jest.mock('@hooks/useReportIsArchived', () => () => false);
jest.mock('@hooks/useReportScrollManager', () => () => ({
    scrollToIndex: jest.fn<
        ReturnType<ReturnType<typeof UseReportScrollManagerModule.default>['scrollToIndex']>,
        Parameters<ReturnType<typeof UseReportScrollManagerModule.default>['scrollToIndex']>
    >(),
}));
jest.mock('@libs/actions/Report', () => ({
    clearAllReportActionDrafts: jest.fn<ReturnType<typeof ReportModule.clearAllReportActionDrafts>, Parameters<typeof ReportModule.clearAllReportActionDrafts>>(),
    editReportComment: jest.fn<ReturnType<typeof ReportModule.editReportComment>, Parameters<typeof ReportModule.editReportComment>>(),
}));
jest.mock('@pages/inbox/report/ReportActionEditMessageContext', () => ({useReportActionActiveEditActions: () => ({stopEditing: jest.fn<void, []>(), submitEdit: jest.fn<void, []>()})}));
jest.mock('@pages/inbox/report/useDraftMessageVideoAttributeCache', () => ({draftMessageVideoAttributeCache: new Map()}));
jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({showDeleteModal: jest.fn<ReturnType<typeof showDeleteModal>, Parameters<typeof showDeleteModal>>()}));

function renderEditCommands(composerRef: EditMessageProps['composerRef']) {
    // The hook's empty-draft branch only needs validation flush and a real report-action identity.
    const debouncedCommentMaxLengthValidation = Object.assign(
        jest.fn<boolean, [string]>(() => true),
        {flush: () => true, cancel: jest.fn<void, []>()},
    );
    return renderHook(() => useEditMessage({reportID: '1', originalReportID: undefined, reportAction: getFakeReportAction(), debouncedCommentMaxLengthValidation, composerRef}));
}

describe('useEditMessage composer commands', () => {
    beforeEach(() => jest.clearAllMocks());
    afterEach(() => jest.restoreAllMocks());

    it('blurs before the modal and focuses the replacement ref only when the idle callback executes', () => {
        // Given a command-only composer handle and a later replacement while the modal is open.
        const first = {blur: jest.fn<void, []>(), focus: jest.fn<void, []>()} satisfies NonNullable<EditMessageProps['composerRef']['current']>;
        const replacement = {blur: jest.fn<void, []>(), focus: jest.fn<void, []>()} satisfies NonNullable<EditMessageProps['composerRef']['current']>;
        const composerRef: EditMessageProps['composerRef'] = {current: first};
        const idle = jest.spyOn(globalThis, 'requestIdleCallback').mockImplementation(() => 1);
        const {result} = renderEditCommands(composerRef);

        // When empty-message deletion opens a modal and cancellation schedules focus.
        act(() => result.current.publishDraft('   '));
        const modalCall = jest.mocked(showDeleteModal).mock.calls.at(0);
        expect(modalCall).toBeDefined();
        if (!modalCall) {
            throw new Error('Expected delete modal');
        }
        const cancel = modalCall[4];
        if (!cancel) {
            throw new Error('Expected modal cancellation callback');
        }
        cancel();
        composerRef.current = replacement;

        // Then blur precedes the modal and cancellation does not focus synchronously or capture a stale ref.
        expect(first.blur).toHaveBeenCalledTimes(1);
        const earlierCallOrder1 = first.blur.mock.invocationCallOrder.at(0);
        const laterCallOrder1 = jest.mocked(showDeleteModal).mock.invocationCallOrder.at(0);
        if (earlierCallOrder1 === undefined || laterCallOrder1 === undefined) {
            throw new Error('Expected both invocation order values');
        }
        expect(earlierCallOrder1).toBeLessThan(laterCallOrder1);
        expect(first.focus).not.toHaveBeenCalled();
        expect(replacement.focus).not.toHaveBeenCalled();
        expect(idle).toHaveBeenCalledTimes(1);
        const idleCall = idle.mock.calls.at(0);
        expect(idleCall).toBeDefined();
        if (!idleCall) {
            throw new Error('Expected deferred focus');
        }
        act(() => idleCall[0]({didTimeout: false, timeRemaining: () => 10}));
        expect(replacement.focus).toHaveBeenCalledTimes(1);
        expect(first.focus).not.toHaveBeenCalled();
    });

    it.each([true, false])('retains null-ref no-ops with initial absence %s', (isInitiallyAbsent) => {
        // Given either initial absence or detachment while cancellation is deferred.
        const commands = {blur: jest.fn<void, []>(), focus: jest.fn<void, []>()};
        const composerRef: EditMessageProps['composerRef'] = {current: isInitiallyAbsent ? null : commands};
        const idle = jest.spyOn(globalThis, 'requestIdleCallback').mockImplementation(() => 1);
        const {result} = renderEditCommands(composerRef);

        // When cancellation runs after the composer has detached.
        act(() => result.current.publishDraft(''));
        const modalCall = jest.mocked(showDeleteModal).mock.calls.at(0);
        if (!modalCall) {
            throw new Error('Expected delete modal');
        }
        const cancel = modalCall[4];
        if (!cancel) {
            throw new Error('Expected modal cancellation callback');
        }
        cancel();
        composerRef.current = null;
        const idleCall = idle.mock.calls.at(0);
        if (!idleCall) {
            throw new Error('Expected deferred focus');
        }
        act(() => idleCall[0]({didTimeout: false, timeRemaining: () => 10}));

        // Then modal cancellation tolerates absence and never invokes a detached handle.
        expect(showDeleteModal).toHaveBeenCalledTimes(1);
        expect(commands.blur).toHaveBeenCalledTimes(isInitiallyAbsent ? 0 : 1);
        expect(commands.focus).not.toHaveBeenCalled();
    });
});
