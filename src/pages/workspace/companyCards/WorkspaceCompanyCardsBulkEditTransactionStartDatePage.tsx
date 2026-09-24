import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsList from '@hooks/useCardsList';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCompanyCardFeed, getCompanyFeeds, getDomainOrWorkspaceAccountID} from '@libs/CardUtils';
import Growl from '@libs/Growl';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isRequiredFulfilled} from '@libs/ValidationUtils';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {bulkUpdateCardTransactionStartDate} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeedWithDomainID} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';

type DateOption = ValueOf<typeof CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS>;
type WorkspaceCompanyCardsBulkEditTransactionStartDatePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.COMPANY_CARDS_BULK_EDIT_TRANSACTION_START_DATE
>;

function WorkspaceCompanyCardsBulkEditTransactionStartDatePage({route}: WorkspaceCompanyCardsBulkEditTransactionStartDatePageProps) {
    const {policyID} = route.params;
    const feedName: CompanyCardFeedWithDomainID = route.params.feed;
    const cardIDs = (route.params.cardIDs ?? '').split(',').filter(Boolean);
    const bank = getCompanyCardFeed(feedName);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;

    const [cardFeeds] = useCardFeeds(policyID);
    const companyFeeds = getCompanyFeeds(cardFeeds);
    const domainOrWorkspaceAccountID = getDomainOrWorkspaceAccountID(workspaceAccountID, companyFeeds[feedName]);
    const [allBankCards] = useCardsList(feedName);

    const [dateOptionSelected, setDateOptionSelected] = useState<DateOption>(CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM);
    const [startDate, setStartDate] = useState(() => format(new Date(), CONST.DATE.FNS_FORMAT_STRING));
    const [errorText, setErrorText] = useState('');

    const goBackToCompanyCards = () => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));

    const handleSelectDateOption = (dateOption: DateOption) => {
        setErrorText('');
        setDateOptionSelected(dateOption);
    };

    const submit = () => {
        if (dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.CUSTOM && !isRequiredFulfilled(startDate)) {
            setErrorText(translate('common.error.fieldRequired'));
            return;
        }

        const newStartDate = dateOptionSelected === CONST.COMPANY_CARD.TRANSACTION_START_DATE_OPTIONS.FROM_BEGINNING ? '' : startDate;
        bulkUpdateCardTransactionStartDate(
            domainOrWorkspaceAccountID,
            bank,
            cardIDs.map((cardID) => ({
                cardID,
                oldStartDate: allBankCards?.[cardID]?.scrapeMinDate,
            })),
            newStartDate,
        ).then(() => {
            Growl.success(translate('workspace.companyCards.bulkStartDateUpdated'), {position: CONST.GROWL.POSITION.BOTTOM_RIGHT});
        });
        goBackToCompanyCards();
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
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceCompanyCardsBulkEditTransactionStartDatePage"
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                    onBackButtonPress={goBackToCompanyCards}
                />
                <Text style={[styles.textSupporting, styles.ph5, styles.mv3]}>{translate('workspace.companyCards.bulkEditStartDateDescription')}</Text>
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
                                isDisabled={cardIDs.length === 0}
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
                                            if (!isRequiredFulfilled(value)) {
                                                setErrorText(translate('common.error.fieldRequired'));
                                            } else {
                                                setErrorText('');
                                            }
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
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardsBulkEditTransactionStartDatePage;
