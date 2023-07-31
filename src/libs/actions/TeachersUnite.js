import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import Navigation from '../Navigation/Navigation';
import CONST from '../../CONST';

/**
 * @param {String} reportID
 * @param {String} values.firstName
 * @param {String} values.lastName
 * @param {String} values.phoneOrEmail
 */

function referTeachersUniteVolunteer(reportID, firstName, lastName = '', phoneOrEmail) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                firstName,
                lastName,
                phoneOrEmail,
            },
        },
    ];
    API.write(
        'ReferTeachersUniteVolunteer',
        {
            reportID,
            firstName,
            lastName,
            phoneOrEmail,
        },
        {
            optimisticData,
        },
    );
    Navigation.dismissModal(CONST.TEACHER_UNITE.PUBLIC_ROOM_ID);
}

export default {referTeachersUniteVolunteer};
