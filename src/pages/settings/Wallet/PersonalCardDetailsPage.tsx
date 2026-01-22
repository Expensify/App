import {format, parseISO} from 'date-fns';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedIcon, getDefaultCardName, isUserAssignedPersonalCard, maskCardNumber} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import variables from '@styles/variables';
import {clearCardErrorField, clearCardNameValuePairsErrorField, setPersonalCardReimbursable, syncCompanyCard, unassignCompanyCard} from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type PersonalCardDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS>;

function PersonalCardDetailsPage({route}: PersonalCardDetailsPageProps) {
    const {cardID} = route.params;
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, {canBeMissing: true});
    const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'MoneySearch', 'RemoveMembers', 'Sync']);

    const {isOffline} = useNetwork();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [cardList, cardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const card = cardList?.[cardID];
    const cardBank = card?.bank ?? '';
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const displayName = getDisplayNameOrDefault(cardholder);
    const isPersonalCard = !!(card && isUserAssignedPersonalCard(card, currentUserAccountID));
    const reimbursableSetting = card?.reimbursable ?? true;
    const isCSVImportedPersonalCard = !!(isPersonalCard && card && (card.bank === CONST.COMPANY_CARDS.BANK_NAME.UPLOAD || card.bank.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV)));

    const unassignCard = () => {
        setIsUnassignModalVisible(false);
        if (!card) {
            Navigation.goBack();
            return;
        }
        unassignCompanyCard(card);
        Navigation.goBack();
    };

    const updateCard = () => {
        if (!card) {
            return;
        }
        syncCompanyCard(card.cardID, card.lastScrapeResult);
    };

    const lastScrape = useMemo(() => {
        if (!card?.lastScrape) {
            return translate('workspace.moreFeatures.companyCards.neverUpdated');
        }
        return format(getLocalDateFromDatetime(card?.lastScrape), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING);
    }, [getLocalDateFromDatetime, card?.lastScrape, translate]);

    const getCardIconSource = () => {
        return getCardFeedIcon(cardBank as CompanyCardFeed, illustrations, companyCardFeedIcons);
    };

    // Don't show NotFoundPage if data is still loading
    if (!card && !isLoadingOnyxValue(cardListMetadata)) {
        return <NotFoundPage />;
    }

    // If somehow a non-personal card is accessed via this route, show not found
    if (card && !isPersonalCard) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="PersonalCardDetailsPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.companyCards.cardDetails')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <ScrollView addBottomSafeAreaPadding>
                <View style={[styles.walletCard, styles.mb3]}>
                    <ImageSVG
                        contentFit="contain"
                        src={getCardIconSource()}
                        pointerEvents="none"
                        height={variables.cardPreviewHeight}
                        width={variables.cardPreviewWidth}
                    />
                </View>
                {!cardholder?.validated && (
                    <MenuItem
                        icon={Expensicons.Hourglass}
                        iconStyles={styles.mln2}
                        description={translate('workspace.expensifyCard.cardPending', {name: displayName})}
                        numberOfLinesDescription={0}
                        interactive={false}
                    />
                )}

                <MenuItem
                    label={translate('workspace.moreFeatures.companyCards.cardholder')}
                    title={displayName}
                    titleStyle={styles.mt1}
                    iconStyles={styles.mt1}
                    icon={cardholder?.avatar ?? expensifyIcons.FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    description={cardholder?.login ?? ''}
                    interactive={false}
                />
                <MenuItemWithTopDescription
                    numberOfLinesTitle={3}
                    description={translate('workspace.moreFeatures.companyCards.cardNumber')}
                    title={maskCardNumber(card?.cardName ?? '', cardBank, true)}
                    interactive={false}
                    titleStyle={styles.walletCardNumber}
                />
                <OfflineWithFeedback
                    pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}
                    errorRowStyles={[styles.ph5, styles.mb3]}
                    errors={getLatestErrorField(card?.nameValuePairs ?? {}, 'cardTitle')}
                    onClose={() => {
                        if (!card) {
                            return;
                        }
                        clearCardNameValuePairsErrorField(card.cardID, 'cardTitle');
                    }}
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.moreFeatures.companyCards.cardName')}
                        title={customCardNames?.[cardID] ?? getDefaultCardName(cardholder?.firstName)}
                        shouldShowRightIcon
                        brickRoadIndicator={card?.nameValuePairs?.errorFields?.cardTitle ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_NAME.getRoute(cardID))}
                    />
                </OfflineWithFeedback>

                <ToggleSettingOptionRow
                    title={translate('cardPage.markTransactionsAsReimbursable')}
                    subtitle={translate('cardPage.markTransactionsDescription')}
                    shouldPlaceSubtitleBelowSwitch
                    switchAccessibilityLabel={translate('cardPage.markTransactionsAsReimbursable')}
                    isActive={reimbursableSetting}
                    onToggle={(isOn) => card && setPersonalCardReimbursable(card.cardID, isOn, reimbursableSetting)}
                    pendingAction={card?.pendingFields?.reimbursable}
                    errors={card?.errorFields?.reimbursable ?? undefined}
                    onCloseError={() => card && clearCardErrorField(card.cardID, 'markTransactionsAsReimbursable')}
                    wrapperStyle={[styles.ph5, styles.mb3]}
                />

                <MenuItemWithTopDescription
                    shouldShowRightComponent={card?.isLoadingLastUpdated}
                    rightComponent={<ActivityIndicator style={[styles.popoverMenuIcon]} />}
                    description={translate('workspace.moreFeatures.companyCards.lastUpdated')}
                    title={card?.isLoadingLastUpdated ? translate('workspace.moreFeatures.companyCards.updating') : lastScrape}
                    interactive={false}
                />
                {!isCSVImportedPersonalCard && (
                    <OfflineWithFeedback
                        pendingAction={card?.pendingFields?.scrapeMinDate}
                        errorRowStyles={[styles.ph5, styles.mb3]}
                        errors={getLatestErrorField(card ?? {}, 'scrapeMinDate')}
                        onClose={() => {
                            if (!card) {
                                return;
                            }
                            clearCardErrorField(card.cardID, 'scrapeMinDate');
                        }}
                    >
                        <MenuItemWithTopDescription
                            description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                            title={card?.scrapeMinDate ? format(parseISO(card.scrapeMinDate), CONST.DATE.FNS_FORMAT_STRING) : ''}
                            shouldShowRightIcon
                            brickRoadIndicator={card?.errorFields?.scrapeMinDate ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_EDIT_TRANSACTION_START_DATE.getRoute(cardID))}
                        />
                    </OfflineWithFeedback>
                )}
                <MenuItem
                    icon={expensifyIcons.MoneySearch}
                    title={translate('workspace.common.viewTransactions')}
                    style={styles.mt3}
                    onPress={() => {
                        Navigation.navigate(
                            ROUTES.SEARCH_ROOT.getRoute({
                                query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE, status: CONST.SEARCH.STATUS.EXPENSE.ALL, cardID}),
                            }),
                        );
                    }}
                />
                {!isCSVImportedPersonalCard && (
                    <OfflineWithFeedback
                        pendingAction={card?.pendingFields?.lastScrape}
                        errorRowStyles={[styles.ph5, styles.mb3]}
                        errors={getLatestErrorField(card ?? {}, 'lastScrape')}
                        onClose={() => {
                            if (!card) {
                                return;
                            }
                            clearCardErrorField(card.cardID, 'lastScrape');
                        }}
                    >
                        <MenuItem
                            icon={expensifyIcons.Sync}
                            disabled={isOffline || card?.isLoadingLastUpdated}
                            title={translate('workspace.moreFeatures.companyCards.updateCard')}
                            brickRoadIndicator={card?.errorFields?.lastScrape ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            onPress={updateCard}
                        />
                    </OfflineWithFeedback>
                )}
                <MenuItem
                    icon={expensifyIcons.RemoveMembers}
                    title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                    style={styles.mb1}
                    onPress={() => setIsUnassignModalVisible(true)}
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                    isVisible={isUnassignModalVisible}
                    onConfirm={unassignCard}
                    onCancel={() => setIsUnassignModalVisible(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.moreFeatures.companyCards.unassignCardDescription')}
                    confirmText={translate('workspace.moreFeatures.companyCards.unassign')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

PersonalCardDetailsPage.displayName = 'PersonalCardDetailsPage';

export default PersonalCardDetailsPage;
