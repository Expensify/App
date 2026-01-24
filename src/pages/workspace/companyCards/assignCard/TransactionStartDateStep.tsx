import {format, subDays} from 'date-fns';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST, {DATE_TIME_FORMAT_OPTIONS} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

function TransactionStartDateStep() {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();

    const [assignCard, assignCardMeta] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const isEditing = assignCard?.isEditing;
    const cardToAssign = assignCard?.cardToAssign;
    const formatter = useMemo(() => {
        return new Intl.DateTimeFormat(preferredLocale, DATE_TIME_FORMAT_OPTIONS[CONST.DATE.FNS_FORMAT_STRING]);
    }, [preferredLocale]);

    const [dateOptionSelected, setDateOptionSelected] = useState(cardToAssign?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);
    const [errorText, setErrorText] = useState('');
    const [startDate, setStartDate] = useState(() => assignCard?.startDate ?? cardToAssign?.startDate ?? formatter.format());

    useEffect(() => {
        if (cardToAssign?.dateOption) {
            setDateOptionSelected(cardToAssign.dateOption);
        }

        if (cardToAssign?.startDate) {
            setStartDate(cardToAssign.startDate);
        }
    }, [cardToAssign?.dateOption, cardToAssign?.startDate]);

    const handleBackButtonPress = () => {
        if (isEditing) {
            setAssignCardStepAndData({
                isEditing: false,
            });
        }
        Navigation.goBack();
    };

    const handleSelectDateOption = (dateOption: string) => {
        setErrorText('');
        setDateOptionSelected(dateOption);
        if (dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING) {
            return;
        }
        setStartDate(formatter.format());
    };

    const submit = () => {
        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        const date90DaysBack = format(subDays(new Date(), 90), CONST.DATE.FNS_FORMAT_STRING);

        setAssignCardStepAndData({
            cardToAssign: {
                dateOption: dateOptionSelected,
                startDate: dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? date90DaysBack : startDate,
            },
            isEditing: false,
        });

        Navigation.goBack();
    };

    const dateOptions = [
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
    ];

    const isLoading = isLoadingOnyxValue(assignCardMeta);

    return (
        <InteractiveStepWrapper
            wrapperID="TransactionStartDateStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('workspace.companyCards.assignCard')}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            {isLoading ? (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.h100}
                />
            ) : (
                <>
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
                                    text={translate(isEditing ? 'common.save' : 'common.next')}
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
                </>
            )}
        </InteractiveStepWrapper>
    );
}

export default TransactionStartDateStep;
