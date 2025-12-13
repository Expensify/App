import type {OnyxEntry} from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import {handleUnvalidatedAccount} from '@libs/PaymentUtils';
import CONST from '@src/CONST';
import {calculateWalletTransferBalanceFee} from '@src/libs/PaymentUtils';
import type {Report} from '@src/types/onyx';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(),
}));

describe('PaymentUtils', () => {
    it('Test rounding wallet transfer instant fee', () => {
        expect(calculateWalletTransferBalanceFee(2100, CONST.WALLET.TRANSFER_METHOD_TYPE.INSTANT)).toBe(32);
    });
    describe('handleUnvalidatedAccount', () => {
        const mockNavigate = Navigation.navigate as jest.MockedFunction<typeof Navigation.navigate>;
        const mockGetActiveRoute = Navigation.getActiveRoute as jest.MockedFunction<typeof Navigation.getActiveRoute>;

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it.each([
            {
                description: 'search money request report route',
                reportID: '123',
                activeRoute: 'search/r/123',
                expectedRoute: 'search/r/123/verify-account',
            },
            {
                description: 'search report route',
                reportID: '456',
                activeRoute: 'search/view/456',
                expectedRoute: 'search/view/456/verify-account',
            },
            {
                description: 'regular report route',
                reportID: '789',
                activeRoute: 'r/789',
                expectedRoute: 'r/789/verify-account',
            },
            {
                description: 'non-search route defaults to regular report verification',
                reportID: undefined,
                activeRoute: 'r',
                expectedRoute: 'settings/profile/contact-methods/verify?backTo=r',
            },
        ])('should navigate to $expectedRoute when on $description', ({reportID, activeRoute, expectedRoute}) => {
            mockGetActiveRoute.mockReturnValue(activeRoute);

            const iouReport: OnyxEntry<Report> = {reportID} as Report;

            handleUnvalidatedAccount(iouReport);

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(expectedRoute);
        });
    });
});
