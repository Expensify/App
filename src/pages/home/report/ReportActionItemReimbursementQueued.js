import React from 'react';
import PropTypes from 'prop-types';
import {View} from "react-native";
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import * as store from '../../../libs/actions/ReimbursementAccount/store';
import Button from "../../../components/Button";

const propTypes = {
    submitterDisplayName: PropTypes.string.isRequired,
    isCurrentUserSubmitter: PropTypes.bool.isRequired,
    ...withLocalizePropTypes,
};

function ReportActionItemReimbursementQueued(props) {
    const shouldSubmitterAddBankAccount = props.isCurrentUserSubmitter && !store.hasCreditBankAccount();

    return (
        <View style={[styles.chatItemMessage]}>
            <Text style={[styles.chatItemMessage, styles.colorMuted]}>{props.translate('iou.waitingOnBankAccount', {submitterDisplayName: props.submitterDisplayName})}</Text>
            {shouldSubmitterAddBankAccount && (
                <Button
                    success
                    style={[styles.w100, styles.requestPreviewBox]}
                    text={props.translate('bankAccount.addBankAccount')}
                    onPress={BankAccounts.openPersonalBankAccountSetupView}
                    pressOnEnter
                />
            )}
        </View>
    );
}

ReportActionItemReimbursementQueued.propTypes = propTypes;
ReportActionItemReimbursementQueued.displayName = 'ReportActionItemReimbursementQueued';

export default withLocalize(ReportActionItemReimbursementQueued);
