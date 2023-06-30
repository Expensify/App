import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import TextLink from '../../../components/TextLink';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import * as store from '../../../libs/actions/ReimbursementAccount/store';

const propTypes = {
    submitterDisplayName: PropTypes.string.isRequired,
    isCurrentUserSubmitter: PropTypes.bool.isRequired,
    ...withLocalizePropTypes,
};

function ReportActionItemReimbursementQueued(props) {
    const shouldSubmitterAddBankAccount = props.isCurrentUserSubmitter && !store.hasCreditBankAccount();

    if (shouldSubmitterAddBankAccount) {
        return (
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>
                {props.translate('iou.paymentWaitingOnSubmitter', {submitterDisplayName: props.submitterDisplayName})}
                <TextLink onPress={BankAccounts.openPersonalBankAccountSetupView}>
                    <Text style={[styles.textStrong, styles.cursorPointer, styles.link]}>{props.translate('common.bankAccount')}</Text>
                </TextLink>
            </Text>
        );
    }

    return <Text style={[styles.chatItemMessage, styles.colorMuted]}>{props.translate('iou.waitingOnBankAccount', {submitterDisplayName: props.submitterDisplayName})}</Text>;
}

ReportActionItemReimbursementQueued.propTypes = propTypes;
ReportActionItemReimbursementQueued.displayName = 'ReportActionItemReimbursementQueued';

export default withLocalize(ReportActionItemReimbursementQueued);
