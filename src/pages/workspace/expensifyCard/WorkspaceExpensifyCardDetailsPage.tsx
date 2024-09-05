import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import Badge from '@components/Badge';
import ConfirmModal from '@components/ConfirmModal';
import DecisionModal from '@components/DecisionModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceExpensifyCardDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS>;

function WorkspaceExpensifyCardDetailsPage({route}: WorkspaceExpensifyCardDetailsPageProps) {
    const {policyID, cardID, backTo} = route.params;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const [isDeactivateModalVisible, setIsDeactivateModalVisible] = useState(false);
    const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use the correct modal type
    const {isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const card = cardsList?.[cardID];
    const cardholder = personalDetails?.[card?.accountID ?? -1];
    const isVirtual = !!card?.nameValuePairs?.isVirtual;
    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(card?.availableSpend);
    const formattedLimit = CurrencyUtils.convertToDisplayString(card?.nameValuePairs?.unapprovedExpenseLimit);
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(cardholder);
    const translationForLimitType = CardUtils.getTranslationKeyForLimitType(card?.nameValuePairs?.limitType);

    const fetchCardDetails = useCallback(() => {
        Card.openCardDetailsPage(Number(cardID));
    }, [cardID]);

    const {isOffline} = useNetwork({onReconnect: fetchCardDetails});

    useEffect(() => fetchCardDetails(), [fetchCardDetails]);

    const deactivateCard = () => {
        setIsDeactivateModalVisible(false);
        Card.deactivateCard(workspaceAccountID, card);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceExpensifyCardDetailsPage.displayName}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithBackButton
                            title={translate('workspace.expensifyCard.cardDetails')}
                            onBackButtonPress={() => Navigation.goBack(backTo)}
                        />
                        <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                            <View style={[styles.walletCard, styles.mb3]}>
                                <ImageSVG
                                    contentFit="contain"
                                    src={ExpensifyCardImage}
                                    pointerEvents="none"
                                    height={variables.cardPreviewHeight}
                                    width={variables.cardPreviewWidth}
                                />
                                <Badge
                                    badgeStyles={styles.cardBadge}
                                    textStyles={styles.cardBadgeText}
                                    text={translate(isVirtual ? 'workspace.expensifyCard.virtual' : 'workspace.expensifyCard.physical')}
                                />
                            </View>

                            <MenuItem
                                label={translate('workspace.card.issueNewCard.cardholder')}
                                title={displayName}
                                icon={cardholder?.avatar ?? FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                description={cardholder?.login}
                                interactive={false}
                            />
                            <MenuItemWithTopDescription
                                description={translate(isVirtual ? 'cardPage.virtualCardNumber' : 'cardPage.physicalCardNumber')}
                                title={CardUtils.maskCard(card?.lastFourPAN)}
                                interactive={false}
                                titleStyle={styles.walletCardNumber}
                            />
                            <OfflineWithFeedback pendingAction={card?.pendingFields?.availableSpend}>
                                <MenuItemWithTopDescription
                                    description={translate('cardPage.availableSpend')}
                                    title={formattedAvailableSpendAmount}
                                    interactive={false}
                                    titleStyle={styles.newKansasLarge}
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.unapprovedExpenseLimit}>
                                <MenuItemWithTopDescription
                                    description={translate('workspace.expensifyCard.cardLimit')}
                                    title={formattedLimit}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT.getRoute(policyID, cardID))}
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.limitType}>
                                <MenuItemWithTopDescription
                                    description={translate('workspace.card.issueNewCard.limitType')}
                                    title={translationForLimitType ? translate(translationForLimitType) : ''}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE.getRoute(policyID, cardID))}
                                />
                            </OfflineWithFeedback>
                            <OfflineWithFeedback pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}>
                                <MenuItemWithTopDescription
                                    description={translate('workspace.card.issueNewCard.cardName')}
                                    title={card?.nameValuePairs?.cardTitle}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_NAME.getRoute(policyID, cardID))}
                                />
                            </OfflineWithFeedback>
                            <MenuItem
                                icon={Expensicons.Trashcan}
                                iconFill={theme.icon}
                                title={translate('workspace.expensifyCard.deactivate')}
                                style={styles.mv1}
                                onPress={() => (isOffline ? setIsOfflineModalVisible(true) : setIsDeactivateModalVisible(true))}
                            />
                            <ConfirmModal
                                title={translate('workspace.card.deactivateCardModal.deactivateCard')}
                                isVisible={isDeactivateModalVisible}
                                onConfirm={deactivateCard}
                                onCancel={() => setIsDeactivateModalVisible(false)}
                                shouldSetModalVisibility={false}
                                prompt={translate('workspace.card.deactivateCardModal.deactivateConfirmation')}
                                confirmText={translate('workspace.card.deactivateCardModal.deactivate')}
                                cancelText={translate('common.cancel')}
                                danger
                            />
                            <DecisionModal
                                title={translate('common.youAppearToBeOffline')}
                                prompt={translate('common.offlinePrompt')}
                                isSmallScreenWidth={isSmallScreenWidth}
                                onSecondOptionSubmit={() => setIsOfflineModalVisible(false)}
                                secondOptionText={translate('common.buttonConfirm')}
                                isVisible={isOfflineModalVisible}
                                onClose={() => setIsOfflineModalVisible(false)}
                            />
                        </ScrollView>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardDetailsPage.displayName = 'WorkspaceExpensifyCardDetailsPage';

export default WorkspaceExpensifyCardDetailsPage;
