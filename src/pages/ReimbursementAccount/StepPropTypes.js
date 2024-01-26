import PropTypes from 'prop-types';
import {withLocalizePropTypes} from '@components/withLocalize';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';

export default {
    /** The bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes.isRequired,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Get a field value from Onyx reimbursementAccountDraft or reimbursementAccount */
    getDefaultStateForField: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};
