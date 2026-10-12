import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isRequiredFulfilled} from '@libs/ValidationUtils';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';

type DateOption = ValueOf<typeof CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS>;

type CompanyCardTransactionStartDateFormProps = {
    description: string;
    initialDateOption: DateOption;
    initialStartDate: string;
    onBackButtonPress: () => void;
    onSubmit: (startDate: string) => void;
    testID: string;
    isSaveDisabled?: boolean;
    shouldResetStartDateOnCustomSelection?: boolean;
};

function CompanyCardTransactionStartDateForm({
    description,
    initialDateOption,
    initialStartDate,
    onBackButtonPress,
    onSubmit,
    testID,
    isSaveDisabled = false,
    shouldResetStartDateOnCustomSelection = false,
}: CompanyCardTransactionStartDateFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [localDateOption, setLocalDateOption] = useState<DateOption | undefined>(undefined);
    const dateOptionSelected = localDateOption ?? initialDateOption;
    const [startDate, setStartDate] = useState(initialStartDate);
    const [errorText, setErrorText] = useState('');

    const handleSelectDateOption = (dateOption: DateOption) => {
        setErrorText('');
        setLocalDateOption(dateOption);
        if (dateOption !== CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM || !shouldResetStartDateOnCustomSelection) {
            return;
        }
        setStartDate(format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
    };

    const submit = () => {
        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        onSubmit(dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? '' : startDate);
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

    return (
        <ScreenWrapper
            testID={testID}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <Header>
                <Header.BackButton onPress={onBackButtonPress} />
                <Header.Title title={translate('workspace.moreFeatures.companyCards.transactionStartDate')} />
            </Header>
            <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{description}</Text>
            <View style={styles.flex1}>
                <SelectionList
                    ListItem={SingleSelectListItem}
                    onSelectRow={({value}) => handleSelectDateOption(value)}
                    data={dateOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={dateOptionSelected}
                    shouldUpdateFocusedIndex
                    addBottomSafeAreaPadding
                    footerContent={
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={submit}
                            isDisabled={isSaveDisabled}
                        >
                            <Button.KeyboardShortcut />
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    }
                    listFooterContent={
                        dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM ? (
                            <View style={styles.ph5}>
                                <DatePicker
                                    inputID=""
                                    value={startDate}
                                    label={translate('iou.startDate')}
                                    onInputChange={(value) => {
                                        setErrorText(isRequiredFulfilled(value) ? '' : translate('common.error.fieldRequired'));
                                        setStartDate(value);
                                    }}
                                    minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                                    errorText={errorText}
                                />
                            </View>
                        ) : null
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

export default CompanyCardTransactionStartDateForm;
