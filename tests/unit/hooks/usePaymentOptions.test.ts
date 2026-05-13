import {renderHook} from '@testing-library/react-native';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import usePaymentOptions from '@src/hooks/usePaymentOptions';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

const mockChatReportID = '1';
const mockActivePolicyID = 'activePolicyID';

const mockChatReport = {
    reportID: mockChatReportID,
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
    invoiceReceiver: {
        type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
    },
} as Report;

jest.mock('@src/hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1})));
jest.mock('@src/hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        Bank: 'bank',
        Building: 'building',
        Cash: 'cash',
        CheckCircle: 'check-circle',
        ThumbsUp: 'thumbs-up',
        User: 'user',
        Wallet: 'wallet',
    }),
}));
jest.mock('@src/hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@src/hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@src/hooks/usePolicy', () => jest.fn(() => undefined));
jest.mock('@src/hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@src/hooks/useOnyx', () => {
    const mockOnyxKeys = jest.requireActual('@src/ONYXKEYS').default;
    return jest.fn((key: string) => {
        if (key === `${mockOnyxKeys.COLLECTION.REPORT}${mockChatReportID}`) {
            return [mockChatReport, {status: 'loaded'}];
        }
        if (key === mockOnyxKeys.NVP_ACTIVE_POLICY_ID) {
            return [mockActivePolicyID, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
});
jest.mock('@navigation/Navigation', () => ({
    getActiveRoute: jest.fn(() => 'invoice/report'),
    navigate: jest.fn(),
}));

describe('usePaymentOptions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('routes invoice business add-bank-account to the active workspace bank account flow', () => {
        const {result} = renderHook(() =>
            usePaymentOptions({
                chatReportID: mockChatReportID,
                currency: CONST.CURRENCY.USD,
                iouReport: {type: CONST.REPORT.TYPE.INVOICE} as Report,
                onPress: jest.fn(),
                policyID: CONST.POLICY.ID_FAKE,
            }),
        );

        const businessOption = result.current.find((option) => option.text === 'iou.settleBusiness');
        const addBankAccountOption = businessOption?.subMenuItems?.find((option) => option.text === 'bankAccount.addBankAccount');

        addBankAccountOption?.onSelected?.();

        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: mockActivePolicyID, backTo: 'invoice/report'}));
    });
});
