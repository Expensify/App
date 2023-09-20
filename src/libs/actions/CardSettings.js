import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

/**
 * Activates the physical Expensify card based on the last four digits of the card number
 *
 * @param {Number} lastFourDigits
 */

function activatePhysicalExpensifyCard(lastFourDigits) {
    API.write(
        'ActivatePhysicalExpensifyCard',
        {lastFourDigits},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.CARD_LIST,
                    value: {
                        isLoading: true,
                        errors: null,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.CARD_LIST,
                    value: {
                        isLoading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.CARD_LIST,
                    value: {
                        isLoading: false,
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
    Onyx.merge(ONYXKEYS.CARD_LIST, {isLoading: false, [cardID]: {errors: null}});
}

export {activatePhysicalExpensifyCard, clearCardListErrors};
