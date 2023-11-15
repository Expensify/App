import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import styles from '@styles/styles';
import ONYXKEYS from '@src/ONYXKEYS';

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

const STEPS_HEADER_HEIGHT = 40;
// TODO Will most likely come from different place
const STEP_NAMES = ['1', '2', '3', '4', '5'];

function BusinessInfo({reimbursementAccount, reimbursementAccountDraft}) {
    const {translate} = useLocalize();

    const startFrom = useMemo(() => 0, []);

    const submit = useCallback(() => {
        console.log(reimbursementAccount, reimbursementAccountDraft);
    }, [reimbursementAccount, reimbursementAccountDraft]);

    const bodyContent = [
        <View>
            <Text>Business info</Text>
        </View>,
    ];
    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent, startFrom, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            // TODO replace it with navigation to ReimbursementAccountPage once base is updated
        } else {
            prevScreen();
        }
    };

    return (
        <ScreenWrapper testID={BusinessInfo.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('companyStep.businessInfo')}
            />
            <View style={[styles.ph5, styles.mv3, {height: STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    onStepSelected={() => {}}
                    // TODO Will be replaced with proper values
                    startStep={2}
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

BusinessInfo.propTypes = propTypes;
BusinessInfo.defaultProps = defaultProps;
BusinessInfo.displayName = 'BusinessInfo';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(BusinessInfo);
