import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import {navigationRef} from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CardNameStep from '@pages/workspace/expensifyCard/issueNew/CardNameStep';
import ConfirmationStep from '@pages/workspace/expensifyCard/issueNew/ConfirmationStep';
import PhoneNumberStep from '@pages/workspace/expensifyCard/issueNew/PhoneNumberStep';
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

type StepProps = {policyID: string; stepNames: readonly string[]; startStepIndex: number};

let CurrentStep: React.ComponentType<StepProps> = ShippingAddressStep;

function StepScreen() {
    return (
        <CurrentStep
            policyID={POLICY_ID}
            stepNames={STEP_NAMES}
            startStepIndex={5}
        />
    );
}

function renderStep(Step: React.ComponentType<StepProps>) {
    CurrentStep = Step;
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

        it('rejects a legal name with a comma or over the length limit', async () => {
            // Given an admin entering a first name with a comma and a last name over the limit
            await setFlow(physicalCardFlow);
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();
            const tooLongName = 'a'.repeat(CONST.LEGAL_NAME.MAX_LENGTH + 1);
            await enterUSAddress({firstName: 'Zany,', lastName: tooLongName});

            // When they try to continue
            await pressNext();

            // Then both names show the same errors as the legal name in the profile, and the step doesn't change
            expect(screen.getByText(TestHelper.translateLocal('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon'))).toBeOnTheScreen();
            expect(screen.getByText(TestHelper.translateLocal('common.error.characterLimitExceedCounter', tooLongName.length, CONST.LEGAL_NAME.MAX_LENGTH))).toBeOnTheScreen();
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS);
        });

        it('accepts legal names with hyphens and apostrophes', async () => {
            // Given an admin entering a cardholder named Anne-Marie O'Connor
            await setFlow(physicalCardFlow);
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();
            await enterUSAddress({firstName: 'Anne-Marie', lastName: "O'Connor"});

            // When they continue
            await pressNext();

            // Then the name is saved and the admin moves on to the phone number
            const issueNewCard = await getIssueNewCard();
            expect(issueNewCard?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.PHONE_NUMBER);
            expect(issueNewCard?.data?.shippingAddress).toEqual(expect.objectContaining({legalFirstName: 'Anne-Marie', legalLastName: "O'Connor"}));
        });

        it('clears the state, city and zip when the country changes', async () => {
            // Given an admin who entered a full US address
            await setFlow(physicalCardFlow);
            renderStep(ShippingAddressStep);
            await waitForBatchedUpdatesWithAct();
            await enterUSAddress();

            // When they change the country to Canada
            fireEvent.press(screen.getByRole('button', {name: `${TestHelper.translateLocal('common.country')}, United States`}), PRESS_EVENT);
            await waitForBatchedUpdatesWithAct();
            fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.search')), 'Canada');
            fireEvent.press(await screen.findByText('Canada'));
            await waitForBatchedUpdatesWithAct();

            // Then the US state, city and zip are cleared, since they don't belong to the new country
            expect(screen.getByLabelText(TestHelper.translateLocal('common.stateOrProvince')).props.value).toBe('');
            expect(screen.getByLabelText(TestHelper.translateLocal('common.city')).props.value).toBe('');
            expect(screen.getByLabelText(TestHelper.translateLocal('common.zipPostCode')).props.value).toBe('');
        });
    });

    describe('PhoneNumberStep', () => {
        const shippingAddress = {
            legalFirstName: 'Zany',
            legalLastName: 'Smith',
            addressStreet: '224 Main Street',
            addressCity: 'San Francisco',
            addressState: 'CA',
            addressZip: '94123',
            addressCountry: CONST.COUNTRY.US,
        };
        const phoneNumberFlow: IssueNewCard = {...physicalCardFlow, currentStep: CONST.EXPENSIFY_CARD.STEP.PHONE_NUMBER, data: {...physicalCardFlow.data, shippingAddress}};

        async function enterPhoneNumber(phoneNumber: string) {
            fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('common.phoneNumber')), phoneNumber);
            fireEvent.press(screen.getByText(TestHelper.translateLocal('common.next')));
            await waitForBatchedUpdatesWithAct();
        }

        it('saves the number in E.164 and goes to the confirmation', async () => {
            // Given an admin asked for a phone number for a US shipping address
            await setFlow(phoneNumberFlow);
            renderStep(PhoneNumberStep);
            await waitForBatchedUpdatesWithAct();

            // When they enter a local number
            await enterPhoneNumber('(415) 555-0123');

            // Then it's saved with the country code and the admin reaches the confirmation
            const issueNewCard = await getIssueNewCard();
            expect(issueNewCard?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.CONFIRMATION);
            expect(issueNewCard?.data?.shippingAddress?.phoneNumber).toBe('+14155550123');
        });

        it('reads a number without a country code as one from the shipping country', async () => {
            // Given a card shipping to the UK
            await setFlow({...phoneNumberFlow, data: {...phoneNumberFlow.data, shippingAddress: {...shippingAddress, addressCountry: 'GB'}}});
            renderStep(PhoneNumberStep);
            await waitForBatchedUpdatesWithAct();

            // When the admin enters a UK number without +44
            await enterPhoneNumber('020 7946 0018');

            // Then it gets the UK country code, not the admin's
            expect((await getIssueNewCard())?.data?.shippingAddress?.phoneNumber).toBe('+442079460018');
        });

        it('rejects a number that cannot be a phone number', async () => {
            // Given an admin on the phone number step
            await setFlow(phoneNumberFlow);
            renderStep(PhoneNumberStep);
            await waitForBatchedUpdatesWithAct();

            // When they enter too few digits
            await enterPhoneNumber('123');

            // Then they see the phone number error and stay on the step
            expect(screen.getByText(TestHelper.translateLocal('common.error.phoneNumber'))).toBeOnTheScreen();
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.PHONE_NUMBER);
        });

        it('goes back to the address, or to the confirmation when editing a number', async () => {
            // Given an admin who came from the address, and one editing a number from the confirmation
            await setFlow(phoneNumberFlow);
            const {unmount} = renderStep(PhoneNumberStep);
            await waitForBatchedUpdatesWithAct();

            // When the first one goes back
            fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
            await waitForBatchedUpdatesWithAct();

            // Then they return to the address
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS);
            unmount();

            // When the second one goes back
            await setFlow({...phoneNumberFlow, isEditing: true, data: {...phoneNumberFlow.data, shippingAddress: {...shippingAddress, phoneNumber: '+14155550123'}}});
            renderStep(PhoneNumberStep);
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByLabelText(TestHelper.translateLocal('common.back')));
            await waitForBatchedUpdatesWithAct();

            // Then they return to the confirmation
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.CONFIRMATION);
        });
    });

    describe('CardNameStep', () => {
        it('goes to the shipping address for a physical US card and to the confirmation otherwise', async () => {
            // Given an admin naming a physical US card
            await setFlow({...physicalCardFlow, currentStep: CONST.EXPENSIFY_CARD.STEP.CARD_NAME});
            const {unmount} = renderStep(CardNameStep);
            await waitForBatchedUpdatesWithAct();

            // When they continue
            await pressNext();

            // Then the shipping address step comes next
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.SHIPPING_ADDRESS);
            unmount();

            // Given an admin naming a virtual card
            await setFlow({
                ...physicalCardFlow,
                currentStep: CONST.EXPENSIFY_CARD.STEP.CARD_NAME,
                data: {...physicalCardFlow.data, cardType: CONST.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL, cardTitle: 'Travel'},
            });
            renderStep(CardNameStep);
            await waitForBatchedUpdatesWithAct();

            // When they continue
            await pressNext();

            // Then the card goes straight to the confirmation, since it never ships
            expect((await getIssueNewCard())?.currentStep).toBe(CONST.EXPENSIFY_CARD.STEP.CONFIRMATION);
        });
    });

    describe('ConfirmationStep', () => {
        const shippingAddress = {
            legalFirstName: 'Zany',
            legalLastName: 'Smith',
            addressStreet: '224 Main Street',
            addressCity: 'San Francisco',
            addressState: 'CA',
            addressZip: '94123',
            addressCountry: CONST.COUNTRY.US,
        };
        const confirmationFlow: IssueNewCard = {...physicalCardFlow, currentStep: CONST.EXPENSIFY_CARD.STEP.CONFIRMATION};

        it('shows the address the admin entered, or Prompt cardholder when there is none', async () => {
            // Given an admin who entered an address
            await setFlow({...confirmationFlow, data: {...confirmationFlow.data, shippingAddress: {...shippingAddress, phoneNumber: '+14155550123'}}});
            const {unmount} = renderStep(ConfirmationStep);
            await waitForBatchedUpdatesWithAct();

            // Then the shipping address row shows it on one line
            expect(screen.getByText('224 Main Street, San Francisco, CA, 94123, US')).toBeOnTheScreen();
            unmount();

            // Given an admin who prompted the cardholder
            await setFlow(confirmationFlow);
            renderStep(ConfirmationStep);
            await waitForBatchedUpdatesWithAct();

            // Then the row says the cardholder will be asked
            expect(screen.getByText(TestHelper.translateLocal('workspace.card.issueNewCard.promptCardholder'))).toBeOnTheScreen();
        });

        it('keeps Issue card disabled and explains why until there is a phone number', async () => {
            // Given an admin who entered an address for a cardholder without a phone number, then went back without entering one
            await setFlow({...confirmationFlow, data: {...confirmationFlow.data, shippingAddress}});
            const {unmount} = renderStep(ConfirmationStep);
            await waitForBatchedUpdatesWithAct();

            // Then the phone number row says it's required and Issue card is disabled
            expect(screen.getByText(TestHelper.translateLocal('common.error.fieldRequired'))).toBeOnTheScreen();
            expect(screen.getByRole('button', {name: TestHelper.translateLocal('workspace.card.issueCard')})).toBeDisabled();
            unmount();

            // Given the admin then entered a phone number
            await setFlow({...confirmationFlow, data: {...confirmationFlow.data, shippingAddress: {...shippingAddress, phoneNumber: '+14155550123'}}});
            renderStep(ConfirmationStep);
            await waitForBatchedUpdatesWithAct();

            // Then the error is gone and the card can be issued
            expect(screen.queryByText(TestHelper.translateLocal('common.error.fieldRequired'))).toBeNull();
            expect(screen.getByRole('button', {name: TestHelper.translateLocal('workspace.card.issueCard')})).toBeEnabled();
        });
    });
});
