import {getScenarioConfig} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioResponse,
} from '@components/MultifactorAuthentication/config/types';
import createActors from '@components/MultifactorAuthentication/machine/mfaActors';
import type {FinalizeOutcomeInput} from '@components/MultifactorAuthentication/machine/types';

import {clearDraftValues} from '@libs/actions/FormActions';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import Navigation from '@libs/Navigation/Navigation';
import {setRevealedPhysicalCardPin, setRevealedVirtualCardDetails} from '@libs/RevealedCardSecretsStore';

import {fireAndForgetDenyTransaction} from '@userActions/MultifactorAuthentication';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {createActor, waitFor} from 'xstate';

// The rest of the finalize-outcome suite (`machine/finalizeOutcomeActor.test.ts`) drives the actor with
// synthetic callbacks to pin the actor's own decisions. This suite drives the same real actor with the
// six *resolved* scenario configs, so the side effects each callback is responsible for - storing card
// secrets, navigating, denying the transaction - and its SHOW-versus-SKIP answer are proven through the
// boundary the machine actually uses.

jest.mock('@components/MultifactorAuthentication/biometrics/captureRegistrationState', () => ({
    __esModule: true,
    default: () => Promise.resolve({hasServerCredentials: false, hasLocalCredentials: false, hasEverAcceptedSoftPrompt: false}),
}));

jest.mock('@components/MultifactorAuthentication/observability/trackMFAFlowOutcome', () => ({__esModule: true, default: jest.fn()}));

jest.mock('@libs/RevealedCardSecretsStore', () => ({setRevealedPhysicalCardPin: jest.fn(), setRevealedVirtualCardDetails: jest.fn()}));

jest.mock('@libs/actions/FormActions', () => ({clearDraftValues: jest.fn()}));

// The shared Navigation mock has no `closeRHPFlow`, which two of these callbacks call.
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn(), goBack: jest.fn(), closeRHPFlow: jest.fn()}}));

jest.mock('@userActions/MultifactorAuthentication', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/MultifactorAuthentication'),
    fireAndForgetDenyTransaction: jest.fn(),
}));

const SCENARIO = CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO;
const CALLBACK_RESPONSE = CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE;
const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

const ACCOUNT_ID = 12345;
const CARD_ID = '4242';
const TRANSACTION_ID = 'txn-77';
const REVEALED_PIN = '9182';
const REVEALED_CARD_DETAILS = {pan: '4111111111111111', expiration: '12/29', cvv: '737'};

const PERSONAL_DETAILS = {
    legalFirstName: 'John',
    legalLastName: 'Doe',
    phoneNumber: '+441234567890',
    addressCity: 'London',
    addressStreet: '123 Test Street',
    addressStreet2: '',
    addressZip: 'SW1A 1AA',
    addressCountry: 'GB',
    addressProvince: '',
    dob: '1990-01-15',
} as const;

const SUCCESS_RESPONSE: MultifactorAuthenticationScenarioResponse = {httpStatusCode: 200, reason: undefined, message: undefined};
const CANCELED_ERROR = createLocalMFAError(REASON.LOCAL_ERRORS.CANCELED, 'user canceled');

type RunScenarioOptions = {
    scenarioResponse?: MultifactorAuthenticationScenarioResponse;
    error?: MFAError;
    payload?: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario>;
};

/**
 * Runs the real finalize-outcome actor with the scenario's resolved callback and returns its output. The
 * input carries the raw flow results the machine forwards from context; success and the callback input
 * are derived by the actor itself, which `machine/finalizeOutcomeActor.test.ts` pins.
 */
async function runScenario(scenarioName: MultifactorAuthenticationScenario, {scenarioResponse, error, payload}: RunScenarioOptions) {
    const input: FinalizeOutcomeInput = {
        callback: getScenarioConfig(scenarioName).callback,
        payload,
        accountID: ACCOUNT_ID,
        scenarioName,
        scenarioResponse,
        error,
        authenticationMethod: undefined,
        isRegistrationComplete: false,
        softPromptApproved: false,
        registrationStateAtStart: undefined,
    };
    const {finalizeOutcome} = createActors();
    const actorRef = createActor(finalizeOutcome, {input});

    actorRef.start();
    await waitFor(actorRef, (snapshot) => snapshot.status !== 'active');

    return actorRef.getSnapshot().output;
}

// Jest runs `describe` bodies while collecting tests, so this set is complete before the coverage test runs.
const describedScenarios = new Set<MultifactorAuthenticationScenario>();

/** A `describe` block for one scenario that also registers it for the coverage test. */
function describeScenario(scenarioName: MultifactorAuthenticationScenario, body: () => void) {
    describedScenarios.add(scenarioName);
    describe(scenarioName, body);
}

describe('MFA scenario callbacks through the finalize-outcome actor', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('covers every scenario the app can run', () => {
        expect(describedScenarios).toEqual(new Set(Object.values(SCENARIO)));
    });

    describeScenario(SCENARIO.BIOMETRICS_TEST, () => {
        it('shows the outcome screen and touches nothing else on success', async () => {
            const output = await runScenario(SCENARIO.BIOMETRICS_TEST, {scenarioResponse: SUCCESS_RESPONSE});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(Navigation.goBack).not.toHaveBeenCalled();
            expect(setRevealedPhysicalCardPin).not.toHaveBeenCalled();
            expect(fireAndForgetDenyTransaction).not.toHaveBeenCalled();
        });
    });

    describeScenario(SCENARIO.REVEAL_PIN, () => {
        it('stores the revealed PIN and skips the outcome screen on success', async () => {
            const output = await runScenario(SCENARIO.REVEAL_PIN, {
                scenarioResponse: {...SUCCESS_RESPONSE, body: {pin: REVEALED_PIN}},
                payload: {cardID: CARD_ID},
            });

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN});
            expect(setRevealedPhysicalCardPin).toHaveBeenCalledWith(CARD_ID, REVEALED_PIN);
        });

        it('stores nothing and shows the outcome screen on failure', async () => {
            const output = await runScenario(SCENARIO.REVEAL_PIN, {
                error: CANCELED_ERROR,
                payload: {cardID: CARD_ID},
            });

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(setRevealedPhysicalCardPin).not.toHaveBeenCalled();
        });
    });

    describeScenario(SCENARIO.SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS, () => {
        const payload = {...PERSONAL_DETAILS, addressState: '', cardID: CARD_ID};

        it('stores the card secrets, leaves the details form, and skips the outcome screen when entered from the missing-details form', async () => {
            const output = await runScenario(SCENARIO.SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS, {
                scenarioResponse: {...SUCCESS_RESPONSE, body: {...REVEALED_CARD_DETAILS}},
                payload: {...payload, isFromMissingDetailsFlow: true},
            });

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN});
            expect(setRevealedVirtualCardDetails).toHaveBeenCalledWith(CARD_ID, REVEALED_CARD_DETAILS);
            expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            expect(Navigation.closeRHPFlow).toHaveBeenCalled();
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(CARD_ID));
        });

        it('stores the card secrets and stays put when the reveal was not entered from the missing-details form', async () => {
            const output = await runScenario(SCENARIO.SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS, {
                scenarioResponse: {...SUCCESS_RESPONSE, body: {...REVEALED_CARD_DETAILS}},
                payload,
            });

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN});
            expect(setRevealedVirtualCardDetails).toHaveBeenCalledWith(CARD_ID, REVEALED_CARD_DETAILS);
            expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });

        it('stores nothing and shows the outcome screen on failure', async () => {
            const output = await runScenario(SCENARIO.SET_PERSONAL_DETAILS_AND_REVEAL_CARD_DETAILS, {
                error: CANCELED_ERROR,
                payload: {...payload, isFromMissingDetailsFlow: true},
            });

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(setRevealedVirtualCardDetails).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describeScenario(SCENARIO.SET_PIN_ORDER_CARD, () => {
        const payload = {...PERSONAL_DETAILS, pin: '5739', cardID: CARD_ID};

        it('lands the user on the card page and skips the outcome screen on success', async () => {
            const output = await runScenario(SCENARIO.SET_PIN_ORDER_CARD, {scenarioResponse: SUCCESS_RESPONSE, payload});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN});
            expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            expect(Navigation.closeRHPFlow).toHaveBeenCalled();
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(CARD_ID));
        });

        it('keeps the user in place and shows the outcome screen on failure', async () => {
            const output = await runScenario(SCENARIO.SET_PIN_ORDER_CARD, {error: CANCELED_ERROR, payload});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(clearDraftValues).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
        });
    });

    describeScenario(SCENARIO.CHANGE_PIN, () => {
        const payload = {pin: '1234', cardID: CARD_ID};

        it('pops the set-PIN screen before the outcome screen is shown on success', async () => {
            const output = await runScenario(SCENARIO.CHANGE_PIN, {scenarioResponse: SUCCESS_RESPONSE, payload});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(Navigation.goBack).toHaveBeenCalled();
        });

        it('pops the set-PIN screen on failure too, so the failure screen is not stacked on it', async () => {
            const output = await runScenario(SCENARIO.CHANGE_PIN, {error: CANCELED_ERROR, payload});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(Navigation.goBack).toHaveBeenCalled();
        });
    });

    describeScenario(SCENARIO.AUTHORIZE_TRANSACTION, () => {
        const payload = {transactionID: TRANSACTION_ID};

        it('leaves an approved transaction alone and shows the outcome screen on success', async () => {
            const output = await runScenario(SCENARIO.AUTHORIZE_TRANSACTION, {scenarioResponse: SUCCESS_RESPONSE, payload});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(fireAndForgetDenyTransaction).not.toHaveBeenCalled();
        });

        it('denies the transaction on failure so it cannot be approved elsewhere', async () => {
            const output = await runScenario(SCENARIO.AUTHORIZE_TRANSACTION, {error: CANCELED_ERROR, payload});

            expect(output).toEqual({callbackResponse: CALLBACK_RESPONSE.SHOW_OUTCOME_SCREEN});
            expect(fireAndForgetDenyTransaction).toHaveBeenCalledWith({transactionID: TRANSACTION_ID});
        });
    });
});
