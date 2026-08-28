import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrencyListContextProvider} from '@components/CurrencyListContextProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import RulesRequireReceiptsPage from '@pages/workspace/rules/RulesRequireReceiptsPage';

import {setPolicyMaxExpenseAmountNoItemizedReceipt, setPolicyMaxExpenseAmountNoReceipt} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Policy/Policy', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@userActions/Policy/Policy');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        setPolicyMaxExpenseAmountNoReceipt: jest.fn(),
        setPolicyMaxExpenseAmountNoItemizedReceipt: jest.fn(),
    };
});

TestHelper.setupGlobalFetchMock();

const mockSetReceipt = jest.mocked(setPolicyMaxExpenseAmountNoReceipt);
const mockSetItemized = jest.mocked(setPolicyMaxExpenseAmountNoItemizedReceipt);

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderPage = (policyID: string) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, CurrencyListContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RULES_REQUIRE_RECEIPTS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.RULES_REQUIRE_RECEIPTS}
                                component={RulesRequireReceiptsPage}
                                initialParams={{policyID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
};

const getReceiptToggleLabel = () => TestHelper.translateLocal('workspace.rules.requireReceipts.requireReceipt');
const getItemizedToggleLabel = () => TestHelper.translateLocal('workspace.rules.requireReceipts.requireItemizedReceipt');
const getAmountLabel = () => TestHelper.translateLocal('workspace.rules.requireReceipts.requireAboveAmount');
const getSaveLabel = () => TestHelper.translateLocal('workspace.rules.requireReceipts.saveRule');

/** The page is gated behind the rulesRevamp beta, and its wrapper needs an admin on a Control workspace with Rules on. */
const setupPolicy = async (policyOverrides: Partial<Policy>) => {
    await TestHelper.signInWithTestUser();
    await act(async () => {
        await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.RULES_REVAMP]);
    });
    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.CORPORATE,
        areRulesEnabled: true,
        outputCurrency: 'USD',
        ...policyOverrides,
    };
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
    });
    return policy;
};

/** Waits for the form to be interactive, i.e. past the access wrapper's loading state. */
const waitForForm = async () => {
    await waitForBatchedUpdatesWithAct();
    await waitFor(() => {
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()})).toBeOnTheScreen();
    });
};

/** Both amount inputs share one label; index 0 is the receipt amount and index 1 the itemized amount. */
const setAmount = (index: number, value: string) => {
    const input = screen.getAllByLabelText(getAmountLabel()).at(index);
    if (!input) {
        throw new Error(`Expected an amount input at index ${index}`);
    }
    fireEvent.changeText(input, value);
};

/** Flipping a toggle mounts or unmounts its amount input, so let that settle before touching the inputs. */
const toggle = async (label: string) => {
    fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: label}));
    await waitForBatchedUpdatesWithAct();
};

const save = () => {
    fireEvent.press(screen.getByRole(CONST.ROLE.BUTTON, {name: getSaveLabel()}));
};

/** True when the itemized amount was sent to the server before the receipt amount. */
const wasItemizedSentFirst = () => {
    const itemizedOrder = mockSetItemized.mock.invocationCallOrder.at(0) ?? Number.POSITIVE_INFINITY;
    const receiptOrder = mockSetReceipt.mock.invocationCallOrder.at(0) ?? Number.POSITIVE_INFINITY;
    return itemizedOrder < receiptOrder;
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    await act(async () => {
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
    });
});

afterEach(async () => {
    await act(async () => {
        await Onyx.clear();
    });
    jest.clearAllMocks();
});

describe('RulesRequireReceiptsPage save order', () => {
    it('sends the itemized amount before the receipt amount when both are raised', async () => {
        // Given both amounts saved at 50.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: 5000, maxExpenseAmountNoItemizedReceipt: 5000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When both are raised to 100.00 and the rule is saved
        setAmount(0, '100.00');
        setAmount(1, '100.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then the itemized amount goes first, so the receipt amount is never checked against the old lower limit
        expect(mockSetItemized).toHaveBeenCalledWith(policy.id, '100.00', 5000);
        expect(mockSetReceipt).toHaveBeenCalledWith(policy.id, '100.00', 5000, {});
        expect(wasItemizedSentFirst()).toBe(true);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends the receipt amount before the itemized amount when both are lowered', async () => {
        // Given both amounts saved at 100.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: 10000, maxExpenseAmountNoItemizedReceipt: 10000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When both are lowered to 50.00 and the rule is saved
        setAmount(0, '50.00');
        setAmount(1, '50.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then the receipt amount goes first, so the itemized amount is never dropped below the old receipt limit
        expect(mockSetReceipt).toHaveBeenCalledWith(policy.id, '50.00', 10000, {});
        expect(mockSetItemized).toHaveBeenCalledWith(policy.id, '50.00', 10000);
        expect(wasItemizedSentFirst()).toBe(false);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends the itemized amount first when it is switched off while the receipt amount is raised', async () => {
        // Given a receipt amount of 50.00 and an itemized amount of 80.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: 5000, maxExpenseAmountNoItemizedReceipt: 8000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When the itemized rule is switched off and the receipt amount is raised to 60.00
        await toggle(getItemizedToggleLabel());
        setAmount(0, '60.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then clearing the itemized limit goes first, which leaves no limit for the raised receipt amount to exceed
        expect(mockSetItemized).toHaveBeenCalledWith(policy.id, '', 8000);
        expect(mockSetReceipt).toHaveBeenCalledWith(policy.id, '60.00', 5000, {});
        expect(wasItemizedSentFirst()).toBe(true);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends the itemized amount first when the receipt rule was previously switched off', async () => {
        // Given no receipt limit and an itemized amount of 50.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE, maxExpenseAmountNoItemizedReceipt: 5000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When the receipt rule is switched on at 80.00 and the itemized amount is raised to 100.00
        await toggle(getReceiptToggleLabel());
        setAmount(0, '80.00');
        setAmount(1, '100.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then the itemized amount is raised first, so the new receipt amount lands under it
        expect(mockSetItemized).toHaveBeenCalledWith(policy.id, '100.00', 5000);
        expect(mockSetReceipt).toHaveBeenCalledWith(policy.id, '80.00', CONST.DISABLED_MAX_EXPENSE_VALUE, {});
        expect(wasItemizedSentFirst()).toBe(true);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends the itemized amount first when both rules are switched on together', async () => {
        // Given a workspace that has never set either amount
        const policy = await setupPolicy({});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When both rules are switched on, at 10.00 and 20.00
        await toggle(getReceiptToggleLabel());
        await toggle(getItemizedToggleLabel());
        setAmount(0, '10.00');
        setAmount(1, '20.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then the itemized amount is set first, and neither request claims a previous amount to roll back to
        expect(mockSetItemized).toHaveBeenCalledWith(policy.id, '20.00', undefined);
        expect(mockSetReceipt).toHaveBeenCalledWith(policy.id, '10.00', undefined, {});
        expect(wasItemizedSentFirst()).toBe(true);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends only the receipt amount when the itemized amount is untouched', async () => {
        // Given a receipt amount of 50.00 and an itemized amount of 100.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: 5000, maxExpenseAmountNoItemizedReceipt: 10000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When only the receipt amount is changed
        setAmount(0, '60.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then the itemized amount is left alone
        expect(mockSetReceipt).toHaveBeenCalledWith(policy.id, '60.00', 5000, {});
        expect(mockSetReceipt).toHaveBeenCalledTimes(1);
        expect(mockSetItemized).not.toHaveBeenCalled();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends only the itemized amount when the receipt amount is untouched', async () => {
        // Given a receipt amount of 50.00 and an itemized amount of 100.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: 5000, maxExpenseAmountNoItemizedReceipt: 10000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When only the itemized amount is changed
        setAmount(1, '120.00');
        save();
        await waitForBatchedUpdatesWithAct();

        // Then the receipt amount is left alone
        expect(mockSetItemized).toHaveBeenCalledWith(policy.id, '120.00', 10000);
        expect(mockSetItemized).toHaveBeenCalledTimes(1);
        expect(mockSetReceipt).not.toHaveBeenCalled();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('sends nothing when the rule is saved without any edit', async () => {
        // Given a receipt amount of 50.00 and an itemized amount of 100.00
        const policy = await setupPolicy({maxExpenseAmountNoReceipt: 5000, maxExpenseAmountNoItemizedReceipt: 10000});
        const {unmount} = renderPage(policy.id);
        await waitForForm();

        // When the rule is saved with nothing changed
        save();
        await waitForBatchedUpdatesWithAct();

        // Then neither amount is sent
        expect(mockSetReceipt).not.toHaveBeenCalled();
        expect(mockSetItemized).not.toHaveBeenCalled();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
