import Onyx from 'react-native-onyx';
import {clearTravelInvoicingSettlementAccountErrors, setTravelInvoicingSettlementAccount} from '@libs/actions/TravelInvoicing';
// We need to import API because it is used in the tests
// eslint-disable-next-line no-restricted-syntax
import * as API from '@libs/API';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

describe('TravelInvoicing', () => {
    let spyAPIWrite: jest.SpyInstance;
    let spyOnyxUpdate: jest.SpyInstance;

    beforeEach(() => {
        spyAPIWrite = jest.spyOn(API, 'write');
        spyOnyxUpdate = jest.spyOn(Onyx, 'update');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('setTravelInvoicingSettlementAccount sends correct optimistic, success, and failure data', () => {
        const policyID = '123';
        const workspaceAccountID = 456;
        const settlementBankAccountID = 789;
        const previousPaymentBankAccountID = 111;
        const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;

        setTravelInvoicingSettlementAccount(policyID, workspaceAccountID, settlementBankAccountID, previousPaymentBankAccountID);

        expect(spyAPIWrite).toHaveBeenCalledWith(
            'SetTravelInvoicingSettlementAccount',
            {
                policyID,
                settlementBankAccountID,
            },
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            isLoading: true,
                        }),
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID: null,
                            pendingAction: null,
                            isLoading: false,
                        }),
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: cardSettingsKey,
                        value: expect.objectContaining({
                            paymentBankAccountID: settlementBankAccountID,
                            previousPaymentBankAccountID,
                            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            errors: expect.objectContaining({}),
                            isLoading: false,
                        }),
                    }),
                ]),
            }),
        );
    });

    it('clearTravelInvoicingSettlementAccountErrors clears errors, resets pendingAction, and restores restored paymentBankAccountID', () => {
        const workspaceAccountID = 456;
        const restoredAccountID = 111;
        const cardSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${CONST.TRAVEL.PROGRAM_TRAVEL_US}`;

        clearTravelInvoicingSettlementAccountErrors(workspaceAccountID, restoredAccountID);

        expect(spyOnyxUpdate).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    key: cardSettingsKey,
                    value: {
                        errors: null,
                        pendingAction: null,
                        paymentBankAccountID: restoredAccountID,
                        previousPaymentBankAccountID: null,
                    },
                }),
            ]),
        );
    });
});
