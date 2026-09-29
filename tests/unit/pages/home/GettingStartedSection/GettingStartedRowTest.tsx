import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import GettingStartedRow from '@src/pages/home/GettingStartedSection/GettingStartedRow';
import type {GettingStartedItem} from '@src/pages/home/GettingStartedSection/hooks/useGettingStartedItems';
import ROUTES from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../../../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => {
            if (key === 'homePage.gettingStartedSection.begin') {
                return 'Begin';
            }
            if (key === 'homePage.gettingStartedSection.done') {
                return 'Done';
            }
            return key;
        }),
    })),
);

const TEST_ROUTE = ROUTES.WORKSPACE_OVERVIEW.getRoute('ABC123');

const INCOMPLETE_ITEM: GettingStartedItem = {
    key: 'linkCompanyCards',
    label: 'Link company cards',
    subText: 'Import expenses automatically',
    isComplete: false,
    route: TEST_ROUTE,
};

const COMPLETE_ITEM: GettingStartedItem = {
    key: 'createWorkspace',
    label: 'Create a workspace',
    subText: 'Ready to configure expenses',
    isComplete: true,
    route: TEST_ROUTE,
};

const renderRow = (item: GettingStartedItem) =>
    render(
        <OnyxListItemProvider>
            <GettingStartedRow item={item} />
        </OnyxListItemProvider>,
    );

describe('GettingStartedRow', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('incomplete step', () => {
        it('renders the label and sub-text', () => {
            renderRow(INCOMPLETE_ITEM);

            expect(screen.getByText('Link company cards')).toBeOnTheScreen();
            expect(screen.getByText('Import expenses automatically')).toBeOnTheScreen();
        });

        it('renders a green (success) Begin button and no Done badge', () => {
            const {UNSAFE_root: unsafeRoot} = renderRow(INCOMPLETE_ITEM);

            expect(screen.getByText('Begin')).toBeOnTheScreen();
            expect(screen.queryByText('Done')).not.toBeOnTheScreen();

            const successButtons = unsafeRoot.findAll((node) => !!node.props && (node.props as {variant?: unknown}).variant === 'success');
            expect(successButtons.length).toBeGreaterThan(0);
        });

        it('renders an unchecked checkbox', () => {
            renderRow(INCOMPLETE_ITEM);

            expect(screen.getByRole('checkbox')).not.toBeChecked();
        });

        it('navigates to the item route when the Begin button is pressed', () => {
            renderRow(INCOMPLETE_ITEM);

            fireEvent.press(screen.getByText('Begin'));

            expect(Navigation.navigate).toHaveBeenCalledWith(TEST_ROUTE);
        });
    });

    describe('completed step', () => {
        it('renders a Done badge and no Begin button', () => {
            renderRow(COMPLETE_ITEM);

            expect(screen.getByText('Done')).toBeOnTheScreen();
            expect(screen.queryByText('Begin')).not.toBeOnTheScreen();
        });

        it('renders a checked checkbox', () => {
            renderRow(COMPLETE_ITEM);

            expect(screen.getByRole('checkbox')).toBeChecked();
        });
    });
});
