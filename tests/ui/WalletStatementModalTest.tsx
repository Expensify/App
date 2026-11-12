/** Checks that the web statement page only follows links that the statement page inside its own iframe sends. */
import {fireEvent, render} from '@testing-library/react-native';

import type * as WebWalletStatementModal from '@components/WalletStatementModal';
import handleWalletStatementNavigation from '@components/WalletStatementModal/walletNavigationUtils';

import CONST from '@src/CONST';

import React from 'react';

const {default: WalletStatementModal} = jest.requireActual<typeof WebWalletStatementModal>('../../src/components/WalletStatementModal/index.tsx');

jest.mock('@components/WalletStatementModal/walletNavigationUtils', () => jest.fn());
jest.mock('@components/ActivityIndicator', () => () => null);
jest.mock('@hooks/useOnyx', () => () => [undefined, {status: 'loaded'}]);
jest.mock('@hooks/usePersonalDetails', () => ({usePersonalDetailsByIDs: () => [undefined, {status: 'loaded'}]}));
jest.mock('@hooks/useDelegateAccountID', () => () => undefined);
jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {}, fullScreenLoading: {}}));

const STATEMENT_PAGE_URL = 'https://www.expensify.com/statement.php?period=202610';
const STATEMENT_PAGE_ORIGIN = 'https://www.expensify.com';
const OTHER_SITE_ORIGIN = 'https://attacker.example';
const PAY_SOMEONE_MESSAGE = {type: CONST.WALLET.WEB_MESSAGE_TYPE.STATEMENT, url: `https://new.expensify.com/${CONST.WALLET.STATEMENT_ACTIONS.PAY_SOMEONE}`};

function createFrame(): HTMLIFrameElement {
    const frame = document.createElement('iframe');
    document.body.appendChild(frame);
    return frame;
}

function postMessageToApp(origin: string, source: Window | null) {
    window.dispatchEvent(new MessageEvent('message', {data: PAY_SOMEONE_MESSAGE, origin, source}));
}

describe('WalletStatementModal on web', () => {
    let statementFrame: HTMLIFrameElement;
    let otherFrame: HTMLIFrameElement;

    function renderModal() {
        const screen = render(<WalletStatementModal statementPageURL={STATEMENT_PAGE_URL} />, {createNodeMock: (element) => (element.type === 'iframe' ? statementFrame : null)});

        // The test renderer never loads the iframe, so fire the load event the browser would fire once the statement page is ready.
        fireEvent(
            screen.UNSAFE_root.find((node) => node.type === 'iframe'),
            'load',
        );
        return screen;
    }

    beforeEach(() => {
        statementFrame = createFrame();
        otherFrame = createFrame();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('follows a link that the statement page in the iframe sends', () => {
        // Given the statement page is open inside the iframe
        renderModal();

        // When the statement page tells the app that the user clicked "Pay someone"
        postMessageToApp(STATEMENT_PAGE_ORIGIN, statementFrame.contentWindow);

        // Then the app handles that link
        expect(handleWalletStatementNavigation).toHaveBeenCalledTimes(1);
        expect(jest.mocked(handleWalletStatementNavigation).mock.calls.at(0)?.slice(-2)).toEqual([PAY_SOMEONE_MESSAGE.type, PAY_SOMEONE_MESSAGE.url]);
    });

    it('ignores a message from a page on another site', () => {
        // Given a page on another site holds a reference to the app window
        renderModal();

        // When that page posts the same message that the statement page sends
        postMessageToApp(OTHER_SITE_ORIGIN, otherFrame.contentWindow);

        // Then the app ignores it, because only the statement page may move the user to another screen
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
    });

    it('ignores a message with the statement page origin from a window other than the iframe', () => {
        // Given another window that loads a page from the same origin as the statement page
        renderModal();

        // When that window posts a message to the app
        postMessageToApp(STATEMENT_PAGE_ORIGIN, otherFrame.contentWindow);

        // Then the app ignores it, because the message did not come from the iframe the app shows
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
    });

    it('ignores a message from the iframe when it shows a page from another origin', () => {
        // Given the iframe has moved away from the statement page to a page on another site
        renderModal();

        // When the page now in the iframe posts a message to the app
        postMessageToApp(OTHER_SITE_ORIGIN, statementFrame.contentWindow);

        // Then the app ignores it, because only the statement page may move the user to another screen
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
    });

    it('stops listening for messages once the statement page closes', () => {
        // Given the user opened the statement page and then closed it
        const {unmount} = renderModal();
        unmount();

        // When a message that would otherwise be valid arrives
        postMessageToApp(STATEMENT_PAGE_ORIGIN, statementFrame.contentWindow);

        // Then the app ignores it, because a closed statement page should not move the user to another screen
        expect(handleWalletStatementNavigation).not.toHaveBeenCalled();
    });
});
