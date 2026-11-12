/** Exercises optional clear values at the actual submission hook. */
import {renderHook} from '@testing-library/react-native';

import type * as UseSidePanelActionsModule from '@hooks/useSidePanelActions';

import type * as ReportModule from '@libs/actions/Report';
import {addAttachmentWithComment, addComment} from '@libs/actions/Report';
import {createTaskFromMarkdown} from '@libs/actions/Task';
import type * as ActiveSpansModule from '@libs/telemetry/activeSpans';

import type * as ComposerContextModule from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import useComposerSubmit from '@pages/inbox/report/ReportActionCompose/useComposerSubmit';

import CONST from '@src/CONST';

import createMock from '../utils/createMock';

const mockPublishDraft = jest.fn<void, [string]>();
const mockClearComposer = jest.fn<void, []>();
const mockMeta = createMock<ReturnType<typeof ComposerContextModule.useComposerMeta>>({composerRef: {current: null}, attachmentFileRef: {current: null}, textRef: {current: ''}});
const mockEditState = createMock<ReturnType<typeof ComposerContextModule.useComposerEditState>>({
    isEditingInComposer: false,
    didResetComposerHeightWhileEditing: false,
    effectiveDraft: '',
    editingState: CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.OFF,
});

jest.mock('@hooks/useAncestors', () => () => []);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1}));
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('@hooks/useIsInSidePanel', () => () => false);
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => false}));
jest.mock('@hooks/useReportIsArchived', () => () => false);
jest.mock('@hooks/useSidePanelActions', () => () => ({
    openSidePanel: jest.fn<
        ReturnType<ReturnType<typeof UseSidePanelActionsModule.default>['openSidePanel']>,
        Parameters<ReturnType<typeof UseSidePanelActionsModule.default>['openSidePanel']>
    >(),
}));
jest.mock('@react-navigation/native', () => ({useRoute: () => ({name: 'Report'})}));
jest.mock('@pages/inbox/ActionListContext', () => ({useActionListContext: () => ({scrollOffsetRef: {current: 100000}})}));
jest.mock('@pages/inbox/report/ReportActionCompose/ComposerContext', () => ({
    useComposerMeta: () => mockMeta,
    useComposerActions: () => ({clearComposer: mockClearComposer}),
    useComposerSendState: () => ({isSendDisabled: false}),
    useComposerEditState: () => mockEditState,
    useComposerEditActions: () => ({
        publishDraft: mockPublishDraft,
        setDidResetComposerHeightWhileEditing: jest.fn<
            ReturnType<ReturnType<typeof ComposerContextModule.useComposerEditActions>['setDidResetComposerHeightWhileEditing']>,
            Parameters<ReturnType<typeof ComposerContextModule.useComposerEditActions>['setDidResetComposerHeightWhileEditing']>
        >(),
    }),
}));
jest.mock('@pages/inbox/report/ReportActionCompose/useComposerReportData', () => () => ({report: undefined, effectiveTransactionThreadReportID: undefined}));
jest.mock('@pages/inbox/report/ReportActionCompose/useSidePanelContext', () => () => undefined);
jest.mock('@libs/actions/Report', () => ({
    addAttachmentWithComment: jest.fn<ReturnType<typeof ReportModule.addAttachmentWithComment>, Parameters<typeof ReportModule.addAttachmentWithComment>>(),
    addComment: jest.fn<ReturnType<typeof ReportModule.addComment>, Parameters<typeof ReportModule.addComment>>(),
    clearAgentZeroProcessingIndicator: jest.fn<ReturnType<typeof ReportModule.clearAgentZeroProcessingIndicator>, Parameters<typeof ReportModule.clearAgentZeroProcessingIndicator>>(),
    setIsComposerFullSize: jest.fn<ReturnType<typeof ReportModule.setIsComposerFullSize>, Parameters<typeof ReportModule.setIsComposerFullSize>>(),
}));
jest.mock('@libs/actions/Task', () => ({createTaskFromMarkdown: jest.fn<ReturnType<typeof createTaskFromMarkdown>, Parameters<typeof createTaskFromMarkdown>>(() => false)}));
jest.mock('@libs/ReportActionsUtils', () => ({getAllReportActions: () => []}));
jest.mock('@libs/ReportUtils', () => ({isConciergeChatReport: () => false, canUserPerformWriteAction: () => true, generateReportID: () => '2'}));
jest.mock('@libs/NumberUtils', () => ({rand64: () => '3'}));
jest.mock('@libs/telemetry/activeSpans', () => ({
    startSpan: jest.fn<ReturnType<typeof ActiveSpansModule.startSpan>, Parameters<typeof ActiveSpansModule.startSpan>>(),
}));
jest.mock('@libs/telemetry/getSendMessageListWeight', () => () => ({reportActionCount: 0, moneyRequestPreviewCount: 0}));
jest.mock('@libs/telemetry/getSendMessageSource', () => () => 'report');
jest.mock('@libs/telemetry/sendMessageSpans', () => ({getSendMessageVisibleSpanID: () => 'span'}));

describe('useComposerSubmit clear values', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMeta.attachmentFileRef.current = null;
        mockEditState.isEditingInComposer = false;
    });

    it.each(['comment', 'edit', 'attachment'] as const)('handles normalized empty input in the %s branch', (submission) => {
        // Given web Composer normalizes an omitted live-markdown value to an empty string.
        mockEditState.isEditingInComposer = submission === 'edit';
        if (submission === 'attachment') {
            mockMeta.attachmentFileRef.current = {uri: 'file:///photo.png', name: 'photo.png', type: 'image/png'};
        }
        const {result} = renderHook(() => useComposerSubmit('1'));

        // When the normalized clear value reaches the actual submission hook.
        expect(() => result.current.validateAndSubmitDraft('')).not.toThrow();

        // Then empty comments are skipped, while edits and attachments retain their existing empty-text behavior.
        expect(addComment).not.toHaveBeenCalled();
        expect(createTaskFromMarkdown).not.toHaveBeenCalled();
        expect(mockClearComposer).not.toHaveBeenCalled();
        if (submission === 'edit') {
            expect(mockPublishDraft).toHaveBeenCalledWith('');
            expect(addAttachmentWithComment).not.toHaveBeenCalled();
        } else if (submission === 'attachment') {
            expect(addAttachmentWithComment).toHaveBeenCalledWith(expect.objectContaining({text: ''}));
            expect(mockPublishDraft).not.toHaveBeenCalled();
        } else {
            expect(mockPublishDraft).not.toHaveBeenCalled();
            expect(addAttachmentWithComment).not.toHaveBeenCalled();
        }
        expect(mockMeta.attachmentFileRef.current).toBeNull();
    });

    it('retains trimmed strings in the edit, comment and attachment branches', () => {
        // Given each existing valid branch receives an actual string.
        const {result, rerender} = renderHook(() => useComposerSubmit('1'));

        // When ordinary strings pass through the same submission interface.
        result.current.validateAndSubmitDraft(' hello ');
        mockEditState.isEditingInComposer = true;
        rerender({});
        result.current.validateAndSubmitDraft(' edited ');
        mockMeta.attachmentFileRef.current = {uri: 'file:///photo.png', name: 'photo.png', type: 'image/png'};
        result.current.validateAndSubmitDraft(' attached ');

        // Then existing processing retains trimming and branch ownership.
        expect(addComment).toHaveBeenCalledWith(expect.objectContaining({text: 'hello'}));
        expect(mockPublishDraft).toHaveBeenCalledWith('edited');
        expect(addAttachmentWithComment).toHaveBeenCalledWith(expect.objectContaining({text: 'attached'}));
        expect(mockMeta.attachmentFileRef.current).toBeNull();
    });
});
