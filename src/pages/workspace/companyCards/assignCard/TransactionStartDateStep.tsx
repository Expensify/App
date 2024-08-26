import React from 'react';
import {View} from 'react-native';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function TransactionStartDateStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleBackButtonPress = () => {};

    return (
        <InteractiveStepWrapper
            wrapperID={TransactionStartDateStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.chooseCard')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.startDateDescription')}</Text>
        </InteractiveStepWrapper>
    );
}

TransactionStartDateStep.displayName = 'TransactionStartDateStep';

export default TransactionStartDateStep;
