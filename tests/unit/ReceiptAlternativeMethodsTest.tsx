import React from 'react';
import {render, screen} from '@testing-library/react-native';
import ReceiptAlternativeMethods from '@components/ReceiptAlternativeMethods';
import CONST from '@src/CONST';
import useHasLoggedIntoMobileApp from '@hooks/useHasLoggedIntoMobileApp';
import useHasPhoneNumber from '@hooks/useHasPhoneNumber';

jest.mock('@hooks/useHasLoggedIntoMobileApp');
jest.mock('@hooks/useHasPhoneNumber');
jest.mock('@hooks/useEnvironment', () => ({
    __esModule: true,
    default: jest.fn(() => ({environmentURL: 'https://new.expensify.com'})),
}));
jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: jest.fn(() => ({textSupporting: '#123456'})),
}));
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        mt4: {},
        ph4: {},
        textLabelSupporting: {},
        mb3: {},
        textAlignCenter: {},
        flexRow: {},
        alignItemsCenter: {},
        mr3: {},
        textBlue: {},
        flex1: {},
        flexWrap: {},
    })),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        translate: (key: string, params?: Record<string, string>) => {
            const translations: Record<string, string | ((args?: Record<string, string>) => string)> = {
                'receipt.alternativeMethodsTitle': 'Other ways to add receipts:',
                'receipt.alternativeMethodsDownloadApp': 'Download the app to scan from your phone',
                'receipt.alternativeMethodsForwardReceipts': 'Forward receipts to',
                'receipt.alternativeMethodsAddPhoneNumberLink': 'Add your number',
                'receipt.alternativeMethodsAddPhoneNumberSuffix': ({phoneNumber} = {}) => ` to text receipts to ${phoneNumber}`,
                'receipt.alternativeMethodsTextReceipts': ({phoneNumber} = {}) => `Text receipts to ${phoneNumber} (US numbers only)`,
                'reportActionContextMenu.copyToClipboard': 'Copy to clipboard',
                'reportActionContextMenu.copied': 'Copied!',
            };

            const translation = translations[key];
            if (typeof translation === 'function') {
                return translation(params);
            }

            return translation ?? key;
        },
    })),
}));

const mockUseHasLoggedIntoMobileApp = useHasLoggedIntoMobileApp as jest.MockedFunction<typeof useHasLoggedIntoMobileApp>;
const mockUseHasPhoneNumber = useHasPhoneNumber as jest.MockedFunction<typeof useHasPhoneNumber>;

describe('ReceiptAlternativeMethods', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all options when user has neither app nor phone number', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: false, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumber.mockReturnValue({hasPhoneNumber: false, isLoaded: true});

        render(<ReceiptAlternativeMethods />);

        expect(screen.getByText('Other ways to add receipts:')).toBeTruthy();
        expect(screen.getByText('Download the app to scan from your phone')).toBeTruthy();
        expect(screen.getByText(`Forward receipts to ${CONST.EMAIL.RECEIPTS}`)).toBeTruthy();
        expect(screen.getByText('Add your number')).toBeTruthy();
        expect(screen.getByText(new RegExp(`Add your number to text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER}`))).toBeTruthy();
        expect(screen.queryByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeNull();
    });

    it('shows add number option when user has app but no phone number', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: true, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumber.mockReturnValue({hasPhoneNumber: false, isLoaded: true});

        render(<ReceiptAlternativeMethods />);

        expect(screen.queryByText('Download the app to scan from your phone')).toBeNull();
        expect(screen.getByText('Add your number')).toBeTruthy();
        expect(screen.getByText(new RegExp(`Add your number to text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER}`))).toBeTruthy();
        expect(screen.queryByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeNull();
    });

    it('shows SMS instructions when user has phone but no app login', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: false, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumber.mockReturnValue({hasPhoneNumber: true, isLoaded: true});

        render(<ReceiptAlternativeMethods />);

        expect(screen.getByText('Download the app to scan from your phone')).toBeTruthy();
        expect(screen.getByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeTruthy();
        expect(screen.queryByText('Add your number')).toBeNull();
    });

    it('shows minimal options when user has both app and phone number', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: true, isLastMobileAppLoginLoaded: true});
        mockUseHasPhoneNumber.mockReturnValue({hasPhoneNumber: true, isLoaded: true});

        render(<ReceiptAlternativeMethods />);

        expect(screen.queryByText('Download the app to scan from your phone')).toBeNull();
        expect(screen.queryByText(new RegExp(`Add your number to text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER}`))).toBeNull();
        expect(screen.getByText(`Text receipts to ${CONST.SMS.RECEIPTS_PHONE_NUMBER} (US numbers only)`)).toBeTruthy();
    });

    it('does not render until hooks have loaded', () => {
        mockUseHasLoggedIntoMobileApp.mockReturnValue({hasLoggedIntoMobileApp: false, isLastMobileAppLoginLoaded: false});
        mockUseHasPhoneNumber.mockReturnValue({hasPhoneNumber: false, isLoaded: false});

        const {toJSON} = render(<ReceiptAlternativeMethods />);

        expect(toJSON()).toBeNull();
    });
});
