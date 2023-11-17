import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * @param {Number} cardID
 */
function reportVirtualExpensifyCardFraud(cardID) {
    API.write(
        'ReportVirtualExpensifyCardFraud',
        {
            cardID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
                    value: {
                        isLoading: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
                    value: {
                        isLoading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_VIRTUAL_CARD_FRAUD,
                    value: {
                        isLoading: false,
                    },
                },
            ],
        },
    );
}

/**
 * Call the API to deactivate the card and request a new one
 * @param {String} cardId - id of the card that is going to be replaced
 * @param {String} reason - reason for replacement ('damaged' | 'stolen')
 */
function requestReplacementExpensifyCard(cardId, reason) {
    API.write(
        'RequestReplacementExpensifyCard',
        {
            cardId,
            reason,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
                    value: {
                        isLoading: true,
                        errors: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
                    value: {
                        isLoading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM,
                    value: {
                        isLoading: false,
                    },
                },
            ],
        },
    );
}

/**
 * Activates the physical Expensify card based on the last four digits of the card number
 *
 * @param {Number} cardLastFourDigits
 * @param {Number} cardID
 */
function activatePhysicalExpensifyCard(cardLastFourDigits, cardID) {
    API.write(
        'ActivatePhysicalExpensifyCard',
        {cardLastFourDigits, cardID},
        {
            optimisticData: [
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
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.CARD_LIST,
                    value: {
                        [cardID]: {
                            isLoading: false,
                        },
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.CARD_LIST,
                    value: {
                        [cardID]: {
                            isLoading: false,
                        },
                    },
                },
            ],
        },
    );
}

/**
 * Clears errors for a specific cardID
 *
 * @param {Number} cardID
 */
function clearCardListErrors(cardID) {
    Onyx.merge(ONYXKEYS.CARD_LIST, {[cardID]: {errors: null, isLoading: false}});
}

/**
 * Makes an API call to get virtual card details (pan, cvv, expiration date, address)
 * This function purposefully uses `makeRequestWithSideEffects` method. For security reason
 * card details cannot be persisted in Onyx and have to be asked for each time a user want's to
 * reveal them.
 *
 * @param {String} cardID - virtual card ID
 *
 * @returns {Promise<Object>} - promise with card details object
 */
function revealVirtualCardDetails(cardID) {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects('RevealExpensifyCardDetails', {cardID})
            .then((response) => {
                if (response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    reject(Localize.translateLocal('cardPage.cardDetailsLoadingFailure'));
                    return;
                }
                resolve(response);
            })
            .catch(() => reject(Localize.translateLocal('cardPage.cardDetailsLoadingFailure')));
    });
}

export {requestReplacementExpensifyCard, activatePhysicalExpensifyCard, clearCardListErrors, reportVirtualExpensifyCardFraud, revealVirtualCardDetails};
