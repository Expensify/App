import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import {clearIssueNewCardAssigneePhoneNumber, issueExpensifyCard, openIssueNewCardShippingAddressStep, setPersonalDetailsAndActivateExpensifyCard} from '@src/libs/actions/Card';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import {openPolicyExpensifyCardsPage} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ExpensifyCardLoadingState, ExpensifyCardSettings, IssueNewCard} from '@src/types/onyx';
import type {IssueNewCardData} from '@src/types/onyx/Card';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const policyID = 'A6D48964EA47D654';
const workspaceFundID = 22588762;

// The fund the page falls back to before policyAccountID lands, mirroring CONST.DEFAULT_NUMBER_ID.
const unresolvedFundID = 0;

const loadingStateKey = `${ONYXKEYS.COLLECTION.RAM_ONLY_EXPENSIFY_CARD_LOADING_STATE}${policyID}` as const;
const unresolvedFundSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${unresolvedFundID}` as const;
const workspaceFundSettingsKey = `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceFundID}` as const;

function getLoadingState() {
    return new Promise<OnyxEntry<ExpensifyCardLoadingState>>((resolve) => {
        const connection = Onyx.connect({
            key: loadingStateKey,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function getCardSettingsForFund(key: typeof unresolvedFundSettingsKey | typeof workspaceFundSettingsKey) {
    return new Promise<OnyxEntry<ExpensifyCardSettings>>((resolve) => {
        const connection = Onyx.connect({
            key,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function getIssueNewCard() {
    return new Promise<OnyxEntry<IssueNewCard>>((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

OnyxUpdateManager();
describe('actions/PolicyExpensifyCard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    const mockFetch = TestHelper.setupGlobalFetchMock();

    beforeEach(() => {
        mockFetch.succeed();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('openPolicyExpensifyCardsPage', () => {
        it('marks the page loaded even when the response carries no settings for the requested fund', async () => {
            openPolicyExpensifyCardsPage(policyID, workspaceFundID);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getLoadingState()).resolves.toEqual(expect.objectContaining({hasOnceLoadedPage: true}));
        });

        it('keys the loaded flag on the policy so it survives the fund the page resolves changing', async () => {
            // The first open races the policy load and goes out before the fund is known.
            openPolicyExpensifyCardsPage(policyID, CONST.DEFAULT_NUMBER_ID);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getLoadingState()).resolves.toEqual(expect.objectContaining({hasOnceLoadedPage: true}));
        });

        it('does not write card settings under an unresolved fund ID', async () => {
            openPolicyExpensifyCardsPage(policyID, CONST.DEFAULT_NUMBER_ID);
            await waitForBatchedUpdates();
            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getCardSettingsForFund(unresolvedFundSettingsKey)).resolves.toBeUndefined();
        });

        it('still writes the fund-scoped loading flags for a resolved fund', async () => {
            mockFetch.pause?.();
            openPolicyExpensifyCardsPage(policyID, workspaceFundID);
            await waitForBatchedUpdates();

            await expect(getCardSettingsForFund(workspaceFundSettingsKey)).resolves.toEqual(expect.objectContaining({isLoading: true}));

            await mockFetch.resume?.();
            await waitForBatchedUpdates();

            await expect(getCardSettingsForFund(workspaceFundSettingsKey)).resolves.toEqual(expect.objectContaining({isLoading: false, hasOnceLoaded: true}));
        });

        it('records an error without marking the page loaded when the initial request fails', async () => {
            mockFetch.fail();
            openPolicyExpensifyCardsPage(policyID, workspaceFundID);
            await waitForBatchedUpdates();

            await expect(getLoadingState()).resolves.toEqual(expect.objectContaining({hasLoadingError: true}));
            await expect(getLoadingState()).resolves.not.toEqual(expect.objectContaining({hasOnceLoadedPage: true}));
        });
    });

    describe('issueExpensifyCard', () => {
        const shippingAddress = {
            legalFirstName: 'Zany',
            legalLastName: 'Smith',
            addressStreet: '224 Main Street',
            addressCity: 'San Francisco',
            addressState: 'CA',
            addressZip: '94123',
            addressCountry: CONST.COUNTRY.US,
        };
        const physicalCardData: IssueNewCardData = {
            assigneeEmail: 'zany@example.com',
            invitingMemberEmail: '',
            invitingMemberAccountID: 0,
            cardType: CONST.EXPENSIFY_CARD.CARD_TYPE.PHYSICAL,
            limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            limit: 200000,
            cardTitle: "Zany's card",
            currency: CONST.CURRENCY.USD,
            shippingAddress,
        };

        it('sends the address the admin entered with a physical card', async () => {
            // Given a physical US card the admin entered a shipping address for
            // When the admin issues it
            issueExpensifyCard(workspaceFundID, policyID, '', undefined, physicalCardData);
            await waitForBatchedUpdates();

            // Then the address goes to the backend so the card ships there
            const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.CREATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
            expect(body instanceof FormData ? body.get('shippingAddress') : undefined).toBe(JSON.stringify(shippingAddress));
        });

        it('leaves out the address for UK/EU cards', async () => {
            // Given a UK/EU card that still has an address from before the admin changed the cardholder
            // When the admin issues it
            issueExpensifyCard(workspaceFundID, policyID, '', undefined, {...physicalCardData, currency: CONST.CURRENCY.GBP});
            await waitForBatchedUpdates();

            // Then no address is sent, since UK/EU cards ship once the cardholder sets a PIN
            const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.CREATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
            expect(body instanceof FormData && body.has('shippingAddress')).toBe(false);
        });

        it('leaves out the address when the admin prompts the cardholder', async () => {
            // Given a physical US card where the admin picked Prompt cardholder, so no address was entered
            // When the admin issues it
            issueExpensifyCard(workspaceFundID, policyID, '', undefined, {...physicalCardData, shippingAddress: null});
            await waitForBatchedUpdates();

            // Then the card is still issued, without an address, so the cardholder is asked for theirs
            const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.CREATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
            expect(body instanceof FormData).toBe(true);
            expect(body instanceof FormData && body.has('shippingAddress')).toBe(false);
        });
    });

    describe('openIssueNewCardShippingAddressStep', () => {
        it('does not check for a phone number before a cardholder is picked', async () => {
            // Given the shipping address step opening before the admin picked a cardholder
            // When the step opens
            openIssueNewCardShippingAddressStep(policyID, undefined);
            await waitForBatchedUpdates();

            // Then there is nobody to check, so no request is made
            expect(TestHelper.getFetchMockCalls(READ_COMMANDS.OPEN_ISSUE_NEW_CARD_SHIPPING_ADDRESS_STEP)).toHaveLength(0);
        });

        it('asks whether the cardholder has a phone number', async () => {
            // Given an admin who reaches the shipping address step for a cardholder
            // When the step opens
            openIssueNewCardShippingAddressStep(policyID, 'zany@example.com');
            await waitForBatchedUpdates();

            // Then we check the cardholder's phone number so the admin is only asked for one when it's missing
            const body = TestHelper.getFetchMockCalls(READ_COMMANDS.OPEN_ISSUE_NEW_CARD_SHIPPING_ADDRESS_STEP).at(-1)?.[1]?.body;
            expect(body instanceof FormData ? Object.fromEntries(body) : {}).toEqual(expect.objectContaining({policyID, assigneeEmail: 'zany@example.com'}));
        });

        it('keeps knowing the cardholder has a phone number while the step loads again', async () => {
            // Given an admin who already knows the cardholder has a phone number, on a slow network
            await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {hasAssigneePhoneNumber: true});
            mockFetch.pause();

            // When the admin goes back to the shipping address step from the confirmation
            openIssueNewCardShippingAddressStep(policyID, 'zany@example.com');
            await waitForBatchedUpdates();

            // Then the phone number step isn't added to the steps while the check is still loading
            const issueNewCard = await getIssueNewCard();
            expect(issueNewCard?.hasAssigneePhoneNumber).toBe(true);
            await mockFetch.resume();
        });
    });

    describe('clearIssueNewCardAssigneePhoneNumber', () => {
        it('forgets whether the previous cardholder had a phone number', async () => {
            // Given the flow already knows the previous cardholder has a phone number
            await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD}${policyID}`, {hasAssigneePhoneNumber: true});

            // When the admin picks a different cardholder
            clearIssueNewCardAssigneePhoneNumber(policyID);
            await waitForBatchedUpdates();

            // Then the answer is cleared, so the new cardholder is checked again instead of skipping the phone number step
            const issueNewCard = await getIssueNewCard();
            expect(issueNewCard?.hasAssigneePhoneNumber).toBeUndefined();
        });
    });

    describe('setPersonalDetailsAndActivateExpensifyCard', () => {
        it('sends the details the cardholder confirmed with the last four digits and the magic code', async () => {
            // Given a cardholder who confirmed their details while activating a card shipped to an address their admin entered
            const personalDetails = {
                phoneNumber: '+13466666666',
                addressCity: 'Seattle',
                addressStreet: '123 Pike Street',
                addressStreet2: '',
                addressZip: '98101',
                addressCountry: CONST.COUNTRY.US,
                addressState: 'WA',
                addressProvince: '',
                dob: '1988-05-19',
            };

            // When they enter the magic code
            setPersonalDetailsAndActivateExpensifyCard('1234', 5555, personalDetails, '123456');
            await waitForBatchedUpdates();

            // Then the details go with the digits and the code, since saving them needs the magic code
            const body = TestHelper.getFetchMockCalls(WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_ACTIVATE_EXPENSIFY_CARD).at(-1)?.[1]?.body;
            expect(body instanceof FormData ? Object.fromEntries(body) : {}).toEqual(
                expect.objectContaining({cardID: '5555', cardLastFourDigits: '1234', validateCode: '123456', ...personalDetails}),
            );
        });
    });
});
