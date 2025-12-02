import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestStepConfirmationWithWritableReportOrNotFound from '@pages/iou/request/step/IOURequestStepConfirmation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, TaxRatesWithDefault} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import * as IOU from '../../../src/libs/actions/IOU';
import createRandomPolicy from '../../utils/collections/policies';
import {signInWithTestUser, translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));
jest.mock('@libs/actions/IOU', () => {
    const actualNav = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actualNav,
        startMoneyRequest: jest.fn(),
        startSplitBill: jest.fn(),
    };
});
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@src/hooks/useResponsiveLayout');

jest.mock('@libs/Navigation/navigationRef', () => ({
    getCurrentRoute: jest.fn(() => ({
        name: 'Money_Request_Step_Confirmation',
        params: {},
    })),
    getState: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        navigationRef: mockRef,
    };
});

jest.mock('@react-navigation/native', () => {
    const mockRef = {
        getCurrentRoute: jest.fn(() => ({
            name: 'Money_Request_Step_Confirmation',
            params: {},
        })),
        getState: jest.fn(() => ({})),
    };
    return {
        createNavigationContainerRef: jest.fn(() => mockRef),
        useIsFocused: () => true,
        useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
    };
});

const ACCOUNT_ID = 1;
const ACCOUNT_LOGIN = 'test@user.com';
const REPORT_ID = '1';
const PARTICIPANT_ACCOUNT_ID = 2;
const TRANSACTION_ID = '1';
const POLICY_ID = 'test-policy-id';

// Helper to create a policy with tax and distance enabled
function createPolicyWithTaxAndDistance(): Policy {
    const taxRates: TaxRatesWithDefault = {
        name: 'Tax',
        defaultExternalID: 'taxRate1',
        defaultValue: '5%',
        foreignTaxDefault: 'taxRate2',
        taxes: {
            taxRate1: {
                name: 'Tax Rate 1',
                value: '5%',
                code: 'taxRate1',
                modifiedName: 'Tax Rate 1 (5%)',
                isDisabled: false,
            },
            taxRate2: {
                name: 'Tax Rate 2',
                value: '10%',
                code: 'taxRate2',
                modifiedName: 'Tax Rate 2 (10%)',
                isDisabled: false,
            },
        },
    };

    return {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE, 'Test Policy'),
        id: POLICY_ID,
        outputCurrency: 'USD',
        taxRates,
        tax: {
            trackingEnabled: true,
        },
        customUnits: {
            [CONST.CUSTOM_UNITS.NAME_DISTANCE]: {
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                customUnitID: 'customUnitID',
                enabled: true,
                attributes: {
                    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
                rates: {
                    altTaxRate: {
                        name: 'Default Rate',
                        customUnitRateID: 'altTaxRate',
                        enabled: true,
                        currency: 'USD',
                        rate: 67,
                        attributes: {
                            taxRateExternalID: 'taxRate1',
                            taxClaimablePercentage: 1,
                        },
                    },
                },
            },
        },
    };
}

// Helper to create waypoints
function createWaypoints(startAddress: string, endAddress: string): WaypointCollection {
    return {
        waypoint0: {
            address: startAddress,
            lat: 40.7128,
            lng: -74.006,
            name: startAddress,
        },
        waypoint1: {
            address: endAddress,
            lat: 40.7589,
            lng: -73.9851,
            name: endAddress,
        },
    };
}

const DEFAULT_SPLIT_TRANSACTION: Transaction = {
    amount: 0,
    billable: false,
    comment: {
        attendees: [
            {
                accountID: ACCOUNT_ID,
                avatarUrl: '',
                displayName: '',
                email: ACCOUNT_LOGIN,
                login: ACCOUNT_LOGIN,
                reportID: REPORT_ID,
                selected: true,
                text: ACCOUNT_LOGIN,
            },
        ],
    },
    created: '2025-08-29',
    currency: 'USD',
    isFromGlobalCreate: false,
    merchant: '(none)',
    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
    participantsAutoAssigned: true,
    reimbursable: true,
    reportID: REPORT_ID,
    transactionID: TRANSACTION_ID,
};

describe('IOURequestStepConfirmationPageTest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Onyx.init({keys: ONYXKEYS});
    });

    it('should not restart the money request creation flow when sending invoice from global FAB', async () => {
        // Given an invoice creation flow started from global FAB menu
        const routeReportID = '1';
        const participantReportID = '2';

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                transactionID: TRANSACTION_ID,
                isFromGlobalCreate: true,
                participants: [
                    {
                        accountID: 1,
                        reportID: participantReportID,
                        iouType: 'invoice',
                    },
                ],
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmationWithWritableReportOrNotFound
                            route={{
                                key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                                name: 'Money_Request_Step_Confirmation',
                                params: {
                                    action: 'create',
                                    iouType: 'invoice',
                                    transactionID: TRANSACTION_ID,
                                    reportID: routeReportID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // Then startMoneyRequest should not be called from IOURequestConfirmationPage.
        expect(IOU.startMoneyRequest).not.toHaveBeenCalled();
    });

    it('should create a split expense for a scanned receipt', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}1`, {
                ...DEFAULT_SPLIT_TRANSACTION,
                filename: 'receipt1.jpg',
                iouRequestType: 'scan',
                receipt: {source: 'path/to/receipt1.jpg', type: ''},
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmationWithWritableReportOrNotFound
                            route={{
                                key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                                name: 'Money_Request_Step_Confirmation',
                                params: {
                                    action: 'create',
                                    iouType: 'split',
                                    transactionID: TRANSACTION_ID,
                                    reportID: REPORT_ID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
        fireEvent.press(await screen.findByText(translateLocal('iou.splitExpense')));
        expect(IOU.startSplitBill).toHaveBeenCalledTimes(1);
    });

    it('should create a split expense for each scanned receipt', async () => {
        await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}1`, {
                ...DEFAULT_SPLIT_TRANSACTION,
                filename: 'receipt1.jpg',
                iouRequestType: 'scan',
                receipt: {source: 'path/to/receipt1.jpg', type: ''},
                transactionID: '1',
            });
        });

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}2`, {
                ...DEFAULT_SPLIT_TRANSACTION,
                filename: 'receipt2.jpg',
                iouRequestType: 'scan',
                receipt: {source: 'path/to/receipt2.jpg', type: ''},
                transactionID: '2',
            });
        });

        render(
            <OnyxListItemProvider>
                <CurrentUserPersonalDetailsProvider>
                    <LocaleContextProvider>
                        <IOURequestStepConfirmationWithWritableReportOrNotFound
                            route={{
                                key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                                name: 'Money_Request_Step_Confirmation',
                                params: {
                                    action: 'create',
                                    iouType: 'split',
                                    transactionID: TRANSACTION_ID,
                                    reportID: REPORT_ID,
                                },
                            }}
                            // @ts-expect-error we don't need navigation param here.
                            navigation={undefined}
                        />
                    </LocaleContextProvider>
                </CurrentUserPersonalDetailsProvider>
            </OnyxListItemProvider>,
        );
        fireEvent.press(await screen.findByText(translateLocal('iou.createExpenses', {expensesNumber: 2})));
        expect(IOU.startSplitBill).toHaveBeenCalledTimes(2);
    });

    describe('Tax Calculation Tests', () => {
        beforeEach(async () => {
            await signInWithTestUser(ACCOUNT_ID, ACCOUNT_LOGIN);
        });

        it('should update tax amount when waypoints change in distance request', async () => {
            const policy = createPolicyWithTaxAndDistance();
            const initialWaypoints = createWaypoints('New York', 'Boston');
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                    reportID: REPORT_ID,
                    policyID: POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    amount: 5000,
                    currency: 'USD',
                    comment: {
                        waypoints: initialWaypoints,
                        customUnit: {
                            customUnitRateID: 'altTaxRate',
                        },
                    },
                    routes: {
                        route0: {
                            distance: 100000,
                            geometry: {
                                coordinates: [
                                    [-74.006, 40.7128],
                                    [-73.9851, 40.7589],
                                ],
                            },
                        },
                    },
                    merchant: 'Distance',
                    created: '2025-01-15',
                    taxCode: 'taxRate1',
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
                });
            });

            const {rerender} = render(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Get initial tax amount from transaction
            let transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            const initialTaxAmount = transaction?.taxAmount;
            expect(initialTaxAmount).toBeTruthy();
            expect(initialTaxAmount).toBeGreaterThan(0);

            // Update waypoints to simulate distance change
            const updatedWaypoints = createWaypoints('New York', 'Philadelphia');
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    comment: {
                        waypoints: updatedWaypoints,
                        customUnit: {
                            customUnitRateID: 'altTaxRate',
                        },
                    },
                    routes: {
                        route0: {
                            distance: 70000,
                            geometry: {
                                coordinates: [
                                    [-74.006, 40.7128],
                                    [-75.1652, 39.9526],
                                ],
                            },
                        },
                    },
                    amount: 3500,
                });
            });

            rerender(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Get updated tax amount
            transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            const updatedTaxAmount = transaction?.taxAmount;

            // Tax amount should update based on new distance
            expect(updatedTaxAmount).toBeTruthy();
            expect(updatedTaxAmount).not.toBe(initialTaxAmount);
            expect(updatedTaxAmount).toBeGreaterThan(0);
        });

        it('should recalculate tax amount with foreign tax rate when currency changes', async () => {
            const policy = createPolicyWithTaxAndDistance();

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                    reportID: REPORT_ID,
                    policyID: POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    amount: 10000,
                    currency: 'USD',
                    merchant: 'Test Merchant',
                    created: '2025-01-15',
                    taxCode: 'taxRate1',
                    taxAmount: 476,
                    iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
                    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
                });
            });

            const {rerender} = render(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Verify initial tax with default rate (5%)
            let transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            expect(transaction?.taxCode).toBe('taxRate1');
            expect(transaction?.taxAmount).toBe(476);

            // Change currency to EUR (should trigger foreign tax default)
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    currency: 'EUR',
                });
            });

            rerender(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Get tax after currency change
            transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            // Tax code should change to foreign default (taxRate2 - 10%)
            expect(transaction?.taxCode).toBe('taxRate2');

            // Tax amount should be recalculated with the new 10% rate (not zero, and different from 5% rate)
            expect(transaction?.taxAmount).toBeDefined();
            expect(transaction?.taxAmount).toBeGreaterThan(0);
            expect(transaction?.taxAmount).not.toBe(476);

            // With 10% tax on 10000: taxAmount = (10000 - 10000/1.10) = 909
            expect(transaction?.taxAmount).toBe(909);
        });

        it('should not zero out tax when re-selecting distance rate without reclaimable configured', async () => {
            const policy = createPolicyWithTaxAndDistance();
            const waypoints = createWaypoints('New York', 'Boston');

            // Add a second rate WITHOUT taxClaimablePercentage (simulating no reclaimable amount entered)
            if (policy.customUnits?.[CONST.CUSTOM_UNITS.NAME_DISTANCE]) {
                policy.customUnits[CONST.CUSTOM_UNITS.NAME_DISTANCE].rates = {
                    ...policy.customUnits[CONST.CUSTOM_UNITS.NAME_DISTANCE].rates,
                    altTaxRate2: {
                        name: 'Rate Without Reclaimable',
                        customUnitRateID: 'altTaxRate2',
                        enabled: true,
                        currency: 'USD',
                        rate: 100,
                        attributes: {
                            taxRateExternalID: 'taxRate2',
                            // Note: taxClaimablePercentage intentionally omitted to test the bug
                        },
                    },
                };
            }

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                    reportID: REPORT_ID,
                    policyID: POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    amount: 5000,
                    currency: 'USD',
                    comment: {
                        waypoints,
                        customUnit: {
                            customUnitRateID: 'altTaxRate2',
                        },
                    },
                    routes: {
                        route0: {
                            distance: 100000,
                            geometry: {
                                coordinates: [
                                    [-74.006, 40.7128],
                                    [-73.9851, 40.7589],
                                ],
                            },
                        },
                    },
                    merchant: 'Distance',
                    created: '2025-01-15',
                    taxCode: 'taxRate2',
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
                });
            });

            render(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Read tax amount - should NOT be zero even though taxClaimablePercentage is not configured
            const transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            // With the fix, taxClaimablePercentage defaults to 1 (100%), so tax should calculate correctly
            expect(transaction?.taxAmount).toBeDefined();
            expect(transaction?.taxAmount).toBeGreaterThan(0);

            // Tax code should be taxRate2 (from the distance rate configuration)
            expect(transaction?.taxCode).toBe('taxRate2');
        });

        it('should handle edge case: tax calculation with changing distance rates', async () => {
            const policy = createPolicyWithTaxAndDistance();
            const waypoints = createWaypoints('San Francisco', 'Los Angeles');

            // Add a second rate to the policy
            if (policy.customUnits?.[CONST.CUSTOM_UNITS.NAME_DISTANCE]) {
                policy.customUnits[CONST.CUSTOM_UNITS.NAME_DISTANCE].rates = {
                    ...policy.customUnits[CONST.CUSTOM_UNITS.NAME_DISTANCE].rates,
                    altTaxRate2: {
                        name: 'Higher Rate',
                        customUnitRateID: 'altTaxRate2',
                        enabled: true,
                        currency: 'USD',
                        rate: 100,
                        attributes: {
                            taxRateExternalID: 'taxRate2',
                            taxClaimablePercentage: 1,
                        },
                    },
                };
            }

            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                    reportID: REPORT_ID,
                    policyID: POLICY_ID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                });
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    transactionID: TRANSACTION_ID,
                    reportID: REPORT_ID,
                    amount: 5000,
                    currency: 'USD',
                    comment: {
                        waypoints,
                        customUnit: {
                            customUnitRateID: 'altTaxRate',
                        },
                    },
                    routes: {
                        route0: {
                            distance: 100000,
                            geometry: {
                                coordinates: [
                                    [-122.4194, 37.7749],
                                    [-118.2437, 34.0522],
                                ],
                            },
                        },
                    },
                    merchant: 'Distance',
                    created: '2025-01-15',
                    taxCode: 'taxRate1',
                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                    participants: [{accountID: PARTICIPANT_ACCOUNT_ID, selected: true}],
                });
            });

            const {rerender} = render(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Get initial tax
            let transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            const initialTaxAmount = transaction?.taxAmount;
            const initialTaxCode = transaction?.taxCode;

            // Switch to higher rate
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                    comment: {
                        waypoints,
                        customUnit: {
                            customUnitRateID: 'altTaxRate2',
                        },
                    },
                    routes: {
                        route0: {
                            distance: 100000,
                            geometry: {
                                coordinates: [
                                    [-122.4194, 37.7749],
                                    [-118.2437, 34.0522],
                                ],
                            },
                        },
                    },
                    amount: 7500,
                    taxCode: 'taxRate2',
                });
            });

            rerender(
                <OnyxListItemProvider>
                    <CurrentUserPersonalDetailsProvider>
                        <LocaleContextProvider>
                            <IOURequestStepConfirmationWithWritableReportOrNotFound
                                route={{
                                    key: 'Money_Request_Step_Confirmation',
                                    name: 'Money_Request_Step_Confirmation',
                                    params: {
                                        action: 'create',
                                        iouType: 'submit',
                                        transactionID: TRANSACTION_ID,
                                        reportID: REPORT_ID,
                                    },
                                }}
                                // @ts-expect-error we don't need navigation param here.
                                navigation={undefined}
                            />
                        </LocaleContextProvider>
                    </CurrentUserPersonalDetailsProvider>
                </OnyxListItemProvider>,
            );

            await waitForBatchedUpdatesWithAct();

            // Get updated tax
            transaction = await OnyxUtils.get(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`);

            const updatedTaxAmount = transaction?.taxAmount;
            const updatedTaxCode = transaction?.taxCode;

            // Tax should update appropriately with new rate
            expect(updatedTaxAmount).toBeDefined();
            expect(updatedTaxAmount).toBeGreaterThan(0);
            expect(updatedTaxCode).toBe('taxRate2');
            expect(updatedTaxAmount).not.toBe(initialTaxAmount);
            expect(updatedTaxCode).not.toBe(initialTaxCode);
        });
    });
});
