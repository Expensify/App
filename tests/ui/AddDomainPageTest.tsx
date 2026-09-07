import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type * as InFlightRequestsModule from '@hooks/useInFlightRequests';

import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {WorkspacesDomainModalNavigatorParamList, WorkspaceNavigatorParamList} from '@libs/Navigation/types';

import AddDomainPage from '@pages/domain/AddDomainPage';
import DomainsListPage from '@pages/domain/DomainsListPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {CreateDomainForm} from '@src/types/form';
import type {Domain} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN_NAME = 'test.com';
const EXISTING_DOMAIN_ACCOUNT_ID = 4242;

let mockIsUserValidated = false;
let mockIsAppLoadPending = false;
let mockCapturedOnResume: ((payload?: () => void) => void) | undefined;
const mockVerifyAccountAndResume = jest.fn<void, [payload?: () => void]>();

jest.mock('@hooks/useVerifyAccountAndResume', () => ({
    __esModule: true,
    default: (onResume: (payload?: () => void) => void) => {
        mockCapturedOnResume = onResume;
        return {isUserValidated: mockIsUserValidated, verifyAccountAndResume: mockVerifyAccountAndResume};
    },
}));

// Driving this through the request queue would race the real SequentialQueue draining the entry we planted.
jest.mock('@hooks/useInFlightRequests', () => ({
    ...jest.requireActual<typeof InFlightRequestsModule>('@hooks/useInFlightRequests'),
    useIsAppLoadPending: () => mockIsAppLoadPending,
}));

const apiWriteSpy = jest.spyOn(API, 'write').mockImplementation(() => Promise.resolve());
const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

const Stack = createPlatformStackNavigator<WorkspacesDomainModalNavigatorParamList>();
const WorkspaceStack = createPlatformStackNavigator<WorkspaceNavigatorParamList>();

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

function renderDomainsListPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, CurrentUserPersonalDetailsProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <WorkspaceStack.Navigator initialRouteName={SCREENS.DOMAINS_LIST}>
                        <WorkspaceStack.Screen
                            name={SCREENS.DOMAINS_LIST}
                            component={DomainsListPage}
                        />
                    </WorkspaceStack.Navigator>
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

function getCreateDomainForm() {
    return new Promise<OnyxEntry<CreateDomainForm>>((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function getExistingDomain() {
    return new Promise<OnyxEntry<Domain>>((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${EXISTING_DOMAIN_ACCOUNT_ID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

describe('AddDomainPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsUserValidated = false;
        mockIsAppLoadPending = false;
        mockCapturedOnResume = undefined;
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1, email: 'test@user.com'});
        });
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

    it('shows the inline error when the domain we already have is submitted again', async () => {
        // Given a validated user who already has the domain the BE reports as taken
        mockIsUserValidated = true;
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${EXISTING_DOMAIN_ACCOUNT_ID}`, {accountID: EXISTING_DOMAIN_ACCOUNT_ID, email: `admin@${DOMAIN_NAME}`});
        });
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // When the create fails with that domain's accountID
        await submitDomainName(DOMAIN_NAME);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {domainAccountID: EXISTING_DOMAIN_ACCOUNT_ID});
        });
        await waitForBatchedUpdatesWithAct();

        // Then we surface the inline error, keep the domain entry and stay on the page
        const form = await getCreateDomainForm();
        expect(form?.errors).not.toBeUndefined();
        expect(form?.domainAccountID).toBeFalsy();
        expect(await getExistingDomain()).not.toBeUndefined();
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(EXISTING_DOMAIN_ACCOUNT_ID), expect.anything());
    });

    it('redirects to the domain exists page for a domain that only arrived with the failure', async () => {
        // Given a validated user who does not have the domain the BE reports as taken
        mockIsUserValidated = true;
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // When the create fails and the BE sends its accountID along with a minimal domain entry
        await submitDomainName(DOMAIN_NAME);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${EXISTING_DOMAIN_ACCOUNT_ID}`, {accountID: EXISTING_DOMAIN_ACCOUNT_ID, email: `admin@${DOMAIN_NAME}`});
            await Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {domainAccountID: EXISTING_DOMAIN_ACCOUNT_ID});
        });
        await waitForBatchedUpdatesWithAct();

        // Then we drop that entry so it never reaches the domains list, and navigate instead of showing an inline error
        expect(await getExistingDomain()).toBeUndefined();
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(EXISTING_DOMAIN_ACCOUNT_ID), expect.anything());
        expect((await getCreateDomainForm())?.errors).toBeFalsy();
    });

    it('cleans up a failed domain response after the add domain page unmounts', async () => {
        // Given a validated user with a pending CreateDomain request
        mockIsUserValidated = true;
        const {unmount} = renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();
        await submitDomainName(DOMAIN_NAME);
        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.CREATE_DOMAIN,
            {domainName: DOMAIN_NAME},
            expect.objectContaining({
                failureData: expect.arrayContaining([expect.objectContaining({value: expect.objectContaining({domainKeysBeforeCreation: []})})]),
            }),
        );

        // When the page unmounts before the BE returns the minimal domain entry
        unmount();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.DOMAIN}${EXISTING_DOMAIN_ACCOUNT_ID}`, {accountID: EXISTING_DOMAIN_ACCOUNT_ID, email: `admin@${DOMAIN_NAME}`});
            await Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {domainAccountID: EXISTING_DOMAIN_ACCOUNT_ID, domainKeysBeforeCreation: []});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the persisted request context keeps the response-only domain out of the list and cleans it once the list is focused
        expect(await getExistingDomain()).not.toBeUndefined();
        renderDomainsListPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.queryByText(DOMAIN_NAME)).toBeNull();
        expect(await getExistingDomain()).toBeUndefined();
        expect((await getCreateDomainForm())?.domainAccountID).toBeFalsy();
    });

    it('keeps a pre-existing domain visible when the add domain page unmounts before the failure', async () => {
        // Given a domain that OpenApp had already added before the user submitted it
        mockIsUserValidated = true;
        const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}${EXISTING_DOMAIN_ACCOUNT_ID}` as const;
        await act(async () => {
            await Onyx.merge(domainKey, {accountID: EXISTING_DOMAIN_ACCOUNT_ID, email: `admin@${DOMAIN_NAME}`});
        });
        const {unmount} = renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();
        await submitDomainName(DOMAIN_NAME);

        // When the page unmounts before the failure response restores the persisted request context
        unmount();
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {domainAccountID: EXISTING_DOMAIN_ACCOUNT_ID, domainKeysBeforeCreation: [domainKey]});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the list preserves the legitimate OpenApp entry instead of treating it as a response-only stub
        renderDomainsListPage();
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText(DOMAIN_NAME)).toBeOnTheScreen();
        expect(await getExistingDomain()).not.toBeUndefined();
    });

    it('falls back to the server error when the response cannot be matched against a snapshot', async () => {
        // Given a validated user whose create response only arrives after the page remounted, so no snapshot was taken
        mockIsUserValidated = true;
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // When the BE failure lands without a submit in this mount
        await act(async () => {
            await Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {domainAccountID: EXISTING_DOMAIN_ACCOUNT_ID});
        });
        await waitForBatchedUpdatesWithAct();

        // Then we clear the transient accountID so the server error is shown instead of nothing happening
        expect((await getCreateDomainForm())?.domainAccountID).toBeFalsy();
        expect(navigateSpy).not.toHaveBeenCalledWith(ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(EXISTING_DOMAIN_ACCOUNT_ID), expect.anything());
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

    it('keeps a pending adminship request out of the domains list when the same domain is attempted again', async () => {
        // Given a validated user who already requested adminship, so all that is left of the domain is that request
        mockIsUserValidated = true;
        const domainKey = `${ONYXKEYS.COLLECTION.DOMAIN}${EXISTING_DOMAIN_ACCOUNT_ID}` as const;
        await act(async () => {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await Onyx.merge(domainKey, {domain_adminRequesters: {'1': 'read'}});
        });
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // When they submit the same domain again and the BE reports it as taken, sending the domain along with the failure
        await submitDomainName(DOMAIN_NAME);
        await act(async () => {
            await Onyx.merge(domainKey, {accountID: EXISTING_DOMAIN_ACCOUNT_ID, email: `admin@${DOMAIN_NAME}`});
            await Onyx.merge(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {domainAccountID: EXISTING_DOMAIN_ACCOUNT_ID});
        });
        await waitForBatchedUpdatesWithAct();

        // Then we go to the domain-already-exists page instead of showing the already-have-access error, and the entry is stripped back
        // to the request alone, so the domains list still has nothing to render for it
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WORKSPACES_DOMAIN_ALREADY_EXISTS.getRoute(EXISTING_DOMAIN_ACCOUNT_ID), expect.anything());
        expect((await getCreateDomainForm())?.errors).toBeFalsy();

        const existingDomain = await getExistingDomain();
        expect(existingDomain?.accountID).toBeUndefined();
        expect(existingDomain?.email).toBeUndefined();
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect(existingDomain?.domain_adminRequesters).toEqual({'1': 'read'});
    });

    it('holds the submit back while the initial app load is still fetching the domains', async () => {
        // Given a validated user who opened the page before OpenApp delivered their domains
        mockIsUserValidated = true;
        mockIsAppLoadPending = true;
        renderAddDomainPage();
        await waitForBatchedUpdatesWithAct();

        // Then the submit is held back
        expect(screen.getByRole('button', {name: TestHelper.translateLocal('common.continue')})).toBeDisabled();

        // When they try to submit a domain name anyway
        await submitDomainName(DOMAIN_NAME);

        // Then nothing is created, so no snapshot is taken against domains that have not arrived yet
        expect(apiWriteSpy).not.toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_DOMAIN, expect.anything(), expect.anything());
    });
});
