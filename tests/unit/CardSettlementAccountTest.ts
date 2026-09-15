import {clearSettlementAccountError, updateSettlementAccount} from '@libs/actions/Card';
import * as API from '@libs/API';
import {getLatestErrorField, getMicroSecondOnyxErrorWithMessage, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

describe('Card settlement account', () => {
    const workspaceAccountID = 456;
    const currentSettlementBankAccountID = 111;
    const settlementBankAccountID = 789;
    const programKey = CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT;
    const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`;
    let spyAPIWrite: jest.SpyInstance;
    let spyOnyxMerge: jest.SpyInstance;

    beforeEach(() => {
        spyAPIWrite = jest.spyOn(API, 'write');
        spyOnyxMerge = jest.spyOn(Onyx, 'merge');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('tracks the settlement account update with field-specific pending and error data', () => {
        updateSettlementAccount('example.com', workspaceAccountID, 'policy123', programKey, settlementBankAccountID, currentSettlementBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'UpdateCardSettlementAccount',
            {
                domainName: 'example.com',
                settlementBankAccountID,
            },
            {
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: cardSettingsKey,
                        value: {
                            [programKey]: {paymentBankAccountID: settlementBankAccountID},
                            isLoading: true,
                            pendingFields: {paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {paymentBankAccountID: null},
                        },
                    },
                ],
                successData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: cardSettingsKey,
                        value: {
                            [programKey]: {paymentBankAccountID: settlementBankAccountID},
                            isLoading: false,
                            pendingFields: {paymentBankAccountID: null},
                            errorFields: {paymentBankAccountID: null},
                        },
                    },
                ],
                failureData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: cardSettingsKey,
                        value: {
                            [programKey]: {paymentBankAccountID: currentSettlementBankAccountID},
                            isLoading: false,
                            pendingFields: {paymentBankAccountID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {paymentBankAccountID: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0)},
                        },
                    },
                ],
            },
        );
    });

    it('prefers the backend settlement account error over the generic fallback', () => {
        const fallbackError = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0);
        const backendError = getMicroSecondOnyxErrorWithMessage('Reconnect this account through Plaid.', 1);

        expect(
            getLatestErrorField(
                {
                    errorFields: {
                        paymentBankAccountID: {...fallbackError, ...backendError},
                    },
                },
                'paymentBankAccountID',
            ),
        ).toEqual(backendError);
    });

    it('clears settlement account errors and pending state', () => {
        clearSettlementAccountError(workspaceAccountID);

        expect(spyOnyxMerge).toHaveBeenCalledWith(cardSettingsKey, {
            pendingFields: {paymentBankAccountID: null},
            errorFields: {paymentBankAccountID: null},
        });
    });
});
