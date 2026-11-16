import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import GenericTooltip from '@components/Tooltip/GenericTooltip';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Renders a tooltip with an overlay and a button that opens it, the way a long-press opens the globe tooltip in the Wallet
const renderTooltipWithOverlay = () =>
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <GenericTooltip
                    text="Global reimbursements enabled"
                    shouldUseOverlay
                >
                    {({showTooltip, updateTargetBounds}) => (
                        <PressableWithoutFeedback
                            onPress={() => {
                                updateTargetBounds({x: 0, y: 0, width: 20, height: 20});
                                showTooltip();
                            }}
                            accessibilityLabel="Open tooltip"
                            role={CONST.ROLE.BUTTON}
                        />
                    )}
                </GenericTooltip>
            </PortalProvider>
        </ComposeProviders>,
    );

describe('GenericTooltip', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('shows the overlay again each time the tooltip opens', async () => {
        // Given a tooltip with an overlay that was opened and then closed with a tap on the overlay
        renderTooltipWithOverlay();
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Open tooltip'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByLabelText('Close'));
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByLabelText('Close')).not.toBeOnTheScreen();

        // When the tooltip opens a second time
        fireEvent.press(screen.getByLabelText('Open tooltip'));
        await waitForBatchedUpdatesWithAct();

        // Then the overlay is back, so a tap outside can close the tooltip again
        expect(screen.getByLabelText('Close')).toBeOnTheScreen();
    });
});
