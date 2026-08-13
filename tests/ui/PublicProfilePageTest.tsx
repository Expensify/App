import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import DelegateNoAccessModalProvider from '@components/DelegateNoAccessModalProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';

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
import React, {act} from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Render the HTML that MenuItem produces as the plain text a user would see, so tests can assert on what is displayed.
jest.mock('@components/RenderHTML', () => {
    const ReactMock = jest.requireActual<typeof React>('react');
    const {Text: RNText} = jest.requireActual<{Text: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
    const {Str} = jest.requireActual<{Str: {htmlDecode: (text: string) => string}}>('expensify-common');

    return jest.fn(({html}: {html: string}) => ReactMock.createElement(RNText, null, Str.htmlDecode(html.replaceAll(/<[^>]*>/g, ''))));
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

    // The prompt is stored HTML-encoded, so it has to be decoded before it is parsed, otherwise entities are escaped again and shown verbatim.
    it.each([
        ['parses markdown', 'Reject *gambling* expenses.', 'Reject gambling expenses.'],
        ['decodes HTML entities', 'Reject Bob&#39;s expenses.', "Reject Bob's expenses."],
        // CONST.AGENT_PROMPT_LIMIT is 300; expensify-common's truncateHTML keeps exactly 300 characters before appending the ellipsis.
        ['truncates content exceeding the character limit', 'A'.repeat(320), `${'A'.repeat(300)}...`],
    ])('%s in the custom instructions', async (_name, prompt, expectedText) => {
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, 'user@expensify.com');

        const personalDetails: PersonalDetailsList = {
            [CURRENT_USER_ACCOUNT_ID]: {
                accountID: CURRENT_USER_ACCOUNT_ID,
                login: 'user@expensify.com',
                displayName: 'user@expensify.com',
            } as PersonalDetails,
            [AGENT_ACCOUNT_ID]: {
                accountID: AGENT_ACCOUNT_ID,
                login: `agent_${AGENT_ACCOUNT_ID}@expensify.ai`,
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

        expect(screen.getByText(expectedText)).toBeDefined();
    });

    it('does not convert a room name into a report mention', async () => {
        await TestHelper.signInWithTestUser(CURRENT_USER_ACCOUNT_ID, 'user@expensify.com');

        const personalDetails: PersonalDetailsList = {
            [CURRENT_USER_ACCOUNT_ID]: {
                accountID: CURRENT_USER_ACCOUNT_ID,
                login: 'user@expensify.com',
                displayName: 'user@expensify.com',
            } as PersonalDetails,
            [AGENT_ACCOUNT_ID]: {
                accountID: AGENT_ACCOUNT_ID,
                login: `agent_${AGENT_ACCOUNT_ID}@expensify.ai`,
                displayName: 'Test Agent',
                isCustomAgent: true,
            } as PersonalDetails,
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${AGENT_ACCOUNT_ID}`, {prompt: 'Ignore #some-room mentions.', pendingAction: null});
            await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        });
        await waitForBatchedUpdatesWithAct();

        // Strip only the wrapping <comment> tag that MenuItem always adds, but keep any other tag (like <mention-report>) intact, so a room mention would show up in the query below if the rule weren't disabled.
        const mockRenderHTML = jest.mocked(RenderHTML);
        const defaultImplementation = mockRenderHTML.getMockImplementation();
        mockRenderHTML.mockImplementation(({html}) => React.createElement(Text, null, html.replaceAll(/<\/?comment>/g, '')));

        try {
            render(
                <ComposeProviders
                    components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider, CurrentReportIDContextProvider, DelegateNoAccessModalProvider]}
                >
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

            expect(screen.getByText('Ignore #some-room mentions.')).toBeDefined();
        } finally {
            mockRenderHTML.mockImplementation(defaultImplementation);
        }
    });
});
