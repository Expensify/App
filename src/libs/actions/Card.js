import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

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

export {
    // eslint-disable-next-line import/prefer-default-export
    requestReplacementExpensifyCard,
};
