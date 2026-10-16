import {cleanup, render, screen} from '@testing-library/react-native';

import ReceiptAlternativeMethods from '@components/ReceiptAlternativeMethods';

import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useHasPhoneNumberLogin from '@hooks/useHasPhoneNumberLogin';

import CONST from '@src/CONST';

import type ReactNative from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

jest.mock('@hooks/useHasLoggedIntoMobileApp');
jest.mock('@hooks/useHasPhoneNumberLogin');
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

jest.mock('@hooks/useEnvironment', () => jest.fn(() => ({environmentURL: 'https://new.expensify.com'})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({textSupporting: '#123456'})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        mt2: {},
        ph0: {},
        mh0: {},
        textLabelSupporting: {},
        mb3: {},
        textAlignCenter: {},
        alignSelfStretch: {},
        alignItemsStart: {},
        flexRow: {},
        alignItemsCenter: {},
        mr3: {},
        textBlue: {},
        flex1: {},
        flexWrap: {},
        mb0: {},
    })),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string, params?: Record<string, string>) => {
            const translations: Record<string, string | ((args?: Record<string, string>) => string)> = {};
            translations['receipt.alternativeMethodsTitle'] = 'Other ways to add receipts:';
            translations['receipt.alternativeMethodsDownloadApp'] = 'Download the app to scan from your phone';
            translations['receipt.alternativeMethodsForwardReceipts'] = ({email} = {}) => `Forward receipts to ${email}`;
            translations['receipt.alternativeMethodsAddPhoneNumber'] = ({phoneNumber} = {}) => `Add your number to text receipts to ${phoneNumber}`;
            translations['receipt.alternativeMethodsTextReceipts'] = ({phoneNumber} = {}) => `Text receipts to ${phoneNumber} (US numbers only)`;

            const translation = translations[key];
            if (typeof translation === 'function') {
                return translation(params);
            }
            if (typeof translation === 'string') {
                return translation;
            }

            return key;
        },
    })),
);
const mockUseHasLoggedIntoMobileApp = jest.mocked(useHasLoggedIntoMobileApp);
const mockUseHasPhoneNumberLogin = jest.mocked(useHasPhoneNumberLogin);

function renderComponent() {
    return render(
        <NavigationContainer>
            <ReceiptAlternativeMethods />
        </NavigationContainer>,
    );
}

describe('ReceiptAlternativeMethods', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('renders all options when user has neither app nor phone number', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: false, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumberLogin.mockReturnValue({hasPhoneNumberLogin: false, isPhoneNumberLoaded: true});

        renderComponent();

        expect(screen.getByText('Other ways to add receipts:')).toBeTruthy();
        expect(screen.getByText('Download the app to scan from your phone')).toBeTruthy();
        expect(screen.getByText(`Forward receipts to ${CONST.EMAIL.RECEIPTS}`)).toBeTruthy();
        expect(screen.getByText(`Add your number to text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER}`)).toBeTruthy();
        expect(screen.queryByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeNull();
    });

    it('shows add number option when user has app but no phone number', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: true, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumberLogin.mockReturnValue({hasPhoneNumberLogin: false, isPhoneNumberLoaded: true});

        renderComponent();

        expect(screen.queryByText('Download the app to scan from your phone')).toBeNull();
        expect(screen.getByText(`Add your number to text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER}`)).toBeTruthy();
        expect(screen.queryByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeNull();
    });

    it('shows SMS instructions when user has phone but no app login', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: false, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumberLogin.mockReturnValue({hasPhoneNumberLogin: true, isPhoneNumberLoaded: true});

        renderComponent();

        expect(screen.getByText('Download the app to scan from your phone')).toBeTruthy();
        expect(screen.getByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeTruthy();
        expect(screen.queryByText('Add your number')).toBeNull();
    });

    it('shows minimal options when user has both app and phone number', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: true, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumberLogin.mockReturnValue({hasPhoneNumberLogin: true, isPhoneNumberLoaded: true});

        renderComponent();

        expect(screen.queryByText('Download the app to scan from your phone')).toBeNull();
        expect(screen.queryByText('Add your number')).toBeNull();
        expect(screen.getByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeTruthy();
    });

    it('does not render until hooks have loaded', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: false, isLastMobileAppLoginLoaded: false});
        mockUseHasPhoneNumberLogin.mockReturnValue({hasPhoneNumberLogin: false, isPhoneNumberLoaded: false});

        const {toJSON} = renderComponent();

        expect(toJSON()).toBeNull();
    });
});
