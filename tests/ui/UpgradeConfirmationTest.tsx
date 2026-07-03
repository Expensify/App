import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';

import ONYXKEYS from '@src/ONYXKEYS';

import {NavigationContainer} from '@react-navigation/native';
import {cleanup, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => {
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

const renderConfirmation = (planName?: string) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <NavigationContainer>
                <UpgradeConfirmation
                    policyName="MyWorkspace"
                    planName={planName}
                    afterUpgradeAcknowledged={() => {}}
                />
            </NavigationContainer>
        </ComposeProviders>,
    );
};

describe('UpgradeConfirmation', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('shows the Collect plan in the success message when upgrading to Collect', async () => {
        // When the confirmation renders for a workspace upgraded to the Collect plan
        renderConfirmation('Collect');
        await waitForBatchedUpdatesWithAct();

        // Then the success message reflects the Collect plan
        expect(await screen.findByText('to the Collect plan', {exact: false})).toBeTruthy();
    });

    it('shows the Control plan in the success message when upgrading to Control', async () => {
        // When the confirmation renders for a workspace upgraded to the Control plan
        renderConfirmation('Control');
        await waitForBatchedUpdatesWithAct();

        // Then the success message reflects the Control plan
        expect(await screen.findByText('to the Control plan', {exact: false})).toBeTruthy();
    });

    it('defaults to the Control plan when no plan name is provided', async () => {
        // When the confirmation renders without a plan name
        renderConfirmation();
        await waitForBatchedUpdatesWithAct();

        // Then the success message defaults to the Control plan
        expect(await screen.findByText('to the Control plan', {exact: false})).toBeTruthy();
    });
});
