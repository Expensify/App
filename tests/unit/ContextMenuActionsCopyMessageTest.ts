import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import CONST from '@src/CONST';

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        canSetHtml: jest.fn(),
        setString: jest.fn(),
        setHtml: jest.fn(),
    },
}));

jest.mock('@libs/Clipboard/getClipboardText', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
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
});
