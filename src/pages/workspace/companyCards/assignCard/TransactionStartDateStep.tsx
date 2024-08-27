import React from 'react';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';

function TransactionStartDateStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleBackButtonPress = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CARD});
    };

    return (
        <InteractiveStepWrapper
            wrapperID={TransactionStartDateStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseTransactionStartDate')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.startDateDescription')}</Text>
        </InteractiveStepWrapper>
    );
}

TransactionStartDateStep.displayName = 'TransactionStartDateStep';

export default TransactionStartDateStep;
