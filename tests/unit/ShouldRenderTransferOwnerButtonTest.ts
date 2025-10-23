import type {OnyxEntry} from 'react-native-onyx';
import shouldRenderTransferOwnerButton from '@libs/shouldRenderTransferOwnerButton';
import type {FundList} from '@src/types/onyx';

describe('shouldRenderTransferOwnerButton', () => {
    it('should return true if the user has debit card funds', () => {
        const FUND_LIST: OnyxEntry<FundList> = {
            defaultCard: {
                isDefault: true,
                accountData: {
                    cardYear: new Date().getFullYear(),
                    cardMonth: new Date().getMonth() + 1,
                    additionalData: {
                        isBillingCard: true,
                    },
                },
            },
        };

        // eslint-disable-next-line testing-library/render-result-naming-convention
        const result = shouldRenderTransferOwnerButton(FUND_LIST);
        expect(result).toBe(true);
    });

    it('should return false if fund list is empty', () => {
        const FUND_LIST: OnyxEntry<FundList> = {};
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const result = shouldRenderTransferOwnerButton(FUND_LIST);
        expect(result).toBe(false);
    });
});
