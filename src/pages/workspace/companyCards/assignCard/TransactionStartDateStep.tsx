import {format, subDays} from 'date-fns';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
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
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import {setAssignCardStepAndData} from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

function TransactionStartDateStep({route}: {route: PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE>}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const feed = route.params.feed;
    const cardID = route.params.cardID;

    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const isEditing = assignCard?.isEditing;
    const data = assignCard?.data;
    const assigneeDisplayName = Str.removeSMSDomain(getPersonalDetailByEmail(data?.email ?? '')?.displayName ?? '');

    const [dateOptionSelected, setDateOptionSelected] = useState(data?.dateOption ?? CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);
    const [errorText, setErrorText] = useState('');
    const [startDate, setStartDate] = useState(() => assignCard?.startDate ?? data?.startDate ?? format(new Date(), CONST.DATE.FNS_FORMAT_STRING));

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
        setStartDate(format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
    };

    const submit = () => {
        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        const date90DaysBack = format(subDays(new Date(), 90), CONST.DATE.FNS_FORMAT_STRING);

        setAssignCardStepAndData({
            data: {
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

    return (
        <InteractiveStepWrapper
            wrapperID="TransactionStartDateStep"
            handleBackButtonPress={handleBackButtonPress}
            headerTitle={translate('workspace.companyCards.assignCard')}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
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
        </InteractiveStepWrapper>
    );
}

export default TransactionStartDateStep;
