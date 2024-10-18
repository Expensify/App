import type {StackScreenProps} from '@react-navigation/stack';
import {format} from 'date-fns';
import React, {useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
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
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_DETAILS>;

function WorkspaceCompanyCardDetailsPage({route}: WorkspaceCompanyCardDetailsPageProps) {
    const {policyID, cardID, backTo, bank} = route.params;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const policy = usePolicy(policyID);
    const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allBankCards] = useOnyx(`${ONYXKEYS.CARD_LIST}`);
    const card = allBankCards?.[cardID];

    const cardholder = personalDetails?.[card?.accountID ?? -1];
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(cardholder);
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card);

    const unassignCard = () => {
        setIsUnassignModalVisible(false);
        CompanyCards.unassignWorkspaceCompanyCard(workspaceAccountID, cardID, bank);
        Navigation.goBack();
    };

    const updateCard = () => {
        CompanyCards.updateWorkspaceCompanyCard(workspaceAccountID, cardID, bank);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceCompanyCardDetailsPage.displayName}
            >
                {({safeAreaPaddingBottomStyle}) => (
                    <>
                        <HeaderWithBackButton
                            title={translate('workspace.moreFeatures.companyCards.cardDetails')}
                            onBackButtonPress={() => Navigation.goBack(backTo)}
                        />
                        <ScrollView contentContainerStyle={safeAreaPaddingBottomStyle}>
                            <View style={[styles.walletCard, styles.mb3]}>
                                <ImageSVG
                                    contentFit="contain"
                                    src={CardUtils.getCardDetailsImage(card?.bank ?? '')}
                                    pointerEvents="none"
                                    height={variables.cardPreviewHeight}
                                    width={variables.cardPreviewWidth}
                                />
                            </View>

                            <MenuItem
                                label={translate('workspace.moreFeatures.companyCards.cardholder')}
                                title={displayName}
                                icon={cardholder?.avatar ?? FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                description={cardholder?.login}
                                interactive={false}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.moreFeatures.companyCards.cardNumber')}
                                title={CardUtils.maskCard(card?.lastFourPAN)}
                                interactive={false}
                                titleStyle={styles.walletCardNumber}
                            />
                            <OfflineWithFeedback
                                pendingAction={card?.nameValuePairs?.pendingFields?.cardTitle}
                                errorRowStyles={[styles.ph5, styles.mb3]}
                                errors={ErrorUtils.getLatestErrorField(card?.nameValuePairs ?? {}, 'cardTitle')}
                                onClose={() => CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, 'cardTitle')}
                            >
                                <MenuItemWithTopDescription
                                    description={translate('workspace.moreFeatures.companyCards.cardName')}
                                    title={customCardNames?.[cardID] ?? ''}
                                    shouldShowRightIcon
                                    brickRoadIndicator={card?.nameValuePairs?.errorFields?.cardTitle ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_NAME.getRoute(policyID, cardID, bank))}
                                />
                            </OfflineWithFeedback>
                            {exportMenuItem && (
                                <OfflineWithFeedback
                                    pendingAction={card?.nameValuePairs?.pendingFields?.exportAccountDetails}
                                    errorRowStyles={[styles.ph5, styles.mb3]}
                                    errors={ErrorUtils.getLatestErrorField(card?.nameValuePairs ?? {}, 'exportAccountDetails')}
                                    onClose={() => CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, 'exportAccountDetails')}
                                >
                                    <MenuItemWithTopDescription
                                        description={exportMenuItem.description}
                                        title={exportMenuItem.title}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(policyID, cardID, bank))}
                                    />
                                </OfflineWithFeedback>
                            )}
                            <MenuItemWithTopDescription
                                shouldShowRightComponent={card?.isLoadingLastUpdated}
                                rightComponent={
                                    <ActivityIndicator
                                        style={[styles.popoverMenuIcon]}
                                        color={theme.spinner}
                                    />
                                }
                                description={translate('workspace.moreFeatures.companyCards.lastUpdated')}
                                title={card?.isLoadingLastUpdated ? translate('workspace.moreFeatures.companyCards.updating') : card?.lastScrape}
                                interactive={false}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                                title={card?.scrapeMinDate ? format(card.scrapeMinDate, CONST.DATE.FNS_FORMAT_STRING) : ''}
                                interactive={false}
                            />
                            <OfflineWithFeedback
                                pendingAction={card?.pendingFields?.lastScrape}
                                errorRowStyles={[styles.ph5, styles.mb3]}
                                errors={ErrorUtils.getLatestErrorField(card ?? {}, 'lastScrape')}
                                onClose={() => CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, 'lastScrape', true)}
                            >
                                <MenuItem
                                    icon={Expensicons.Sync}
                                    iconFill={theme.success}
                                    title={translate('workspace.moreFeatures.companyCards.updateCard')}
                                    style={styles.mv1}
                                    brickRoadIndicator={card?.errorFields?.lastScrape ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={updateCard}
                                />
                            </OfflineWithFeedback>
                            <MenuItem
                                icon={Expensicons.RemoveMembers}
                                iconFill={theme.success}
                                title={translate('workspace.moreFeatures.companyCards.unassignCard')}
                                style={styles.mv1}
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
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardDetailsPage.displayName = 'WorkspaceCompanyCardDetailsPage';

export default WorkspaceCompanyCardDetailsPage;
