import React from 'react';
import lodashGet from 'lodash/get';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import {goToWithdrawalAccountSetupStep} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {Exclamation} from '../../components/Icon/Expensicons';
import Icon from '../../components/Icon';
import colors from '../../styles/colors';

const propTypes = {
    ...withLocalizePropTypes,

    /** Additional data for the account in setup */
    achData: PropTypes.shape({}).isRequired,
};

const ExistingOwnersStep = ({translate, achData}) => {
    const existingOwners = lodashGet(achData, 'existingOwners', []);
    const existingOwnersList = existingOwners.reduce((ownersStr, owner, i, ownersArr) => {
        let separator = ',\n';
        if (i === 0) {
            separator = '\n';
        } else if (i === ownersArr.length - 1) {
            separator = ' and\n';
        }
        return `${ownersStr}${separator}${owner}`;
    }, '');

    return (
        <View style={[styles.flex1, styles.justifyContentBetween]}>
            <HeaderWithCloseButton
                title={translate('existingOwnersStep.headerTitle')}
                onCloseButtonPress={Navigation.dismissModal}
                onBackButtonPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT, achData)}
                shouldShowBackButton
            />
            <View style={[styles.flex1, styles.m5, styles.dFlex, styles.flexRow]}>
                <View style={[styles.mr3]}>
                    <Icon src={Exclamation} fill={colors.red} />
                </View>
                <View style={[styles.flex1]}>
                    <Text style={[styles.mb4]}>
                        <Text>
                            {translate('existingOwnersStep.alreadyInUse')}
                        </Text>
                        <Text style={styles.textStrong}>
                            {existingOwnersList}
                        </Text>
                    </Text>
                    <Text style={[styles.mb4]}>
                        {translate('existingOwnersStep.pleaseAskThemToShare')}
                    </Text>
                    <Text style={styles.textItalic}>
                        <Text>
                            {translate('existingOwnersStep.alternatively')}
                        </Text>
                        <Text
                            style={styles.link}
                            onPress={() => goToWithdrawalAccountSetupStep(CONST.BANK_ACCOUNT.STEP.COMPANY, achData)}
                        >
                            {translate('existingOwnersStep.setUpThisAccountByYourself')}
                        </Text>
                        <Text>
                            {translate('existingOwnersStep.validationProcessAgain')}
                        </Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

ExistingOwnersStep.displayName = 'ExistingOwnersModal';
ExistingOwnersStep.propTypes = propTypes;
export default withLocalize(ExistingOwnersStep);
