import {cleanup, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import UpgradeConfirmation from '@pages/workspace/upgrade/UpgradeConfirmation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type ReactNative from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockRenderedHTML: string[] = [];

jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');

    return ({html}: {html: string}) => {
        mockRenderedHTML.push(html);
        const plainText = html.replaceAll(/<[^>]*>/g, '');
        return ReactMock.createElement(Text, null, plainText);
    };
});

const renderConfirmation = (planName?: string, policyName = 'MyWorkspace') => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, HTMLEngineProvider]}>
            <NavigationContainer>
                <UpgradeConfirmation
                    policyName={policyName}
                    planName={planName}
                    afterUpgradeAcknowledged={() => {}}
                    confirmSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.UPGRADE.CONFIRMATION_GOT_IT}
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
        mockRenderedHTML.length = 0;
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

    it('renders markup in the workspace name as literal text instead of HTML', async () => {
        // Given a workspace name that an admin set to contain HTML markup and special characters
        const maliciousName = '<a href="https://example.com">Click</a><img src="https://example.com/x.png"/> & "Co"';

        // When the confirmation renders for that workspace
        renderConfirmation('Control', maliciousName);
        await waitForBatchedUpdatesWithAct();

        // Then the name reaches the HTML renderer encoded, so it adds no link, image or styling and its characters still display as typed
        const html = mockRenderedHTML.at(-1) ?? '';
        expect(html).toContain('&lt;a href=&quot;https://example.com&quot;&gt;Click&lt;/a&gt;&lt;img src=&quot;https://example.com/x.png&quot;/&gt; &amp; &quot;Co&quot;');
        expect(html).not.toContain('<a href="https://example.com">');
        expect(html).not.toContain('<img');
    });
});
