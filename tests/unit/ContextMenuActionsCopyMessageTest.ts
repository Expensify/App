import type Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import type {CanSetHtml} from '@libs/Clipboard/types';

import type * as ContextMenuActionsModule from '@pages/inbox/report/ContextMenu/ContextMenuActions';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';

import createMock from '../utils/createMock';
import {formatPhoneNumber} from '../utils/TestHelper';

jest.mock(
    'expo-web-browser',
    () => ({
        openAuthSessionAsync: jest.fn(),
    }),
    {virtual: true},
);

jest.mock('@components/Reactions/MiniQuickEmojiReactions', () => 'MiniQuickEmojiReactions');
jest.mock('@components/Reactions/QuickEmojiReactions', () => 'QuickEmojiReactions');

const mockCanSetHtml = jest.fn<ReturnType<Extract<CanSetHtml, () => boolean>>, Parameters<typeof Clipboard.canSetHtml>>();
const mockSetString = jest.fn<ReturnType<typeof Clipboard.setString>, Parameters<typeof Clipboard.setString>>();
const mockSetHtml = jest.fn<ReturnType<typeof Clipboard.setHtml>, Parameters<typeof Clipboard.setHtml>>();

jest.mock('@libs/Clipboard', () => ({
    __esModule: true,
    default: {
        canSetHtml: mockCanSetHtml,
        setString: mockSetString,
        setHtml: mockSetHtml,
    },
}));

jest.mock('@libs/Clipboard/getClipboardText', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockGetClipboardText = jest.mocked(getClipboardText);

const {default: ContextMenuActions} = jest.requireActual<typeof ContextMenuActionsModule>('@pages/inbox/report/ContextMenu/ContextMenuActions');

const copyMessageAction = ContextMenuActions.find((action) => 'sentryLabel' in action && action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE);
if (!copyMessageAction || !('onPress' in copyMessageAction)) {
    throw new Error('Copy message context menu action was not found');
}
type CopyMessagePayload = Parameters<typeof copyMessageAction.onPress>[1];

const createPayload = (selection: string): CopyMessagePayload =>
    createMock<CopyMessagePayload>({
        reportAction: {
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            message: [{html: selection}],
        },
        selection,
        report: {},
        originalReport: {},
        getLocalDateFromDatetime: jest.fn(),
        policyTags: {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
        translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path,
        formatPhoneNumber,
        currentUserPersonalDetails: {
            accountID: 1,
            login: 'user@expensify.com',
            email: 'user@expensify.com',
        },
    });

const createReportActionPayload = (reportAction: CopyMessagePayload['reportAction']): CopyMessagePayload =>
    createMock<CopyMessagePayload>({
        reportAction,
        selection: '',
        report: {},
        originalReport: {},
        getLocalDateFromDatetime: jest.fn(),
        policyTags: {},
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
        translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path,
        currentUserPersonalDetails: {
            accountID: 1,
            login: 'user@expensify.com',
            email: 'user@expensify.com',
        },
    });

describe('ContextMenuActions copy message', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses plain text clipboard path when html clipboard is unavailable', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockCanSetHtml.mockReturnValue(false);
        mockGetClipboardText.mockReturnValue('Expensify');

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(false, createPayload(selection));

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockSetString).toHaveBeenCalledWith('Expensify');
        expect(mockSetHtml).not.toHaveBeenCalled();
    });

    it('uses html clipboard path when html clipboard is available', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockCanSetHtml.mockReturnValue(true);
        mockGetClipboardText.mockReturnValue('Expensify');

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(false, createPayload(selection));

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockSetHtml).toHaveBeenCalledWith(selection, 'Expensify');
        expect(mockSetString).not.toHaveBeenCalled();
    });

    it.each([
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_AGENT_RULE,
            {ruleTitle: 'Receipts required', prompt: 'Flag any expense over $25 that is missing a receipt'},
            'workspaceActions.agentRule.added',
        ],
        [
            CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AGENT_RULE,
            {ruleTitle: 'Receipts required', prompt: 'Reject any expense that includes alcohol'},
            'workspaceActions.agentRule.updated',
        ],
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_AGENT_RULE, {ruleTitle: 'Receipts required'}, 'workspaceActions.agentRule.deleted'],
    ])('copies the localized message for a %s action', (actionName, originalMessage, expectedTranslationKey) => {
        mockCanSetHtml.mockReturnValue(false);
        mockGetClipboardText.mockReturnValue('mocked clipboard text');

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName,
                    message: [{html: ''}],
                    originalMessage,
                }),
            ),
        );

        expect(mockGetClipboardText).toHaveBeenCalledWith(expectedTranslationKey);
        expect(mockSetString).toHaveBeenCalledWith('mocked clipboard text');
    });

    it('copies the localized message for a category update action', () => {
        mockCanSetHtml.mockReturnValue(false);

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload(
                createMock<CopyMessagePayload['reportAction']>({
                    actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY,
                    message: [{html: ''}],
                    originalMessage: {categoryName: 'Advertising', updatedField: 'areAttendeesRequired', oldValue: '', newValue: true},
                }),
            ),
        );

        expect(mockSetString).toHaveBeenCalledWith('workspaceActions.updateAreAttendeesRequired');
    });
});
