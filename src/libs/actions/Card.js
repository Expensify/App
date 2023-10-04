import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

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
                    key: ONYXKEYS.FORMS.REPORT_FRAUD_FORM,
                    value: {
                        isLoading: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_FRAUD_FORM,
                    value: {
                        isLoading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.FORMS.REPORT_FRAUD_FORM,
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
    reportVirtualExpensifyCardFraud,
};
