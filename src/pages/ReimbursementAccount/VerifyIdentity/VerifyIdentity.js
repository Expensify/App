import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import useThemeStyles from '@styles/useThemeStyles';
import * as BankAccounts from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';
import OnfidoInitialize from './substeps/OnfidoInitialize';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    onBackButtonPress: PropTypes.func.isRequired,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

// TODO Will most likely come from different place
const STEPS_HEADER_HEIGHT = 40;
const STEP_NAMES = ['1', '2', '3', '4', '5'];

const bodyContent = [OnfidoInitialize];

function VerifyIdentity({reimbursementAccount, onBackButtonPress}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const submit = useCallback(
        (onfidoData) => {
            BankAccounts.verifyIdentityForBankAccount(getDefaultValueForReimbursementAccountField(reimbursementAccount, 'bankAccountID', 0), onfidoData);
            BankAccounts.updateReimbursementAccountDraft({isOnfidoSetupComplete: true});
        },
        [reimbursementAccount],
    );

    const {componentToRender: SubStep, isEditing, nextScreen, moveTo} = useSubStep({bodyContent, startFrom: 0, onFinished: submit});

    return (
        <ScreenWrapper testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={onBackButtonPress}
                title={translate('onfidoStep.verifyIdentity')}
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    startStep={3}
                    stepNames={STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

VerifyIdentity.propTypes = propTypes;
VerifyIdentity.defaultProps = defaultProps;
VerifyIdentity.displayName = 'VerifyIdentity';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(VerifyIdentity);
