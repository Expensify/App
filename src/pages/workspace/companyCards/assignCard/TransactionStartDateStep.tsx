import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function TransactionStartDateStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [dateOptionSelected, setDateOptionSelected] = useState('');

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD);
    const isEditing = assignCard?.isEditing;

    const handleBackButtonPress = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CARD});
    };

    const submit = () => {
        CompanyCards.setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION});
    };

    const data = useMemo(
        () => [
            {
                value: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
                text: translate('workspace.companyCards.fromTheBeginning'),
                keyForList: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
                isSelected: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING,
            },
            {
                value: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
                text: translate('workspace.companyCards.customStartDate'),
                keyForList: CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
                isSelected: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM,
            },
        ],
        [dateOptionSelected],
    );

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
            <SelectionList
                ListItem={RadioListItem}
                onSelectRow={({value}) => setDateOptionSelected(value)}
                sections={[{data}]}
                shouldSingleExecuteRowSelect
                initiallyFocusedOptionKey={dateOptionSelected}
                shouldUpdateFocusedIndex
            />
            <Button
                success
                large
                pressOnEnter
                text={translate(isEditing ? 'common.confirm' : 'common.next')}
                onPress={submit}
                style={styles.m5}
            />
        </InteractiveStepWrapper>
    );
}

TransactionStartDateStep.displayName = 'TransactionStartDateStep';

export default TransactionStartDateStep;
