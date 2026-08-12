import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {ProfileNavigatorParamList} from '@libs/Navigation/types';

import ProfilePage from '@pages/ProfilePage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act} from 'react';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Surface the HTML that MenuItem hands to RenderHTML so the test can assert the prompt was parsed as markdown.
jest.mock('@components/RenderHTML', () => {
    const ReactMock = require('react') as typeof React;
    const {Text} = require('react-native') as {Text: React.ComponentType<{children?: React.ReactNode}>};

    return ({html}: {html: string}) => ReactMock.createElement(Text, null, html);
});

const CURRENT_USER_ACCOUNT_ID = 1;
const AGENT_ACCOUNT_ID = 123;

const Stack = createPlatformStackNavigator<ProfileNavigatorParamList>();

describe('ProfilePage - agent custom instructions', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});

        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, 'en' as const);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    async function setUpAgent(prompt: string) {
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, 'user@expensify.com');

        const personalDetails: PersonalDetailsList = {
            [CURRENT_USER_ACCOUNT_ID]: {
                accountID: CURRENT_USER_ACCOUNT_ID,
                login: 'user@expensify.com',
                displayName: 'user@expensify.com',
            } as PersonalDetails,
            [AGENT_ACCOUNT_ID]: {
                accountID: AGENT_ACCOUNT_ID,
                login: `testbot_${AGENT_ACCOUNT_ID}@expensify.ai`,
                displayName: 'Test Agent',
                isCustomAgent: true,
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${AGENT_ACCOUNT_ID}`, {prompt, pendingAction: null});
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        render(
            <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider, DelegateNoAccessModalProvider]}>
                <PortalProvider>
                    <NavigationContainer ref={navigationRef}>
                        <Stack.Navigator>
                            <Stack.Screen
                                name={SCREENS.DYNAMIC_PROFILE}
                                component={ProfilePage}
                                initialParams={{accountID: String(AGENT_ACCOUNT_ID)}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </PortalProvider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
    }

    it('renders the prompt markdown as formatted HTML', async () => {
        await setUpAgent('Reject *gambling* expenses.');

        expect(screen.getByText('<comment>Reject <strong>gambling</strong> expenses.</comment>')).toBeDefined();
    });

    it('decodes the stored prompt before parsing it', async () => {
        // The prompt is stored HTML-encoded, so an undecoded entity would be escaped again and shown to the user verbatim.
        await setUpAgent('Reject *Bob&#39;s* expenses.');

        expect(screen.getByText('<comment>Reject <strong>Bob&#x27;s</strong> expenses.</comment>')).toBeDefined();
    });
});
