import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';

const propTypes = {
    amount: PropTypes.string.isRequired,
    submitterDisplayName: PropTypes.string.isRequired,
    isFromSubmitterAddingBankAccount: PropTypes.bool.isRequired,

    ...withLocalizePropTypes,
};

function ReportActionItemReimbursed(props) {
    return (
        <Text style={[styles.chatItemMessage, styles.colorMuted]}>
            {props.isFromSubmitterAddingBankAccount ? props.translate('iou.settledAfterAddedBankAccount', {submitterDisplayName: props.submitterDisplayName}) : props.translate('iou.payerSettled', {amount: props.amount})}
        </Text>
    );
}

ReportActionItemReimbursed.propTypes = propTypes;
ReportActionItemReimbursed.displayName = 'ReportActionItemAddedBankAccount';

export default withLocalize(ReportActionItemReimbursed);
