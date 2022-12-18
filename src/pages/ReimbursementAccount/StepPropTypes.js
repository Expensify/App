import PropTypes from 'prop-types';
import * as ReimbursementAccountProps from './reimbursementAccountPropTypes';
import reimbursementAccountDraftPropTypes from './ReimbursementAccountDraftPropTypes';
import {withLocalizePropTypes} from '../../components/withLocalize';

export default {
    /** The bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes.isRequired,

    /** Goes to the previous step */
    onBackButtonPress: PropTypes.func.isRequired,
    ...withLocalizePropTypes,
};
