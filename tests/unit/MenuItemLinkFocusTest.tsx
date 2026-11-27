import {fireEvent, render, screen} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const ROW_LABEL = 'Preferences';

// A mouse click has a click count in detail, while Enter on a link fires a click with detail 0
function pressRow(detail: number) {
    const target = document.createElement('a');
    const blur = jest.spyOn(target, 'blur');
    fireEvent.press(screen.getByLabelText(ROW_LABEL), {type: 'click', detail, currentTarget: target, nativeEvent: {button: 0}, preventDefault: jest.fn()});
    return blur;
}

function renderLegacyRow(onPress: () => void) {
    render(
        <OnyxListItemProvider>
            {/* eslint-disable-next-line @typescript-eslint/no-deprecated -- The settings sidebar rows still render the legacy MenuItem, so its focus handling needs coverage too. */}
            <MenuItem
                title={ROW_LABEL}
                accessibilityLabel={ROW_LABEL}
                linkRoute={ROUTES.SETTINGS_PREFERENCES}
                onPress={onPress}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            />
        </OnyxListItemProvider>,
    );
}

function renderCompoundRow(onPress: () => void) {
    render(
        <OnyxListItemProvider>
            <MenuItem.Root
                accessibilityLabel={ROW_LABEL}
                linkRoute={ROUTES.SETTINGS_PREFERENCES}
                onPress={onPress}
                sentryLabel={CONST.SENTRY_LABEL.TEST.LABEL}
            >
                <MenuItem.Row>
                    <MenuItem.Content>
                        <MenuItem.Title>{ROW_LABEL}</MenuItem.Title>
                    </MenuItem.Content>
                </MenuItem.Row>
            </MenuItem.Root>
        </OnyxListItemProvider>,
    );
}

describe.each([
    ['MenuItem', renderLegacyRow],
    ['MenuItem.Root', renderCompoundRow],
])('%s rendered as a link', (_name, renderRow) => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    it('keeps focus on the row when Enter activates it', async () => {
        // Given a linked row, which is an anchor on web, so Enter fires a click on it
        const onPress = jest.fn();
        renderRow(onPress);
        await waitForBatchedUpdatesWithAct();

        // When the row is activated with the keyboard
        const blur = pressRow(0);

        // Then the row still runs its action but keeps focus, so keyboard users can continue from it
        expect(onPress).toHaveBeenCalled();
        expect(blur).not.toHaveBeenCalled();
    });

    it('drops focus from the row after a mouse click', async () => {
        // Given a linked row
        const onPress = jest.fn();
        renderRow(onPress);
        await waitForBatchedUpdatesWithAct();

        // When the row is clicked with the mouse
        const blur = pressRow(1);

        // Then the row loses focus, so it doesn't keep a focus outline after the click
        expect(onPress).toHaveBeenCalled();
        expect(blur).toHaveBeenCalled();
    });
});
