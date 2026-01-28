import {cardByIdSelector} from '@selectors/Card';
import {format, parseISO, subDays} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import {updateAssignedCardTransactionStartDate} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DateOption = ValueOf<typeof CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS>;
type PersonalCardEditTransactionStartDatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_EDIT_TRANSACTION_START_DATE>;

function PersonalCardEditTransactionStartDatePage({route}: PersonalCardEditTransactionStartDatePageProps) {
    const {cardID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true, selector: cardByIdSelector(cardID)});
    const currentStartDate = card?.scrapeMinDate;

    const [dateOptionSelected, setDateOptionSelected] = useState<DateOption>(CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);

    const [startDate, setStartDate] = useState(() => {
        if (currentStartDate) {
            return format(parseISO(currentStartDate), CONST.DATE.FNS_FORMAT_STRING);
        }
        return format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    });

    const [errorText, setErrorText] = useState('');

    const handleSelectDateOption = (dateOption: DateOption) => {
        setErrorText('');
        setDateOptionSelected(dateOption);
        if (dateOption === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING) {
            return;
        }
        // Reset to current date when switching to custom
        if (!currentStartDate) {
            setStartDate(format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
        }
    };

    const getNewStartDate = () => {
        const date90DaysBack = format(subDays(new Date(), 90), CONST.DATE.FNS_FORMAT_STRING);
        return dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? date90DaysBack : startDate;
    };

    const submit = () => {
        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        const newStartDate = getNewStartDate();

        if (currentStartDate !== newStartDate) {
            updateAssignedCardTransactionStartDate(cardID, newStartDate, currentStartDate);
        }
        Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID));
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
            testID="PersonalCardEditTransactionStartDatePage"
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_DETAILS.getRoute(cardID))}
            />
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
                            text={translate('common.save')}
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
        </ScreenWrapper>
    );
}

PersonalCardEditTransactionStartDatePage.displayName = 'PersonalCardEditTransactionStartDatePage';

export default PersonalCardEditTransactionStartDatePage;
