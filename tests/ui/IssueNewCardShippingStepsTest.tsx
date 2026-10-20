import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ShippingAddressStep from '@pages/workspace/expensifyCard/issueNew/ShippingAddressStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {IssueNewCard} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

// The real modal doesn't render in tests, so show the country and state lists inline while they're open
jest.mock('@components/Modal', () => jest.fn(({isVisible, children}: {isVisible: boolean; children: React.ReactNode}) => (isVisible ? children : null)));

const POLICY_ID = 'A6D48964EA47D654';
const ISSUE_NEW_CARD_KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${POLICY_ID}` as const;
const STEP_NAMES = ['1', '2', '3', '4', '5', '6', '7', '8'];
const PRESS_EVENT = {nativeEvent: {}};

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

function renderStep(Step: React.ComponentType<{policyID: string; stepNames: readonly string[]; startStepIndex: number}>) {
    function StepScreen() {
        return (
            <Step
                policyID={POLICY_ID}
                stepNames={STEP_NAMES}
                startStepIndex={5}
            />
        );
    }
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <NavigationContainer ref={navigationRef}>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW}
                            component={StepScreen}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

function getIssueNewCard() {
    return new Promise<OnyxEntry<IssueNewCard>>((resolve) => {
        const connection = Onyx.connect({
            key: ISSUE_NEW_CARD_KEY,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

async function setFlow(flow: IssueNewCard) {
    await act(async () => {
        await Onyx.set(ISSUE_NEW_CARD_KEY, flow);
    });
}

async function enterUSAddress({firstName = 'Zany', lastName = 'Smith'}: {firstName?: string; lastName?: string} = {}) {
    fireEvent.press(screen.getByText(TestHelper.translateLocal('workspace.card.issueNewCard.enterAddress')));
    await waitForBatchedUpdatesWithAct();
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.firstName')), firstName);
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.lastName')), lastName);
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.addressLine', 1)), ' 224 Main Street ');
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.city')), 'San Francisco');
    fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.zipPostCode')), '94123');
    // Menu rows ignore a press without an event
    fireEvent.press(screen.getByRole('button', {name: TestHelper.translateLocal('common.state')}), PRESS_EVENT);
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByText('California'));
    await waitForBatchedUpdatesWithAct();
}

async function pressNext() {
    fireEvent.press(screen.getByText(TestHelper.translateLocal('common.next')));
    await waitForBatchedUpdatesWithAct();
}

const physicalCardFlow: IssueNewCard = {
    currentStep: CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS,
    isEditing: false,
    isChangeAssigneeDisabled: false,
    hasAssigneePhoneNumber: false,
    data: {
        assigneeEmail: 'zany@example.com',
        invitingMemberEmail: '',
        invitingMemberAccountID: 0,
        cardType: CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL,
        limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        limit: 200000,
        cardTitle: "Zany's card",
        currency: CONST.CURRENCY.USD,
    },
};

describe('Issue card shipping steps', () => {
    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockFetch.succeed();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        await TestHelper.signInWithTestUser();
        await waitForBatchedUpdatesWithAct();
    });

    describe('ShippingAddressStep', () => {
        it('goes to the confirmation when the admin prompts the cardholder', async () => {
            // Given an admin on the shipping address step for a cardholder without a phone number
            await setFlow(physicalCardFlow);
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();

            // When they keep Prompt cardholder and continue
            await pressNext();

            // Then the flow skips the phone number, since the cardholder will enter their own details
            const issueNewCard = await getIssueNewCard();
            expect(issueNewCard?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.CONFIRMATION);
            expect(issueNewCard?.data?.shippingAddress).toBeUndefined();
        });
        it('asks for a phone number after an address for a cardholder without one', async () => {
            // Given an admin on the shipping address step for a cardholder without a phone number
            await setFlow(physicalCardFlow);
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();

            // When they enter an address and continue
            await enterUSAddress();
            await pressNext();

            // Then the trimmed address is saved and the admin is asked for a phone number for the shipping label
            const issueNewCard = await getIssueNewCard();
            expect(issueNewCard?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.PHONE_NUMBER);
            expect(issueNewCard?.data?.shippingAddress).toEqual({
                legalFirstName: 'Zany',
                legalLastName: 'Smith',
                addressStreet: '224 Main Street',
                addressCity: 'San Francisco',
                addressState: 'CA',
                addressZip: '94123',
                addressCountry: CONST.COUNTRY.US,
            });
        });

        it('goes to the confirmation after an address for a cardholder with a phone number', async () => {
            // Given an admin on the shipping address step for a cardholder who has a phone number
            await setFlow({...physicalCardFlow, hasAssigneePhoneNumber: true});
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();

            // When they enter an address and continue
            await enterUSAddress();
            await pressNext();

            // Then the phone number step is skipped
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.CONFIRMATION);
        });

        it('rejects a legal name with invalid characters or over the length limit', async () => {
            // Given an admin entering a first name with digits and a last name over the limit
            await setFlow(physicalCardFlow);
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();
            const tooLongName = 'a'.repeat(CONST.LEGAL_NAME.MAX_LENGTH + 1);
            await enterUSAddress({firstName: 'Zany2', lastName: tooLongName});

            // When they try to continue
            await pressNext();

            // Then both names show an error and the step doesn't change
            expect(screen.getByText(TestHelper.translateLocal('privatePersonalDetails.error.hasInvalidCharacter'))).toBeOnTheScreen();
            expect(screen.getByText(TestHelper.translateLocal('common.error.characterLimitExceedCounter', tooLongName.length, CONST.LEGAL_NAME.MAX_LENGTH))).toBeOnTheScreen();
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS);
        });
    });
});
