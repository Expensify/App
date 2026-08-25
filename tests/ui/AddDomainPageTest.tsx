import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspacesDomainModalNavigatorParamList} from '@libs/Navigation/types';

import AddDomainPage from '@pages/domain/AddDomainPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN_NAME = 'test.com';

let mockIsUserValidated = false;
let mockCapturedOnResume: ((payload?: () => void) => void) | undefined;
const mockVerifyAccountAndResume = jest.fn<void, [payload?: () => void]>();

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: (onResume: (payload?: () => void) => void) => {
        mockCapturedOnResume = onResume;
        return {isUserValidated: mockIsUserValidated, verifyAccountAndResume: mockVerifyAccountAndResume};
    },
}));

const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());

const Stack = createPlatformStackNavigator<WorkspacesDomainModalNavigatorParamList>();

function renderAddDomainPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator initialRouteName={SCREENS.WORKSPACES_ADD_DOMAIN}>
                        <Stack.Screen
                            name={SCREENS.WORKSPACES_ADD_DOMAIN}
                            component={AddDomainPage}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

async function submitDomainName(domainName: string) {
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('domain.addDomain.domainName')), domainName);
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.continue')}));
    await waitForBatchedUpdatesWithAct();
}

describe('AddDomainPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsUserValidated = false;
        mockCapturedOnResume = undefined;
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('creates the domain right away for a validated user', async () => {
        // Given a validated user on the add domain page
        mockIsUserValidated = true;
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // When they submit a domain name
        await submitDomainName(DOMAIN_NAME);

        // Then the domain is created without any verification detour
        expect(mockVerifyAccountAndResume).not.toHaveBeenCalled();
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_DOMAIN, {domainName: DOMAIN_NAME}, expect.anything());
    });

    it('defers the create to the account verification flow for an unvalidated user and resumes it after validation', async () => {
        // Given an unvalidated user on the add domain page
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // When they submit a domain name
        await submitDomainName(DOMAIN_NAME);

        // Then the create is deferred to the verify account flow instead of running now
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_DOMAIN, expect.anything(), expect.anything());
        expect(mockVerifyAccountAndResume).toHaveBeenCalledWith(expect.any(Function));

        // When the account gets validated and the stored payload is resumed
        const resumePayload = mockVerifyAccountAndResume.mock.calls.at(0)?.at(0);
        await act(async () => {
            mockCapturedOnResume?.(resumePayload);
            await waitForBatchedUpdatesWithAct();
        });

        // Then the domain is created with the submitted name, without a second Continue press
        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_DOMAIN, {domainName: DOMAIN_NAME}, expect.anything());
    });
});
