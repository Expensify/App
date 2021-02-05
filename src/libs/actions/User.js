/* eslint-disable  import/prefer-default-export  */

import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function getBetas() {
    API.User_GetBetas().then((response) => {
        if (response.jsonCode === 200) {
            Onyx.set(ONYXKEYS.BETAS, response.betas);
        } else {
            console.error('Could not get betas', response);
        }
    });
}

export {
    getBetas,
};
