import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * Activates the physical Expensify card based on the last four digits of the card number
 *
 * @param {Number} lastFourDigits
 * @param {Number} cardID
 */
function activatePhysicalExpensifyCard(lastFourDigits, cardID) {
    API.write(
        'ActivatePhysicalExpensifyCard',
        {lastFourDigits, cardID},
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

export {activatePhysicalExpensifyCard, clearCardListErrors};
