import {format, subDays} from 'date-fns';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionListWithSections/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function TransactionStartDateStep() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const isEditing = assignCard?.isEditing;
    const data = assignCard?.data;
    const assigneeDisplayName = getPersonalDetailByEmail(data?.email ?? '')?.displayName ?? '';

    const [dateOptionSelected, setDateOptionSelected] = useState(data?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);
    const [errorText, setErrorText] = useState('');
    const [startDate, setStartDate] = useState(() => assignCard?.startDate ?? data?.startDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING));

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                isEditing: false,
            });
            return;
        }
        setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.CARD});
    };

    const handleSelectDateOption = (dateOption: string) => {
        setErrorText('');
        setDateOptionSelected(dateOption);
        if (dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING) {
            return;
        }
        setStartDate(format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
    };

    const submit = () => {
        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        const date90DaysBack = format(subDays(new Date(), 90), CONST.DATE.FNS_FORMAT_STRING);

        setAssignCardStepAndData({
            currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
            data: {
                dateOption: dateOptionSelected,
                startDate: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? date90DaysBack : startDate,
            },
            isEditing: false,
        });
    };

    const dateOptions = useMemo(
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
        [dateOptionSelected, translate],
    );

    return (
        <InteractiveStepWrapper
            wrapperID={TransactionStartDateStep.displayName}
            handleBackButtonPress={handleBackButtonPress}
            startStepIndex={2}
            stepNames={CONST.COMPANY_CARD.STEP_NAMES}
            headerTitle={translate('workspace.companyCards.assignCard')}
            headerSubtitle={assigneeDisplayName}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mt3]}>{translate('workspace.companyCards.chooseTransactionStartDate')}</Text>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.startDateDescription')}</Text>
            <View style={styles.flex1}>
                <SelectionList
                    ListItem={SingleSelectListItem}
                    onSelectRow={({value}) => handleSelectDateOption(value)}
                    data={dateOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={dateOptionSelected}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                    shouldHighlightSelectedItem={false}
                    footerContent={
                        <Button
                            success
                            large
                            pressOnEnter
                            text={translate(isEditing ? 'common.confirm' : 'common.next')}
                            onPress={submit}
                        />
                    }
                    listFooterContent={
                        dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM ? (
                            <View style={[styles.ph5]}>
                                <DatePicker
                                    inputID=""
                                    value={startDate}
                                    label={translate('iou.startDate')}
                                    onInputChange={(value) => {
                                        if (!isRequiredFulfilled(value)) {
                                            setErrorText(translate('common.error.fieldRequired'));
                                        } else {
                                            setErrorText('');
                                        }
                                        setStartDate(value);
                                    }}
                                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                                    maxDate={new Date()}
                                    errorText={errorText}
                                />
                            </View>
                        ) : null
                    }
                />
            </View>
        </InteractiveStepWrapper>
    );
}

TransactionStartDateStep.displayName = 'TransactionStartDateStep';

export default TransactionStartDateStep;
