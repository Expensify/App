import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import Navigation from '@navigation/Navigation';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import handleStepSelected from '@pages/ReimbursementAccount/utils/handleStepSelected';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

function VerifyIdentity({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const startFrom = useMemo(() => 0, []);

    const submit = useCallback(() => {
        console.log(reimbursementAccount, reimbursementAccountDraft);
        Navigation.navigate(ROUTES.BANK_COMPANY_OWNER);
    }, [reimbursementAccount, reimbursementAccountDraft]);

    const Onfido = ({isEditing, onNext, onMove}) => (
        <>
            <Text>Verify identity</Text>
            <Button
                success
                onPress={onNext}
                text="Next"
            />
        </>
    );

    const bodyContent = [Onfido];
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            BankAccounts.clearOnfidoToken();
            Navigation.navigate(ROUTES.BANK_PERSONAL_INFO);
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper testID={VerifyIdentity.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('onfidoStep.verifyIdentity')}
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={handleStepSelected}
                    startStep={3}
                    stepNames={CONST.BANK_ACCOUNT.STEPS_HEADER_STEP_NAMES}
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
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(VerifyIdentity);
