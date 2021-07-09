import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import {goToWithdrawalAccountSetupStep} from '../../../libs/actions/BankAccounts';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';

const propTypes = {
    ...withLocalizePropTypes,
    existingOwners: PropTypes.arrayOf(PropTypes.string).isRequired,

    // TODO
    achData: PropTypes.shape({}).isRequired,
};

const BankAccountExistingOwners = ({translate, existingOwners, achData}) => {
    const existingOwnersList = existingOwners.reduce((ownersStr, owner, i, ownersArr) => {
        let separator = ', ';
        if (i === 0) {
            separator = '';
        } else if (i === ownersArr.length - 1) {
            separator = ' and ';
        }
        return `${ownersStr}${separator}${owner}`;
    }, '');

    return (
        <Text style={[styles.growlNotificationText, styles.cursorDefault]}>
            <Text>
                {translate('bankAccount.existingOwnersError.alreadyInUse')}
            </Text>
            <Text style={styles.textStrong}>
                {existingOwnersList}
            </Text>
            <Text>
                {translate('bankAccount.existingOwnersError.pleaseAskThemToShare')}
            </Text>

            <Text style={styles.textItalic}>
                <Text>
                    {translate('bankAccount.existingOwnersError.alternatively')}
                </Text>
                <Text
                    style={styles.link}
                    onPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY, achData)}
                >
                    {translate('bankAccount.existingOwnersError.setUpThisAccountByYourself')}
                </Text>
                <Text>
                    {translate('bankAccount.existingOwnersError.validationProcessAgain')}
                </Text>
            </Text>
        </Text>
    );
};

BankAccountExistingOwners.displayName = 'BankAccountExistingOwners';
BankAccountExistingOwners.propTypes = propTypes;
export default withLocalize(BankAccountExistingOwners);
