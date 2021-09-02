import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import {goToWithdrawalAccountSetupStep} from '../../libs/actions/BankAccounts';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** Reimbursement account state with list of existing owners */
    reimbursementAccount: PropTypes.shape({
        /** The existing owners for if the bank account is already owned */
        existingOwners: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    ...withLocalizePropTypes,
};

const ExistingOwners = ({reimbursementAccount, translate}) => (
    <View>
        <Text style={[styles.mb4]}>
            <Text>
                {translate('bankAccount.error.existingOwners.alreadyInUse')}
            </Text>
            {reimbursementAccount.existingOwners && _.map(reimbursementAccount.existingOwners, (existingOwner, i) => {
                let separator = ', ';
                if (i === 0) {
                    separator = '';
                } else if (i === reimbursementAccount.existingOwners.length - 1) {
                    separator = ` ${translate('common.and')} `;
                }
                return (
                    <React.Fragment key={existingOwner}>
                        <Text>{separator}</Text>
                        <Text style={styles.textStrong}>{existingOwner}</Text>
                        {i === reimbursementAccount.existingOwners.length - 1 && <Text>.</Text>}
                    </React.Fragment>
                );
            })}
        </Text>
        <Text style={[styles.mb4]}>
            {translate('bankAccount.error.existingOwners.pleaseAskThemToShare')}
        </Text>
        <Text>
            <Text>
                {translate('bankAccount.error.existingOwners.alternatively')}
            </Text>
            <Text
                style={styles.link}
                onPress={() => goToWithdrawalAccountSetupStep(
                    CONST.BANK_ACCOUNT.STEP.COMPANY,
                    reimbursementAccount.achData || {},
                )}
            >
                {translate(
                    'bankAccount.error.existingOwners.setUpThisAccountByYourself',
                )}
            </Text>
            <Text>
                {translate('bankAccount.error.existingOwners.validationProcessAgain')}
            </Text>
        </Text>
    </View>
);


ExistingOwners.propTypes = propTypes;
export default compose(
    withLocalize,
    withOnyx({
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    }),
)(ExistingOwners);
