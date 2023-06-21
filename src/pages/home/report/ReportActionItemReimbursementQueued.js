import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    submitterDisplayName: PropTypes.string.isRequired,
    isCurrentUserSubmitter: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

function ReportActionItemReimbursementQueued(props) {
    // TODO: add click on Bank Account to open Plaid
    return (
        <Text style={[styles.chatItemMessage, styles.cursorPointer, styles.colorMuted]}>
            {props.translate('iou.waitingOnBankAccount', {submitterDisplayName: props.submitterDisplayName})}
            {props.isCurrentUserSubmitter ? props.translate('common.bankAccount') : props.translate('common.bankAccount')}.
        </Text>
    );
}

ReportActionItemReimbursementQueued.propTypes = propTypes;
ReportActionItemReimbursementQueued.displayName = 'ReportActionItemReimbursementQueued';

export default withLocalize(ReportActionItemReimbursementQueued);
