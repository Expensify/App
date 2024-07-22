import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import Badge from '@components/Badge';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

// TODO: remove when Onyx data is available
const mockedCard = {
    accountID: 885646,
    availableSpend: 1000,
    nameValuePairs: {
        cardTitle: 'Test 1',
        isVirtual: true,
        limit: 2000,
        limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
    },
    lastFourPAN: '1234',
};

type WorkspaceExpensifyCardDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_DETAILS>;

function WorkspaceExpensifyCardDetailsPage({route}: WorkspaceExpensifyCardDetailsPageProps) {
    const {policyID, cardID, backTo} = route.params;

    const [isDeactivateModalVisible, setIsDeactivateModalVisible] = useState(false);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const card = cardsList?.[cardID] ?? mockedCard;
    const cardholder = personalDetails?.[card.accountID ?? -1];
    const isVirtual = !!card.nameValuePairs?.isVirtual;
    const formattedAvailableSpendAmount = CurrencyUtils.convertToDisplayString(card.availableSpend);
    const formattedLimit = CurrencyUtils.convertToDisplayString(card.nameValuePairs?.limit);
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(cardholder);
    const translationForLimitType = CardUtils.getTranslationKeyForLimitType(card.nameValuePairs?.limitType);

    const deactivateCard = () => {
        setIsDeactivateModalVisible(false);

        // TODO: add API call when it's supported https://github.com/Expensify/Expensify/issues/407841

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
                                title={CardUtils.maskCard(card.lastFourPAN)}
                                interactive={false}
                                titleStyle={styles.walletCardNumber}
                            />
                            <MenuItemWithTopDescription
                                description={translate('cardPage.availableSpend')}
                                title={formattedAvailableSpendAmount}
                                interactive={false}
                                titleStyle={styles.newKansasLarge}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.expensifyCard.cardLimit')}
                                title={formattedLimit}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_LIMIT.getRoute(policyID, cardID))}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.card.issueNewCard.limitType')}
                                title={translationForLimitType ? translate(translationForLimitType) : ''}
                                shouldShowRightIcon
                                onPress={() => {}} // TODO: navigate to Edit limit type page https://github.com/Expensify/App/issues/44328
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.card.issueNewCard.cardName')}
                                title={card.nameValuePairs?.cardTitle}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_NAME.getRoute(policyID, cardID))}
                            />
                            <MenuItem
                                icon={Expensicons.Trashcan}
                                iconFill={theme.icon}
                                title={translate('workspace.expensifyCard.deactivate')}
                                style={styles.mv1}
                                onPress={() => setIsDeactivateModalVisible(true)}
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
                        </ScrollView>
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceExpensifyCardDetailsPage.displayName = 'WorkspaceExpensifyCardDetailsPage';

export default WorkspaceExpensifyCardDetailsPage;
