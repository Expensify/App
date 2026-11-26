/** Individual rule rows retain their summaries, read-only presentation and navigation. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';

import Navigation from '@libs/Navigation/Navigation';
import {tryNavigateToControlPolicyUpgrade} from '@libs/PolicyUtils';

import IndividualExpenseRulesSectionRevamp from '@pages/workspace/rules/IndividualExpenseRulesSectionRevamp';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

let mockPolicy: Policy;
jest.mock('@hooks/usePolicy', () => () => mockPolicy);
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({withReadOnlyFallback: (callback: () => void) => callback}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: () => '$50.00'})}));
jest.mock('@libs/actions/Policy/Tag', () => ({openPolicyTagsPage: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    tryNavigateToControlPolicyUpgrade: jest.fn(() => true),
}));
jest.mock('@userActions/Session', () => ({callIfAuthenticated: (callback: () => void) => callback}));
jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => () => null);
jest.mock('@pages/workspace/rules/PublicReceiptVisibilityToggle', () => () => null);

const policyID = 'rule-rows';
const title = 'workspace.rules.generalTab.expensesAboveAmount';
const pressEvent = {nativeEvent: {}};

beforeEach(() => {
    jest.clearAllMocks();
    mockPolicy = createMock<Policy>({id: policyID, type: CONST.POLICY.TYPE.CORPORATE, maxExpenseAmount: 5000});
});

it('keeps the summary in the accessible name and opens the existing rule editor', () => {
    // Given an admin can edit individual expense rules.
    render(
        <IndividualExpenseRulesSectionRevamp
            policyID={policyID}
            canWriteRules
        />,
    );

    // When the maximum-amount row is pressed.
    fireEvent.press(screen.getByRole('button', {name: `${title}, $50.00`}), pressEvent);

    // Then its summary is retained and navigation reaches the same editor.
    expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID));
});

it('keeps read-only rows enabled but without edit buttons or chevrons', () => {
    // Given a member who cannot write rules.
    render(
        <IndividualExpenseRulesSectionRevamp
            policyID={policyID}
            canWriteRules={false}
        />,
    );

    // When the readable amount summary is pressed.
    const row = screen.getByLabelText(`${title}, $50.00`);
    fireEvent.press(row, pressEvent);

    // Then read-only facts are not dimmed disabled controls and do not navigate.
    expect(row).toBeEnabled();
    expect(screen.queryByRole('button', {name: `${title}, $50.00`})).toBeNull();
    expect(screen.UNSAFE_queryAllByType(MenuItem.Chevron)).toHaveLength(0);
    expect(Navigation.navigate).not.toHaveBeenCalled();
});

it('retains the Control upgrade destination for a Collect workspace', () => {
    // Given an editable Collect workspace whose amount rule requires Control.
    mockPolicy.type = CONST.POLICY.TYPE.TEAM;
    render(
        <IndividualExpenseRulesSectionRevamp
            policyID={policyID}
            canWriteRules
        />,
    );

    // When its maximum-amount row is pressed.
    fireEvent.press(screen.getByRole('button', {name: `${title}, $50.00`}), pressEvent);

    // Then the upgrade handler keeps the requested editor as the return destination.
    expect(tryNavigateToControlPolicyUpgrade).toHaveBeenCalledWith(mockPolicy, CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.alias, ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute(policyID));
    expect(Navigation.navigate).not.toHaveBeenCalled();
});
