import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function getUpdatedCardsList(cardsList) {
    return cardsList;
}

/**
 * Call the API to deactivate the card and request a new one
 * @param {String} cardId - id of the card that is going to be replaced
 * @param {String} reason - reason for replacement ('damaged' | 'stolen')
 */
function requestReplacementExpensifyCard(cardId, reason) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {},
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {},
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {},
        },
    ];

    API.write(
        'RequestReplacementExpensifyCard',
        {
            cardId,
            reason,
        },
        {
            optimisticData,
            successData,
            failureData,
        },
    );
}

export {requestReplacementExpensifyCard, getUpdatedCardsList};
