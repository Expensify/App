import {fireEvent, render, screen} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import localFileDownload from '@libs/localFileDownload';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import DynamicTwoFactorAuthPage from '@pages/settings/Security/TwoFactorAuth/DynamicTwoFactorAuthPage';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const RECOVERY_CODES = 'aaaa1111, bbbb2222';
const RECOVERY_CODES_FILENAME = 'DO-NOT-DELETE_Expensify-2FA-RecoveryCodes.txt';
const BACK_PATH = 'settings/security';
const DOWNLOAD_CODES_LABEL = 'twoFactorAuth.downloadCodes';

let mockPlatform = 'web';

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: () => mockPlatform,
}));

jest.mock('@libs/localFileDownload', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => true,
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        goBack: jest.fn(),
        isNavigationReady: jest.fn(() => Promise.resolve()),
    },
}));

jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => 'settings/security'));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@userActions/Session', () => ({
    toggleTwoFactorAuth: jest.fn(),
}));

jest.mock('@pages/settings/Security/TwoFactorAuth/TwoFactorAuthWrapper', () => {
    function MockTwoFactorAuthWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockTwoFactorAuthWrapper;
});

jest.mock('@components/RenderHTML', () => {
    function MockRenderHTML() {
        return null;
    }
    return MockRenderHTML;
});

const mockLocalFileDownload = jest.mocked(localFileDownload);
const mockNavigate = jest.mocked(Navigation.navigate);

const renderPage = async () => {
    render(
        <OnyxListItemProvider>
            <DynamicTwoFactorAuthPage />
        </OnyxListItemProvider>,
    );
    await waitForBatchedUpdates();
};

describe('DynamicTwoFactorAuthPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPlatform = 'web';
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.ACCOUNT, {validated: true, requiresTwoFactorAuth: false, recoveryCodes: RECOVERY_CODES});
        await waitForBatchedUpdates();
    });

    it('starts the download only after the navigation to the verify step on web', async () => {
        // Given the recovery codes page on web, where the browser can show a save dialog for the download
        await renderPage();

        // When the user presses Download codes
        fireEvent.press(screen.getByText(DOWNLOAD_CODES_LABEL));

        // Then the page replaces itself with the verify step and the download has not started, because a save dialog that opens
        // during the REPLACE can delay the history update and close the whole 2FA flow
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path, BACK_PATH), expect.objectContaining({forceReplace: true}));
        expect(mockLocalFileDownload).not.toHaveBeenCalled();

        // When the navigation transition ends
        const [, navigateOptions] = mockNavigate.mock.calls.at(0) ?? [];
        navigateOptions?.afterTransition?.();

        // Then the recovery codes are downloaded, because the user still has to get the file they asked for
        expect(mockLocalFileDownload).toHaveBeenCalledTimes(1);
        expect(mockLocalFileDownload).toHaveBeenCalledWith(RECOVERY_CODES_FILENAME, RECOVERY_CODES, expect.any(Function), undefined, undefined, false);
    });

    it('downloads the codes before the navigation on native', async () => {
        // Given the recovery codes page on a native platform, which has no browser history and no save dialog
        mockPlatform = 'ios';
        await renderPage();

        // When the user presses Download codes
        fireEvent.press(screen.getByText(DOWNLOAD_CODES_LABEL));

        // Then the codes are saved right away and the page replaces itself with the verify step, because the native flow must stay as it was
        expect(mockLocalFileDownload).toHaveBeenCalledTimes(1);
        expect(mockLocalFileDownload).toHaveBeenCalledWith(RECOVERY_CODES_FILENAME, RECOVERY_CODES, expect.any(Function), undefined, undefined, false);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path, BACK_PATH), {forceReplace: true, afterTransition: undefined});
    });
});
