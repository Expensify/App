import {render, screen, within} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import MenuItemWithLabel from '@components/MenuItem/presets/MenuItemWithLabel';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ROW_ACCESSIBILITY_LABEL = 'Assignee, John Doe';
const LABEL_TEXT = 'Assignee';
const VALUE_TEXT = 'John Doe';

describe('MenuItem label placement', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('renders MenuItem.Label inside the row press target, so the label and the value share one lockup', async () => {
        render(
            <OnyxListItemProvider>
                <MenuItem.Root
                    accessibilityLabel={ROW_ACCESSIBILITY_LABEL}
                    onPress={jest.fn()}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.Label>{LABEL_TEXT}</MenuItem.Label>
                            <MenuItem.Title>{VALUE_TEXT}</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItem.Root>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        const row = screen.getByLabelText(ROW_ACCESSIBILITY_LABEL);

        expect(within(row).getByText(LABEL_TEXT)).toBeOnTheScreen();
        expect(within(row).getByText(VALUE_TEXT)).toBeOnTheScreen();
    });

    it('keeps the MenuItemWithLabel preset label outside the row press target', async () => {
        render(
            <OnyxListItemProvider>
                <MenuItemWithLabel
                    label={LABEL_TEXT}
                    accessibilityLabel={ROW_ACCESSIBILITY_LABEL}
                    onPress={jest.fn()}
                >
                    <MenuItem.Row>
                        <MenuItem.Content>
                            <MenuItem.Title>{VALUE_TEXT}</MenuItem.Title>
                        </MenuItem.Content>
                    </MenuItem.Row>
                </MenuItemWithLabel>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        const row = screen.getByLabelText(ROW_ACCESSIBILITY_LABEL);

        expect(screen.getByText(LABEL_TEXT)).toBeOnTheScreen();
        expect(within(row).queryByText(LABEL_TEXT)).toBeNull();
        expect(within(row).getByText(VALUE_TEXT)).toBeOnTheScreen();
    });
});
