import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import FormHelpMessage from '@components/FormHelpMessage';
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
    /** Supporting copy shown below the page header */
    description: string;

    /** Date option selected before the user makes a local selection */
    initialDateOption: DateOption | '';

    /** Date shown by the custom date picker on initial render */
    initialStartDate: string;

    /** Called when the header back button is pressed */
    onBackButtonPress: () => void;

    /** Called with the selected date, or an empty string for transactions from the beginning */
    onSubmit: (startDate: string) => void;

    /** Identifier passed to the screen wrapper */
    testID: string;

    /** Whether the save button is disabled */
    isSaveDisabled?: boolean;

    /** Whether selecting the custom option resets its value to today's date */
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
    // A typed date the calendar would never have offered has to block saving, and the field shows the reason itself
    const [dateValidationError, setDateValidationError] = useState('');

    const handleSelectDateOption = (dateOption: DateOption) => {
        setErrorText('');
        setLocalDateOption(dateOption);
        if (dateOption !== CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM || !shouldResetStartDateOnCustomSelection) {
            return;
        }
        setStartDate(format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
    };

    const submit = () => {
        if (!isRequiredFulfilled(dateOptionSelected)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && dateValidationError) {
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
                                    onValidationErrorChange={setDateValidationError}
                                />
                            </View>
                        ) : (
                            <FormHelpMessage
                                message={errorText}
                                style={styles.ph5}
                            />
                        )
                    }
                />
            </View>
        </ScreenWrapper>
    );
}

export default CompanyCardTransactionStartDateForm;
