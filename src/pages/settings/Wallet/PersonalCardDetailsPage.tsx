import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImageSVG from '@components/ImageSVG';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useCompanyCardFeedIcons} from '@hooks/useCompanyCardIcons';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCardFeedIcon, isCardConnectionBroken, isPersonalCard} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import variables from '@styles/variables';
import {clearCardErrorField, syncCard, unassignCard} from '@userActions/Card';
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

    const card = cardList?.[cardID];
    const cardBank = card?.bank ?? '';
    const isCardBroken = card ? isCardConnectionBroken(card) : false;
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const displayName = getDisplayNameOrDefault(cardholder);
    const isUserPersonalCard = !!(card && isPersonalCard(card));
    const reimbursableSetting = card?.reimbursable ?? true;
    const isCSVImportedPersonalCard = !!(isUserPersonalCard && card && (card.bank === CONST.COMPANY_CARDS.BANK_NAME.UPLOAD || card.bank.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV)));

    const removeCardFromUser = () => {
        setIsUnassignModalVisible(false);
        if (!card) {
            Navigation.goBack();
            return;
        }
        unassignCard(card);
        Navigation.goBack();
    };

    const updateCard = () => {
        if (!card) {
            return;
        }
        syncCard(card.cardID, card.lastScrapeResult);
    };

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
                                //  onPress={}
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
                        displayName={displayName}
                        customCardNames={customCardNames}
                        expensifyIcons={expensifyIcons}
                        isCSVImportedPersonalCard={isCSVImportedPersonalCard}
                        reimbursableSetting={reimbursableSetting}
                        lastScrape={lastScrape}
                        isOffline={isOffline}
                        onUpdateCard={updateCard}
                        onUnassignCard={() => setIsUnassignModalVisible(true)}
                    />
                )}
                <ConfirmModal
                    title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                    isVisible={isUnassignModalVisible}
                    onConfirm={removeCardFromUser}
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
