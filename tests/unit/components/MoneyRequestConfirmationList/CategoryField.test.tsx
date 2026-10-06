import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import CategoryField from '@components/MoneyRequestConfirmationList/sections/CategoryField';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../../utils/collections/policies';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

jest.mock('@components/MenuItemWithTopDescription', () => {
    const {Text} = jest.requireActual<Record<'Text', React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title, description, rightLabel}: {title?: string; description?: string; rightLabel?: string}) => (
        <>
            <Text>{description}</Text>
            <Text>{title}</Text>
            {rightLabel ? <Text>{rightLabel}</Text> : null}
        </>
    );
});

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => true}));

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

// Run the post-transition work right away, since no screen actually closes in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: {callback: () => void}) => {
        callback();
        return {cancel: () => {}};
    },
}));

const mockOpenDropdown = jest.fn();
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; role?: string}>>>('react-native');
    return ({name, onPress, ref}: {name: string; onPress: () => void; ref?: React.Ref<{open: () => void}>}) => {
        useImperativeHandle(ref, () => ({open: mockOpenDropdown}));
        return (
            <Pressable
                role="button"
                onPress={onPress}
            >
                <Text>{name}</Text>
            </Pressable>
        );
    };
});

const TRANSACTION_ID = '1';
const REPORT_ID = 'reportID';

const disabledPolicy: Policy = {...createRandomPolicy(1), autoCategorizeNewExpenses: false};
const enabledPolicy: Policy = {...createRandomPolicy(1), autoCategorizeNewExpenses: true};

const renderCategoryField = (isCategoryRequired: boolean, policy: Policy | undefined) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
        >
            <CategoryField
                isCategoryRequired={isCategoryRequired}
                didConfirm={false}
                isReadOnly={false}
                transactionID={TRANSACTION_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
                reportID={REPORT_ID}
                reportActionID={undefined}
                policy={policy}
                formError=""
                shouldNavigateToUpgradePath={false}
                shouldSelectPolicy={false}
            />
        </ConfirmationFieldsProvider>,
    );

describe('CategoryField', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    async function givenManualExpense() {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            amount: 1000,
            currency: 'USD',
            merchant: 'Cafe',
            created: '2026-01-15',
            category: 'Meals',
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
        });
        await waitForBatchedUpdates();
    }

    it('does not promise an automatic category when the workspace turned auto-categorization off', async () => {
        // Given a manual expense on a workspace that will not categorize it
        await givenManualExpense();

        // When the confirmation form renders the category row and category is optional
        renderCategoryField(false, disabledPolicy);

        // Then the row must not say Automatic, because nothing will fill the category
        await waitFor(() => {
            expect(screen.getByText('Meals')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });

    it('promises an automatic category on a manual expense when auto-categorization is on', async () => {
        // Given a manual expense on a workspace that categorizes new expenses
        await givenManualExpense();

        // When the confirmation form renders an optional category row
        renderCategoryField(false, enabledPolicy);

        // Then the row promises the category the workspace will pick once the expense is created
        await waitFor(() => {
            expect(screen.getByText('common.automatic')).toBeOnTheScreen();
        });
    });

    it('still promises an automatic category when the workspace has never stored the setting', async () => {
        // Given a manual expense on a workspace that has not touched the setting, which defaults to on
        await givenManualExpense();

        // When the confirmation form renders an optional category row
        renderCategoryField(false, createRandomPolicy(1));

        // Then the row keeps the Automatic promise the setting's default implies
        await waitFor(() => {
            expect(screen.getByText('common.automatic')).toBeOnTheScreen();
        });
    });

    it('does not promise an automatic category on a scan when auto-categorization is off', async () => {
        // Given a scan whose workspace will not categorize the receipt
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            amount: 0,
            currency: 'USD',
            merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
            created: '2026-01-15',
            category: 'Travel',
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {receiptID: 1, source: 'source', state: CONST.IOU.RECEIPT_STATE.SCAN_READY},
        });
        await waitForBatchedUpdates();

        // When the confirmation form renders the category row
        renderCategoryField(false, disabledPolicy);

        // Then the row must not say Automatic, because a turned-off workspace never categorizes the receipt
        await waitFor(() => {
            expect(screen.getByText('Travel')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });

    describe('after an upgrade started from the category row', () => {
        const renderDropdownCategoryField = (shouldNavigateToUpgradePath: boolean) => (
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.TRACK}
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <CategoryField
                        isCategoryRequired={false}
                        didConfirm={false}
                        isReadOnly={false}
                        transactionID={TRANSACTION_ID}
                        action={CONST.IOU.ACTION.CREATE}
                        iouType={CONST.IOU.TYPE.TRACK}
                        reportID={REPORT_ID}
                        reportActionID={undefined}
                        policy={shouldNavigateToUpgradePath ? undefined : enabledPolicy}
                        formError=""
                        shouldNavigateToUpgradePath={shouldNavigateToUpgradePath}
                        shouldSelectPolicy={false}
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>
        );

        beforeEach(() => {
            mockIsFocused = true;
            jest.clearAllMocks();
        });

        it('opens the category list in place once the user is back with a workspace', async () => {
            // Given an expense with no workspace, whose category row sends the user to upgrade
            await givenManualExpense();
            const {rerender} = render(renderDropdownCategoryField(true));

            // When the user presses the row, upgrades on the upgrade screen, and comes back to the form
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField(false));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField(false));

            // Then the upgrade screen is told to return to the form rather than open the full-page Category step,
            // and the form opens the anchored list itself, so the user lands where they were heading
            expect(jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0)).toContain('shouldReturnToConfirmation=true');
            await waitFor(() => {
                expect(mockOpenDropdown).toHaveBeenCalledTimes(1);
            });
        });

        it('does not open the category list when the user backs out of the upgrade', async () => {
            // Given an expense with no workspace, whose category row sends the user to upgrade
            await givenManualExpense();
            const {rerender} = render(renderDropdownCategoryField(true));

            // When the user presses the row but closes the upgrade screen without upgrading
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField(true));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField(true));
            await waitForBatchedUpdates();

            // Then nothing opens, because there is still no workspace to pick a category from
            expect(mockOpenDropdown).not.toHaveBeenCalled();
        });
    });

    it('shows Required instead of Automatic when the category is required and auto-categorization is off', async () => {
        // Given a manual expense whose workspace both requires a category and will not pick one
        await givenManualExpense();

        // When the confirmation form renders the category row
        renderCategoryField(true, disabledPolicy);

        // Then the row asks the user for a category rather than promising one
        await waitFor(() => {
            expect(screen.getByText('common.required')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });
});
