import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import * as API from '@libs/API';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Response} from '@src/types/onyx';

type ReplacementReason = 'damaged' | 'stolen';

function reportVirtualExpensifyCardFraud(cardID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
            value: {
                isLoading: false,
            },
        },
    ];

    type ReportVirtualExpensifyCardFraudParams = {
        cardID: number;
    };

    const parameters: ReportVirtualExpensifyCardFraudParams = {
        cardID,
    };

    API.write('ReportVirtualExpensifyCardFraud', parameters, {optimisticData, successData, failureData});
}

/**
 * Call the API to deactivate the card and request a new one
 * @param cardID - id of the card that is going to be replaced
 * @param reason - reason for replacement
 */
function requestReplacementExpensifyCard(cardID: number, reason: ReplacementReason) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
            value: {
                isLoading: false,
            },
        },
    ];

    type RequestReplacementExpensifyCardParams = {
        cardID: number;
        reason: string;
    };

    const parameters: RequestReplacementExpensifyCardParams = {
        cardID,
        reason,
    };

    API.write('RequestReplacementExpensifyCard', parameters, {optimisticData, successData, failureData});
}

/**
 * Activates the physical Expensify card based on the last four digits of the card number
 */
function activatePhysicalExpensifyCard(cardLastFourDigits: string, cardID: number) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    errors: null,
                    isLoading: true,
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    isLoading: false,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                [cardID]: {
                    isLoading: false,
                },
            },
        },
    ];

    type ActivatePhysicalExpensifyCardParams = {
        cardLastFourDigits: string;
        cardID: number;
    };

    const parameters: ActivatePhysicalExpensifyCardParams = {
        cardLastFourDigits,
        cardID,
    };

    API.write('ActivatePhysicalExpensifyCard', parameters, {optimisticData, successData, failureData});
}

/**
 * Clears errors for a specific cardID
 */
function clearCardListErrors(cardID: number) {
    Onyx.merge(ONYXKEYS.CARD_LIST, {[cardID]: {errors: null, isLoading: false}});
}

/**
 * Makes an API call to get virtual card details (pan, cvv, expiration date, address)
 * This function purposefully uses `makeRequestWithSideEffects` method. For security reason
 * card details cannot be persisted in Onyx and have to be asked for each time a user want's to
 * reveal them.
 *
 * @param cardID - virtual card ID
 *
 * @returns promise with card details object
 */
function revealVirtualCardDetails(cardID: number): Promise<Response> {
    return new Promise((resolve, reject) => {
        type RevealExpensifyCardDetailsParams = {cardID: number};

        const parameters: RevealExpensifyCardDetailsParams = {cardID};

        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects('RevealExpensifyCardDetails', parameters)
            .then((response) => {
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    reject(Localize.translateLocal('cardPage.cardDetailsLoadingFailure'));
                    return;
                }
                resolve(response);
            })
            .catch(() => reject(Localize.translateLocal('cardPage.cardDetailsLoadingFailure')));
    });
}

export {requestReplacementExpensifyCard, activatePhysicalExpensifyCard, clearCardListErrors, reportVirtualExpensifyCardFraud, revealVirtualCardDetails};
