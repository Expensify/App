import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import {goToWithdrawalAccountSetupStep} from '../../libs/actions/BankAccounts';

const propTypes = {
    /** Reimbursement account state with list of existing owners */
    reimbursementAccount: PropTypes.shape({
        /** The existing owners for if the bank account is already owned */
        existingOwners: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    ...withLocalizePropTypes,
};

const ExistingOwners = (props) => {
    const existingOwners = props.reimbursementAccount.existingOwners;
    return (
        <View>
            <Text style={[styles.mb4]}>
                <Text>
                    {props.translate('bankAccount.error.existingOwners.alreadyInUse')}
                </Text>
                {existingOwners && _.map(existingOwners, (existingOwner, i) => {
                    let separator = ', ';
                    if (i === 0) {
                        separator = '';
                    } else if (i === existingOwners.length - 1) {
                        separator = ` ${props.translate('common.and')} `;
                    }
                    return (
                        <>
                            <Text>{separator}</Text>
                            <Text style={styles.textStrong}>{existingOwner}</Text>
                            {i === existingOwners.length - 1 && <Text>.</Text>}
                        </>
                    );
                })}
            </Text>
            <Text style={[styles.mb4]}>
                {props.translate('bankAccount.error.existingOwners.pleaseAskThemToShare')}
            </Text>
            <Text>
                <Text>
                    {props.translate('bankAccount.error.existingOwners.alternatively')}
                </Text>
                <Text
                    style={styles.link}
                    onPress={() => goToWithdrawalAccountSetupStep(
                        CONST.BANK_ACCOUNT.STEP.COMPANY,
                        props.achData,
                    )}
                >
                    {props.translate(
                        'bankAccount.error.existingOwners.setUpThisAccountByYourself',
                    )}
                </Text>
                <Text>
                    {props.translate('bankAccount.error.existingOwners.validationProcessAgain')}
                </Text>
            </Text>
        </View>
    );
};

ExistingOwners.propTypes = propTypes;
export default withLocalize(ExistingOwners);
