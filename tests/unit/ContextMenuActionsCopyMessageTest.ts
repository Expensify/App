import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';

import CONST from '@src/CONST';

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

jest.mock('@libs/Clipboard', () => ({
    __esModule: true,
    default: {
        canSetHtml: jest.fn(),
        setString: jest.fn(),
        setHtml: jest.fn(),
    },
}));

jest.mock('@libs/Clipboard/getClipboardText', () => ({
    __esModule: true,
    default: jest.fn(),
}));

const mockClipboard = Clipboard as {
    canSetHtml: jest.Mock;
    setString: jest.Mock;
    setHtml: jest.Mock;
};
const mockGetClipboardText = getClipboardText as jest.Mock;

type ContextMenuAction = {
    sentryLabel?: string;
    onPress?: (closePopover: boolean, payload: Record<string, unknown>) => void;
};

const {default: ContextMenuActions} = require('@pages/inbox/report/ContextMenu/ContextMenuActions') as {default: ContextMenuAction[]};

const copyMessageAction = ContextMenuActions.find((action) => action.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.COPY_MESSAGE);

const createPayload = (selection: string): Record<string, unknown> => ({
    reportAction: {
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        message: [{html: selection}],
    },
    selection,
    report: {},
    originalReport: {},
    getLocalDateFromDatetime: jest.fn(),
    policyTags: {},
    translate: (translateKey: string) => translateKey,
    formatPhoneNumber,
    currentUserPersonalDetails: {
        accountID: 1,
        login: 'user@expensify.com',
        email: 'user@expensify.com',
    },
});

const createReportActionPayload = (reportAction: Record<string, unknown>): Record<string, unknown> => ({
    reportAction,
    selection: '',
    report: {},
    originalReport: {},
    getLocalDateFromDatetime: jest.fn(),
    policyTags: {},
    translate: (translateKey: string) => translateKey,
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
        mockClipboard.canSetHtml.mockReturnValue(false);
        mockGetClipboardText.mockReturnValue('Expensify');

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(false, createPayload(selection));

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockClipboard.setString).toHaveBeenCalledWith('Expensify');
        expect(mockClipboard.setHtml).not.toHaveBeenCalled();
    });

    it('uses html clipboard path when html clipboard is available', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockClipboard.canSetHtml.mockReturnValue(true);
        mockGetClipboardText.mockReturnValue('Expensify');

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(false, createPayload(selection));

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockClipboard.setHtml).toHaveBeenCalledWith(selection, 'Expensify');
        expect(mockClipboard.setString).not.toHaveBeenCalled();
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
        mockClipboard.canSetHtml.mockReturnValue(false);
        mockGetClipboardText.mockReturnValue('mocked clipboard text');

        if (!copyMessageAction?.onPress) {
            throw new Error('Copy message context menu action was not found');
        }

        copyMessageAction.onPress(
            false,
            createReportActionPayload({
                actionName,
                message: [{html: ''}],
                originalMessage,
            }),
        );

        expect(mockGetClipboardText).toHaveBeenCalledWith(expectedTranslationKey);
        expect(mockClipboard.setString).toHaveBeenCalledWith('mocked clipboard text');
    });
});
