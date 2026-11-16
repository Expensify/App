/** Guards illustration colors and text slots during MenuItem migration. */
import {fireEvent, render, screen} from '@testing-library/react-native';

import Icon from '@components/Icon';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';

import BankAccountPurpose from '@pages/settings/Wallet/BankAccountPurposePage/substeps/BankAccountPurpose';
import CardTypeStep from '@pages/workspace/expensifyCard/issueNew/CardTypeStep';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/Icon', () => jest.fn(() => null));
jest.mock(
    '@components/InteractiveStepWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageOfflineBlockingView',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: PropsWithChildren) =>
            children,
);
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

describe('Illustrated composable menu rows', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(async () => {
        jest.clearAllMocks();
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
                <CardTypeStep
                    policy={undefined}
                    stepNames={[]}
                    startStepIndex={0}
                />
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
});
