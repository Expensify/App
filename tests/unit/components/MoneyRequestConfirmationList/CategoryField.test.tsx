import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import CategoryField from '@components/MoneyRequestConfirmationList/sections/CategoryField';
import type {ExpenseFieldDropdownHandle} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';

import Navigation from '@libs/Navigation/Navigation';
import type {CancelHandle} from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
// Only the anchored dropdowns beta, so the tests that render the plain menu row keep every other beta off.
jest.mock('@hooks/usePermissions', () => () => ({
    isBetaEnabled: (beta: string) => beta === jest.requireActual<{default: typeof CONST}>('@src/CONST').default.BETAS.ANCHORED_FIELD_DROPDOWNS,
}));

let mockIsFocused = true;
// Mirrors `useFocusEffect`: runs the effect while the screen is focused, and again whenever the effect changes.
jest.mock('@react-navigation/native', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
        useIsFocused: () => mockIsFocused,
        useFocusEffect: (effect: () => void | (() => void)) => {
            const isFocused = mockIsFocused;
            useEffect(() => (isFocused ? effect() : undefined), [effect, isFocused]);
        },
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

// Run the post-transition work right away, since no screen actually closes in a unit test.
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: {callback: () => void}): CancelHandle => {
        callback();
        return {cancel: () => {}};
    },
}));

const mockOpenDropdown = jest.fn();
let mockShouldOpenInDropdown: boolean | undefined;
let mockOnLandscapePress: (() => void) | undefined;
jest.mock('@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown', () => {
    const {useImperativeHandle} = jest.requireActual<typeof React>('react');
    const {Pressable, Text} = jest.requireActual<Record<'Pressable' | 'Text', React.ComponentType<{children?: React.ReactNode; onPress?: () => void; role?: string}>>>('react-native');
    return ({
        name,
        onPress,
        onLandscapePress,
        shouldOpenInDropdown,
        ref,
    }: {
        name: string;
        onPress: () => void;
        onLandscapePress: () => void;
        shouldOpenInDropdown: boolean;
        ref?: React.Ref<ExpenseFieldDropdownHandle>;
    }) => {
        mockShouldOpenInDropdown = shouldOpenInDropdown;
        mockOnLandscapePress = onLandscapePress;
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

type ConfirmationIOUType = Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

const renderCategoryField = (isCategoryRequired: boolean, policy: Policy | undefined, iouType: ConfirmationIOUType = CONST.IOU.TYPE.SUBMIT) =>
    render(
        <ConfirmationFieldsProvider
            transactionID={TRANSACTION_ID}
            reportID={REPORT_ID}
            action={CONST.IOU.ACTION.CREATE}
            iouType={iouType}
        >
            <CategoryField
                isCategoryRequired={isCategoryRequired}
                didConfirm={false}
                isReadOnly={false}
                transactionID={TRANSACTION_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={iouType}
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
        // `jest.clearAllMocks()` does not touch this, so a value left by an earlier render could satisfy a later assertion.
        mockShouldOpenInDropdown = undefined;
        mockOnLandscapePress = undefined;
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

    async function givenScanExpense() {
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
        await givenScanExpense();

        // When the confirmation form renders the category row
        renderCategoryField(false, disabledPolicy);

        // Then the row must not say Automatic, because a turned-off workspace never categorizes the receipt
        await waitFor(() => {
            expect(screen.getByText('Travel')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });

    describe('after an upgrade started from the category row', () => {
        const renderDropdownCategoryField = ({
            shouldNavigateToUpgradePath,
            isPolicyLoaded = !shouldNavigateToUpgradePath,
            didConfirm = false,
        }: {
            shouldNavigateToUpgradePath: boolean;
            /** False while the workspace the upgrade created has not reached Onyx yet */
            isPolicyLoaded?: boolean;
            didConfirm?: boolean;
        }) => (
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.TRACK}
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <CategoryField
                        isCategoryRequired={false}
                        didConfirm={didConfirm}
                        isReadOnly={false}
                        transactionID={TRANSACTION_ID}
                        action={CONST.IOU.ACTION.CREATE}
                        iouType={CONST.IOU.TYPE.TRACK}
                        reportID={REPORT_ID}
                        reportActionID={undefined}
                        policy={isPolicyLoaded ? enabledPolicy : undefined}
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
            const {rerender} = render(renderDropdownCategoryField({shouldNavigateToUpgradePath: true}));

            // When the user presses the row, upgrades on the upgrade screen, and comes back to the form
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false}));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false}));

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
            const {rerender} = render(renderDropdownCategoryField({shouldNavigateToUpgradePath: true}));

            // When the user presses the row but closes the upgrade screen without upgrading
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: true}));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: true}));
            await waitForBatchedUpdates();

            // Then nothing opens, because there is still no workspace to pick a category from
            expect(mockOpenDropdown).not.toHaveBeenCalled();
        });

        it('does not open anything once the expense is being confirmed', async () => {
            // Given an expense with no workspace, whose category row sends the user to upgrade
            await givenManualExpense();
            const {rerender} = render(renderDropdownCategoryField({shouldNavigateToUpgradePath: true}));

            // When the user upgrades, comes back, and presses Submit before the list gets to open
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false}));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false, didConfirm: true}));
            await waitForBatchedUpdates();

            // Then the list is not asked to open: the row would refuse and push the full-page Category step over a
            // confirming expense instead
            expect(mockOpenDropdown).not.toHaveBeenCalled();
            expect(jest.mocked(Navigation.navigate)).toHaveBeenCalledTimes(1);
        });

        it('forgets the upgrade once the user leaves the form again', async () => {
            // Given an expense with no workspace, whose category row sends the user to upgrade
            await givenManualExpense();
            const {rerender} = render(renderDropdownCategoryField({shouldNavigateToUpgradePath: true}));

            // When the user upgrades and comes back before the new workspace has landed, then visits another step
            // and returns once it has
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false, isPolicyLoaded: false}));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false, isPolicyLoaded: false}));
            mockIsFocused = false;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false}));
            mockIsFocused = true;
            rerender(renderDropdownCategoryField({shouldNavigateToUpgradePath: false}));
            await waitForBatchedUpdates();

            // Then the list stays closed: the return from the upgrade is the only focus that may open it, not a
            // later one the user never pressed Category for
            expect(mockOpenDropdown).not.toHaveBeenCalled();
        });
    });

    it('opens the list in place for a draft workspace, whose categories only exist as drafts', async () => {
        // Given an expense on the draft workspace "Submit to my employer" creates, which stores its categories only as drafts
        await givenManualExpense();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES_DRAFT}${enabledPolicy.id}`, {Travel: {name: 'Travel', enabled: true}});
        await waitForBatchedUpdates();

        // When the confirmation form renders the category row for that flow, which submits rather than creates, so
        // nothing but the draft categories can make the row open in place
        render(
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.SUBMIT}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <CategoryField
                        isCategoryRequired={false}
                        didConfirm={false}
                        isReadOnly={false}
                        transactionID={TRANSACTION_ID}
                        action={CONST.IOU.ACTION.SUBMIT}
                        iouType={CONST.IOU.TYPE.SUBMIT}
                        reportID={REPORT_ID}
                        reportActionID={undefined}
                        policy={enabledPolicy}
                        formError=""
                        shouldNavigateToUpgradePath={false}
                        shouldSelectPolicy={false}
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>,
        );

        // Then the row opens its list in place, because the draft categories count as categories to pick from
        await waitFor(() => {
            expect(mockShouldOpenInDropdown).toBe(true);
        });
    });

    describe('while creating an expense', () => {
        const renderCreateCategoryField = ({policy, shouldSelectPolicy}: {policy: Policy | undefined; shouldSelectPolicy: boolean}) => (
            <ConfirmationFieldsProvider
                transactionID={TRANSACTION_ID}
                reportID={REPORT_ID}
                action={CONST.IOU.ACTION.CREATE}
                iouType={CONST.IOU.TYPE.SUBMIT}
            >
                <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                    <CategoryField
                        isCategoryRequired={false}
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
                        shouldSelectPolicy={shouldSelectPolicy}
                    />
                </ExpenseFormLayoutContext.Provider>
            </ConfirmationFieldsProvider>
        );

        beforeEach(() => {
            mockIsFocused = true;
            jest.clearAllMocks();
        });

        it('opens the list in place even before the workspace categories are loaded', async () => {
            // Given a workspace whose categories have not reached Onyx yet, which the list loads on its own
            await givenManualExpense();

            // When the confirmation form renders the category row
            render(renderCreateCategoryField({policy: enabledPolicy, shouldSelectPolicy: false}));

            // Then the row still opens its list in place rather than the full-page Category step
            await waitFor(() => {
                expect(mockShouldOpenInDropdown).toBe(true);
            });
        });

        it('opens the list in place once the user is back from picking a default workspace', async () => {
            // Given a member of several workspaces who has not picked a default one yet
            await givenManualExpense();
            const {rerender} = render(renderCreateCategoryField({policy: undefined, shouldSelectPolicy: true}));

            // When the user presses the row, picks a workspace, and comes back to the form
            fireEvent.press(screen.getByText('common.category'));
            mockIsFocused = false;
            rerender(renderCreateCategoryField({policy: enabledPolicy, shouldSelectPolicy: false}));
            mockIsFocused = true;
            rerender(renderCreateCategoryField({policy: enabledPolicy, shouldSelectPolicy: false}));

            // Then the workspace picker is opened without a destination, so it returns here, and the list opens in place
            expect(jest.mocked(Navigation.navigate)).toHaveBeenCalledWith(ROUTES.SET_DEFAULT_WORKSPACE.getRoute());
            await waitFor(() => {
                expect(mockOpenDropdown).toHaveBeenCalledTimes(1);
            });
        });

        it('opens the category page marked to close itself in portrait when the phone is in landscape', async () => {
            // Given a category row whose list would open in place, on a phone held in landscape
            await givenManualExpense();
            render(renderCreateCategoryField({policy: enabledPolicy, shouldSelectPolicy: false}));
            await waitFor(() => {
                expect(mockOnLandscapePress).toBeDefined();
            });

            // When the row hands over to the full page because there is no room for the sheet
            mockOnLandscapePress?.();

            // Then the Category step opens for this expense, flagged so it goes back to the form, and its list, in portrait
            const route = jest.mocked(Navigation.navigate).mock.calls.at(0)?.at(0);
            expect(route).toContain('category');
            expect(route).toContain(`transactionID=${TRANSACTION_ID}`);
            expect(route).toContain('shouldCloseInPortrait=true');
        });
    });

    it('does not promise an automatic category on an invoice', async () => {
        // Given a manual invoice on a workspace that categorizes new expenses
        await givenManualExpense();

        // When the confirmation form renders an optional category row for an invoice
        renderCategoryField(false, enabledPolicy, CONST.IOU.TYPE.INVOICE);

        // Then the row must not say Automatic, because invoices are never auto-categorized
        await waitFor(() => {
            expect(screen.getByText('Meals')).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
    });

    it.each([
        ['manual', givenManualExpense, 'Meals'],
        ['scan', givenScanExpense, 'Travel'],
    ])('does not promise an automatic category on a %s track expense without a workspace', async (_, givenExpense, category) => {
        // Given a track expense that isn't tied to any workspace
        await givenExpense();

        // When the confirmation form renders the category row with no policy
        renderCategoryField(false, undefined, CONST.IOU.TYPE.TRACK);

        // Then the row must not say Automatic, because categorization only runs on a workspace
        await waitFor(() => {
            expect(screen.getByText(category)).toBeOnTheScreen();
        });
        expect(screen.queryByText('common.automatic')).toBeNull();
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
