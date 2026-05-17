import {format} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {isUsingStagingApi} from '@libs/ApiUtils';
import {getCardFeedIcon, isCardConnectionBroken, isPersonalCard} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import variables from '@styles/variables';
import {clearCardErrorField, deletePersonalCard, syncCard, unassignCard} from '@userActions/Card';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import PersonalCardDetailsHeaderMenu from './PersonalCardDetailsHeaderMenu';

type PersonalCardDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.PERSONAL_CARD_DETAILS>;

function PersonalCardDetailsPage({route}: PersonalCardDetailsPageProps) {
    const {cardID} = route.params;
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [shouldUseStagingServer = isUsingStagingApi()] = useOnyx(ONYXKEYS.SHOULD_USE_STAGING_SERVER);
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const companyCardFeedIcons = useCompanyCardFeedIcons();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'MoneySearch', 'RemoveMembers', 'Sync']);

    const {isOffline} = useNetwork();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardList, cardListMetadata] = useOnyx(ONYXKEYS.CARD_LIST);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [savedColumnLayouts] = useOnyx(ONYXKEYS.NVP_SAVED_CSV_COLUMN_LAYOUT_LIST);

    const card = cardList?.[cardID];
    const cardBank = card?.bank ?? '';
    const isCardBroken = card ? isCardConnectionBroken(card) : false;
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isUserPersonalCard = !!(card && isPersonalCard(card));
    const reimbursableSetting = card?.reimbursable ?? true;
    const isCSVImportedPersonalCard = !!(isUserPersonalCard && card && (card.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD || card.bank.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV)));

    const removeCardFromUser = () => {
        if (!card) {
            return;
        }
        showConfirmModal({
            title: translate('workspace.moreFeatures.companyCards.removeCard'),
            prompt: translate('workspace.moreFeatures.companyCards.removeCardDescription'),
            confirmText: translate('workspace.moreFeatures.companyCards.remove'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            unassignCard(card);
            Navigation.goBack();
        });
    };

    const updateCard = () => {
        if (!card) {
            return;
        }
        syncCard(card.cardID, card.lastScrapeResult);
    };

    const breakConnection = () => {
        if (!card) {
            return;
        }
        syncCard(card.cardID, card.lastScrapeResult, true);
    };

    const confirmDeleteCard = () => {
        if (!card) {
            return;
        }
        showConfirmModal({
            title: translate('walletPage.deleteCard'),
            prompt: translate('walletPage.deleteCardConfirmation'),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            Navigation.goBack();
            const savedColumnLayout = savedColumnLayouts?.[card.cardID];
            deletePersonalCard({cardID: card.cardID, card, allTransactions, allReports, savedColumnLayout});
        });
    };

    // Show "Break connection" only when Mock Bank requests target non-production APIs.
    const isMockBank = cardBank.includes(CONST.COMPANY_CARDS.BANK_CONNECTIONS.MOCK_BANK);
    const isUsingNonProductionAPI = shouldUseStagingServer || CONFIG.IS_USING_LOCAL_WEB;
    const shouldShowBreakConnection = isMockBank && isUsingNonProductionAPI;

    const lastScrape = card?.lastScrape
        ? format(getLocalDateFromDatetime(card.lastScrape), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING)
        : translate('workspace.moreFeatures.companyCards.neverUpdated');

    const getCardIconSource = () => {
        return getCardFeedIcon(cardBank as CompanyCardFeed, illustrations, companyCardFeedIcons);
    };

    // Don't show NotFoundPage if data is still loading
    if (!card && !isLoadingOnyxValue(cardListMetadata)) {
        return <NotFoundPage />;
    }

    // If somehow a non-personal card is accessed via this route, show not found
    if (card && !isUserPersonalCard) {
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
                {isCardBroken && (
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
                        <View style={[styles.ph5, styles.mb3]}>
                            <FormHelpMessage
                                isError
                                shouldShowRedDotIndicator
                                message={translate('personalCard.brokenConnection')}
                                style={styles.mb3}
                            />
                            <Button
                                text={translate('personalCard.fixCard')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_FIX_CONNECTION.getRoute(cardID))}
                                isDisabled={isOffline || card?.isLoadingLastUpdated}
                                style={styles.mb0}
                            />
                        </View>
                    </OfflineWithFeedback>
                )}
                {!!card && (
                    <PersonalCardDetailsHeaderMenu
                        card={card}
                        cardID={cardID}
                        cardholder={cardholder}
                        customCardNames={customCardNames}
                        expensifyIcons={expensifyIcons}
                        isCSVImportedPersonalCard={isCSVImportedPersonalCard}
                        reimbursableSetting={reimbursableSetting}
                        lastScrape={lastScrape}
                        isOffline={isOffline}
                        shouldShowBreakConnection={shouldShowBreakConnection}
                        onUpdateCard={updateCard}
                        onBreakConnection={breakConnection}
                        onUnassignCard={removeCardFromUser}
                        onDeleteCard={confirmDeleteCard}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

PersonalCardDetailsPage.displayName = 'PersonalCardDetailsPage';

export default PersonalCardDetailsPage;
