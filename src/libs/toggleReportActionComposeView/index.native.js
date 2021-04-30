import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

export default shouldShowComposeInput => Onyx.merge(ONYXKEYS.SESSION, {shouldShowComposeInput});
