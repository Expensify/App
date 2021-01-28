import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';

function getBetas() {
    Onyx.merge(ONYXKEYS.BETAS, []);
    API.User_GetBetas().then((response) => {
        Onyx.set(ONYXKEYS.BETAS, response.betas);
    });
}

export default getBetas;
