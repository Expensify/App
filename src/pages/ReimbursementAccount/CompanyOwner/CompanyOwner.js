import lodashGet from 'lodash/get';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ReimbursementAccountLoadingIndicator from '@components/ReimbursementAccountLoadingIndicator';
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

function CompanyOwner({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const startFrom = useMemo(() => 0, []);
    const isLoading = lodashGet(reimbursementAccount, 'isLoading', false);

    const submit = useCallback(() => {
        Navigation.navigate(ROUTES.BANK_COMPLETE_VERIFICATION);
    }, [reimbursementAccount, reimbursementAccountDraft]);
    const UboForm = ({isEditing, onNext, onMove}) => (
        <>
            <Text>Company owner</Text>
            <Button
                success
                onPress={onNext}
                text="Next"
            />
        </>
    );
    const bodyContent = [UboForm];

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});
    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.navigate(ROUTES.BANK_VERIFY_IDENTITY);
        } else {
            prevScreen();
        }
    };

    if (isLoading) {
        return (
            <ReimbursementAccountLoadingIndicator
                isSubmittingVerificationsData
                onBackButtonPress={() => {}}
            />
        );
    }

    return (
        <ScreenWrapper testID={CompanyOwner.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('beneficialOwnersStep.companyOwner')}
            />
            <View style={[styles.ph5, styles.mv3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={handleStepSelected}
                    startStep={4}
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

CompanyOwner.propTypes = propTypes;
CompanyOwner.defaultProps = defaultProps;
CompanyOwner.displayName = 'CompanyOwner';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(CompanyOwner);
