import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import UpgradeIntroView from '@pages/workspace/upgrade/UpgradeIntroView';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// RenderHTML needs the HTML engine provider that this isolated render doesn't set up; the note/plan
// copy it renders isn't what we're asserting here, so stub it out.
jest.mock('@components/RenderHTML', () => () => null);

const DummyIllustration = (() => null) as IconAsset;

function renderView(props: Partial<React.ComponentProps<typeof UpgradeIntroView>> = {}) {
    return render(
        <OnyxListItemProvider>
            <UpgradeIntroView
                title="Some features require a Control plan"
                description="Upgrade these workspaces to continue."
                buttonText="Upgrade"
                onUpgrade={jest.fn()}
                {...props}
            />
        </OnyxListItemProvider>,
    );
}

describe('UpgradeIntroView', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('renders the title, description and primary button, and fires onUpgrade when pressed', async () => {
        const onUpgrade = jest.fn();
        renderView({onUpgrade});
        await waitForBatchedUpdates();

        expect(screen.getByText('Some features require a Control plan')).toBeTruthy();
        expect(screen.getByText('Upgrade these workspaces to continue.')).toBeTruthy();

        fireEvent.press(screen.getByTestId('upgrade-button'));
        expect(onUpgrade).toHaveBeenCalledTimes(1);
    });

    it('renders the illustration icon variant without crashing', async () => {
        renderView({iconSrc: DummyIllustration, isIllustration: true, onlyAvailableOnPlanHTML: '<muted-text>Only on Control</muted-text>'});
        await waitForBatchedUpdates();

        expect(screen.getByText('Some features require a Control plan')).toBeTruthy();
        expect(screen.getByTestId('upgrade-button')).toBeTruthy();
    });

    it('disables the primary button when buttonDisabled is set', async () => {
        renderView({buttonDisabled: true});
        await waitForBatchedUpdates();

        const button = screen.getByTestId('upgrade-button');
        const {accessibilityState} = button.props as {accessibilityState?: {disabled?: boolean}};
        expect(accessibilityState?.disabled).toBe(true);
    });
});
