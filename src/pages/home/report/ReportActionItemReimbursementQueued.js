import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import TextLink from "../../../components/TextLink";
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import * as store from "../../../libs/actions/ReimbursementAccount/store";

const propTypes = {
    submitterDisplayName: PropTypes.string.isRequired,
    isCurrentUserSubmitter: PropTypes.bool.isRequired,
    ...withLocalizePropTypes,
};

function ReportActionItemReimbursementQueued(props) {
    const shouldSubmitterAddBankAccount = props.isCurrentUserSubmitter && !store.hasCreditBankAccount();

    return (
        <Text style={[styles.chatItemMessage, styles.cursorPointer, styles.colorMuted]}>
            {props.translate('iou.waitingOnBankAccount', {submitterDisplayName: props.submitterDisplayName})}
            {shouldSubmitterAddBankAccount ? (
                <TextLink onPress={BankAccounts.openPersonalBankAccountSetupView}>
                    <Text style={[styles.textStrong, styles.link]}>{props.translate('common.bankAccount')}</Text>
                </TextLink>
            ) : props.translate('common.bankAccount')}.
        </Text>
    );
}

ReportActionItemReimbursementQueued.propTypes = propTypes;
ReportActionItemReimbursementQueued.displayName = 'ReportActionItemReimbursementQueued';

export default withLocalize(ReportActionItemReimbursementQueued);
