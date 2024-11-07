import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setTimeSkew(skew: number) {
    Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: skew});
}

export default setTimeSkew;
