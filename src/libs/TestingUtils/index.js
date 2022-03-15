import CONFIG from '../../CONFIG';
import * as Test from '../actions/Test';

if (!CONFIG.IS_IN_PRODUCTION) {
    window.TestActions = {
        invalidateAuthToken: Test.invalidateAuthToken,
        invalidateCredentials: Test.invalidateCredentials,
    };
}
