import {act, renderHook} from '@testing-library/react-native';

import type {ComposerRef} from '@components/Composer/types';

import {editReportComment} from '@libs/actions/Report';

import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useEditMessage from '@pages/inbox/report/ReportActionCompose/useEditMessage';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import * as LHNTestUtils from '../../utils/LHNTestUtils';
import {mergePersonalDetailsList, setPersonalDetailsList} from '../../utils/PersonalDetailsTestUtils';
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

    it('saves with the teammate logins short mentions resolve to and the names of only the rooms and users the original message mentions', async () => {
        // Given an original message that mentions one room and Alice by ID, plus another room and Bob that it does not mention
        const mentionedReportID = '111';
        const aliceAccountID = 1001;
        const bobAccountID = 1002;
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mentionedReportID}`, {reportID: mentionedReportID, reportName: '#mentioned'});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}222`, {reportID: '222', reportName: '#other'});
            await setPersonalDetailsList({
                [aliceAccountID]: {accountID: aliceAccountID, login: 'alice@test.com'},
                [bobAccountID]: {accountID: bobAccountID, login: 'bob@test.com'},
            });
        });
        const reportAction = LHNTestUtils.getFakeReportAction();
        const html = `<mention-report reportID="${mentionedReportID}"/> <mention-user accountID="${aliceAccountID}"/>`;
        const {hook} = renderUseEditMessage({
            reportAction: {...reportAction, message: [{type: 'COMMENT', text: '#mentioned @alice@test.com', html}]},
        });

        // When the edit is saved
        act(() => hook.result.current.publishDraft('Updated message'));

        // Then short mentions can resolve to the stored teammate logins, while the unchanged check gets only the mentioned room and user,
        // which is all it needs to turn the original HTML back into markdown
        const [, , , , , availableMentionLogins, , , reportIDToName, accountIDToName] = mockEditReportComment.mock.calls.at(0) ?? [];
        expect(availableMentionLogins).toEqual(['alice@test.com', 'bob@test.com']);
        expect(reportIDToName).toEqual({[mentionedReportID]: '#mentioned'});
        expect(accountIDToName).toEqual({[aliceAccountID]: 'alice@test.com'});
    });

    it('resolves short mentions against a login added after the editor opened', async () => {
        // Given an editor opened before a new teammate's personal details arrive
        const {hook} = renderUseEditMessage();
        await waitForBatchedUpdates();

        // When the teammate's personal details are stored and the edit is saved
        await act(async () => {
            await TestHelper.setPersonalDetails('newcomer@test.com', 7);
        });
        act(() => hook.result.current.publishDraft('Updated message'));

        // Then the save gets the new login, so a short mention of the teammate resolves
        const [, , , , , availableMentionLogins] = mockEditReportComment.mock.calls.at(0) ?? [];
        expect(availableMentionLogins).toContain('newcomer@test.com');
    });

    it('does not re-render when an unrelated report or a display name changes', async () => {
        // Given an edit of a message that mentions no rooms or users, with personal details already loaded
        const loadedAccountID = 4;
        await TestHelper.setPersonalDetails('loaded@test.com', loadedAccountID);
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

        // When another report is written and a user changes their display name, which keeps every login the same
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}999`, {reportID: '999', reportName: '#unrelated', lastReadTime: '2026-11-10 10:00:00.000'});
            await mergePersonalDetailsList({[loadedAccountID]: {displayName: 'Renamed'}});
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
