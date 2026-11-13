import {act, render} from '@testing-library/react-native';

import {addTempShareFile} from '@libs/actions/Share';

import ShareRootPage from '@pages/Share/ShareRootPage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ShareTempFile} from '@src/types/onyx';

import type {AppStateStatus} from 'react-native';

import React from 'react';
import {AppState, Linking} from 'react-native';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockFirstShare: ShareTempFile = {id: 'shared-file-1', content: 'file:///shared/receipt.jpg', mimeType: CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG};
const mockSecondShare: ShareTempFile = {id: 'shared-file-2', content: 'file:///shared/receipt-2.jpg', mimeType: CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG};

jest.mock('@libs/actions/Share', () => ({
    addTempShareFile: jest.fn(),
    addValidatedShareFile: jest.fn(),
    clearShareData: jest.fn(),
}));

jest.mock('@userActions/Tab', () => ({
    __esModule: true,
    default: {
        setSelectedTab: jest.fn(),
    },
}));

const mockProcessFiles = jest.fn((callback: (files: ShareTempFile[]) => void) => callback([mockFirstShare]));

jest.mock('@libs/ShareActionHandlerModule', () => ({
    __esModule: true,
    default: {
        processFiles: (callback: (files: ShareTempFile[]) => void) => mockProcessFiles(callback),
    },
}));

jest.mock('@hooks/useFilesValidation', () => jest.fn(() => ({validateFiles: jest.fn()})));

jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/Skeletons/TabNavigatorSkeleton', () => () => null);
jest.mock('@libs/Navigation/OnyxTabNavigator', () => ({
    __esModule: true,
    default: () => null,
    TopTab: {Screen: () => null},
}));

function captureLinkingListener(): (url: string) => void {
    const addEventListenerSpy = jest.spyOn(Linking, 'addEventListener');
    return (url) => {
        const urlChangeHandler = addEventListenerSpy.mock.calls.find(([eventType]) => eventType === 'url')?.[1];
        urlChangeHandler?.({url});
    };
}

async function openDeepLink(emitUrl: (url: string) => void, url: string) {
    await act(async () => {
        emitUrl(url);
    });
    await waitForBatchedUpdatesWithAct();
}

function captureAppStateListeners(): (states: AppStateStatus[]) => Promise<void> {
    const listeners: Array<(state: AppStateStatus) => void> = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((type, handler) => {
        listeners.push(handler);
        return {remove: jest.fn()};
    });
    return async (states) => {
        await act(async () => {
            for (const state of states) {
                for (const listener of listeners) {
                    listener(state);
                }
            }
        });
        await waitForBatchedUpdatesWithAct();
    };
}

async function renderShareRootPage() {
    render(<ShareRootPage />);
    await waitForBatchedUpdatesWithAct();
}

describe('ShareRootPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        ['standalone app', `new-expensify://${ROUTES.SHARE_ROOT}`],
        ['HybridApp', `${CONST.NEW_EXPENSIFY_URL}${ROUTES.SHARE_ROOT}`],
    ])('processes a new share when the %s opens the share root deep link', async (_, url) => {
        // Given a share root screen that has already processed the first share
        const emitUrl = captureLinkingListener();
        await renderShareRootPage();
        mockProcessFiles.mockImplementationOnce((callback) => callback([mockSecondShare]));

        // When the user shares another file while the app is running, which opens the share root deep link without remounting the page
        await openDeepLink(emitUrl, url);

        // Then the second share replaces the first one, so the flow does not keep the previous file
        expect(mockProcessFiles).toHaveBeenCalledTimes(2);
        expect(addTempShareFile).toHaveBeenLastCalledWith(mockSecondShare);
    });

    it('does not re-process share files for deep links to other routes', async () => {
        // Given a share root screen that has processed the initial share files
        const emitUrl = captureLinkingListener();
        await renderShareRootPage();
        expect(mockProcessFiles).toHaveBeenCalledTimes(1);

        // When a deep link to an unrelated route arrives
        await openDeepLink(emitUrl, `new-expensify://${ROUTES.HOME}`);

        // Then the share files are not read again, because no new share was made
        expect(mockProcessFiles).toHaveBeenCalledTimes(1);
    });

    it('does not re-process share files when the app state changes', async () => {
        // Given a share root screen that has processed the initial share files, which used to be re-processed on every return to the foreground and raced with the receipt being moved after submission
        const emitAppStates = captureAppStateListeners();
        await renderShareRootPage();
        expect(mockProcessFiles).toHaveBeenCalledTimes(1);

        // When a permission dialog or backgrounding toggles the app state without a new share
        await emitAppStates(['inactive', 'active', 'background', 'active']);

        // Then the share files are not read again, so they cannot race with the receipt being moved after submission
        expect(mockProcessFiles).toHaveBeenCalledTimes(1);
    });
});
