import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

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
            value: {
                isLoading: true,
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                isLoading: false,
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.CARD_LIST,
            value: {
                isLoading: false,
            },
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

export {
    // eslint-disable-next-line import/prefer-default-export
    requestReplacementExpensifyCard,
};
