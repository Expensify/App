/* eslint-disable @lwc/lwc/no-async-await */
import _ from 'underscore';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as Localize from '../../../Localize';
import * as API from '../../../API';
import DateUtils from '../../../DateUtils';

async function beginAppleSignIn() {
    // performs login request
    console.log('starting login request, desktop', window);
    window.AppleID.auth.signIn();
}

export default beginAppleSignIn;
