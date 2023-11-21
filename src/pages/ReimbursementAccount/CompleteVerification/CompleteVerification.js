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

function CompleteVerification({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const startFrom = useMemo(() => 0, []);

    const submit = useCallback(() => {
        console.log(reimbursementAccount, reimbursementAccountDraft);
    }, [reimbursementAccount, reimbursementAccountDraft]);

    const UboForm = ({isEditing, onNext, onMove}) => <Text>Complete verification</Text>;
    const bodyContent = [UboForm];
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.navigate(ROUTES.BANK_COMPANY_OWNER);
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper testID={CompleteVerification.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('validationStep.completeVerification')}
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={handleStepSelected}
                    startStep={5}
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

CompleteVerification.propTypes = propTypes;
CompleteVerification.defaultProps = defaultProps;
CompleteVerification.displayName = 'CompleteVerification';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(CompleteVerification);
