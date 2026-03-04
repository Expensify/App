import Clipboard from '@libs/Clipboard';
import getClipboardText from '@libs/Clipboard/getClipboardText';
import {copyMessageToClipboard} from '@pages/inbox/report/ContextMenu/actions/copyMessageAction';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

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

const createParams = (selection: string) => ({
    reportAction: {
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        message: [{html: selection}],
    } as unknown as ReportAction,
    transaction: undefined,
    selection,
    report: undefined,
    card: undefined,
    originalReport: undefined,
    isHarvestReport: false,
    isTryNewDotNVPDismissed: false,
    movedFromReport: undefined,
    movedToReport: undefined,
    childReport: undefined,
    policy: undefined,
    getLocalDateFromDatetime: jest.fn(),
    policyTags: undefined,
    translate: ((translateKey: string) => translateKey) as unknown as Parameters<typeof copyMessageToClipboard>[0]['translate'],
    harvestReport: undefined,
    currentUserPersonalDetails: {
        accountID: 1,
        login: 'user@expensify.com',
        email: 'user@expensify.com',
    } as unknown as Parameters<typeof copyMessageToClipboard>[0]['currentUserPersonalDetails'],
});

describe('ContextMenuActions copy message', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses plain text clipboard path when html clipboard is unavailable', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockClipboard.canSetHtml.mockReturnValue(false);
        mockGetClipboardText.mockReturnValue('Expensify');

        copyMessageToClipboard(createParams(selection));

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockClipboard.setString).toHaveBeenCalledWith('Expensify');
        expect(mockClipboard.setHtml).not.toHaveBeenCalled();
    });

    it('uses html clipboard path when html clipboard is available', () => {
        const selection = '<a href="https://expensify.com">Expensify</a>';
        mockClipboard.canSetHtml.mockReturnValue(true);
        mockGetClipboardText.mockReturnValue('Expensify');

        copyMessageToClipboard(createParams(selection));

        expect(mockGetClipboardText).toHaveBeenCalledWith(selection);
        expect(mockClipboard.setHtml).toHaveBeenCalledWith(selection, 'Expensify');
        expect(mockClipboard.setString).not.toHaveBeenCalled();
    });
});
