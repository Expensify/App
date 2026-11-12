/** Guards illustration colors and the locked expense-default trailing icon during MenuItem migration. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import ThemeProvider from '@components/ThemeProvider';

import {hasSelectableCategoryTaxRate} from '@libs/CategoryTaxRulesUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import BankAccountPurpose from '@pages/settings/Wallet/BankAccountPurposePage/substeps/BankAccountPurpose';
import CardTypeStep from '@pages/workspace/expensifyCard/issueNew/CardTypeStep';
import ExpenseDefaultTypePage from '@pages/workspace/rules/MerchantRules/ExpenseDefaultTypePage';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockShowConfirmModal = jest.fn();

jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock('@components/InteractiveStepWrapper', () => ({children}: PropsWithChildren) => children);
jest.mock('@components/ScreenWrapper', () => ({children}: PropsWithChildren) => children);
jest.mock('@components/ScrollView', () => ({children}: PropsWithChildren) => children);
jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => ({children}: PropsWithChildren) => children);
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({children}: PropsWithChildren) => children);
jest.mock('@components/Header/composed/HeaderWithBackButtonAndTitle', () => () => null);
jest.mock('@hooks/usePolicy', () => () => undefined);
jest.mock('@hooks/useConfirmModal', () => () => ({showConfirmModal: mockShowConfirmModal}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/CategoryTaxRulesUtils', () => ({hasUsableTaxRates: () => false, hasSelectableCategoryTaxRate: jest.fn(() => false)}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (callback: () => void) => callback}));

function assertLeadingIllustrations(count: number, size: number) {
    const leadingCells = screen.UNSAFE_getAllByType(MenuItem.Leading);
    expect(leadingCells).toHaveLength(count);
    for (const cell of leadingCells) {
        const [illustration] = cell.findAll((node) => node.type === Icon);
        expect(illustration).toBeDefined();
        expect(illustration.props.fill).toBeUndefined();
        expect(illustration.props.width).toBe(size);
        expect(illustration.props.height).toBe(size);
    }
}

type ExpenseDefaultTypeProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_EXPENSE_DEFAULT_TYPE>;

function renderExpenseDefaults() {
    const props = createMock<ExpenseDefaultTypeProps>({route: {key: 'expense-defaults', name: SCREENS.WORKSPACE.RULES_EXPENSE_DEFAULT_TYPE, params: {policyID: '1'}}});
    return render(
        <ThemeProvider theme={CONST.THEME.DARK}>
            <LocaleContextProvider>
                <ExpenseDefaultTypePage {...props} />
            </LocaleContextProvider>
        </ThemeProvider>,
    );
}

describe('Illustrated composable menu rows', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(hasSelectableCategoryTaxRate).mockReturnValue(false);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('preserves the two bank-purpose illustrations and the payments callback', () => {
        // Given the bank-purpose choices with their existing country-selection callback.
        const showCountrySelectionStep = jest.fn();
        render(
            <LocaleContextProvider>
                <BankAccountPurpose showCountrySelectionStep={showCountrySelectionStep} />
            </LocaleContextProvider>,
        );

        // When the two choices are composed and Make payments is pressed.
        assertLeadingIllustrations(2, variables.menuIconSize);
        const roots = screen.UNSAFE_getAllByType(MenuItem.Root);
        fireEvent.press(roots[1], {nativeEvent: {}});

        // Then original colors/sizing, both chevrons, and the selection callback are retained.
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(2);
        expect(showCountrySelectionStep).toHaveBeenCalledTimes(1);
    });

    it('preserves physical and virtual card illustrations and text slots', () => {
        // Given the card-type step before a card type is selected.
        render(
            <LocaleContextProvider>
                <CardTypeStep policy={undefined} stepNames={[]} startStepIndex={0} />
            </LocaleContextProvider>,
        );

        // When both card choices are rendered.
        assertLeadingIllustrations(2, variables.menuIconSize);

        // Then each retains its title, description, and chevron without forcing an illustration fill.
        expect(screen.UNSAFE_getAllByType(MenuItem.Title)).toHaveLength(2);
        expect(screen.UNSAFE_getAllByType(MenuItem.Description)).toHaveLength(2);
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(2);
        const roots = screen.UNSAFE_getAllByType(MenuItem.Root);
        expect(roots[0].props.sentryLabel).toBe(CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_TYPE_PHYSICAL);
        expect(roots[1].props.sentryLabel).toBe(CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_TYPE_VIRTUAL);
    });

    it('replaces the locked Category chevron with a Lock and keeps its explainer pressable', () => {
        // Given a workspace without selectable category tax rates.
        renderExpenseDefaults();

        // When the locked Category choice is pressed.
        assertLeadingIllustrations(2, variables.iconSizeExtraLarge);
        const category = screen.UNSAFE_getAllByType(MenuItem.Root)[1];
        fireEvent.press(category, {nativeEvent: {}});

        // Then only Merchant has a chevron, and Category opens its existing explainer rather than navigating.
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(1);
        const [trailingLock] = screen.UNSAFE_getAllByType(MenuItem.Trailing)[1].findAll((node) => node.type === Icon);
        expect(trailingLock.props.width).toBe(variables.iconSizeNormal);
        const [themedChevronIcon] = screen.UNSAFE_getByType(MenuItem.Chevron).findAll((node) => node.type === Icon);
        expect(trailingLock.props.fill).toBeDefined();
        expect(trailingLock.props.fill).toBe(themedChevronIcon.props.fill);
        expect(mockShowConfirmModal).toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows two chevrons when the Category option is unlocked', () => {
        // Given a workspace with a selectable tax rate.
        jest.mocked(hasSelectableCategoryTaxRate).mockReturnValue(true);

        // When expense-default choices are rendered and Category is selected.
        renderExpenseDefaults();
        fireEvent.press(screen.UNSAFE_getAllByType(MenuItem.Root)[1], {nativeEvent: {}});

        // Then no locked replacement remains, and the existing editor route opens.
        expect(screen.UNSAFE_getAllByType(MenuItem.Chevron)).toHaveLength(2);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_MERCHANT_NEW.getRoute('1'));
    });
});
