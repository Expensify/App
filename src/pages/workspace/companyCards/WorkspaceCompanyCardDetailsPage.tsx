import {format, parseISO} from 'date-fns';
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
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CompanyCardFeed} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_DETAILS>;

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
    const {isOffline} = useNetwork();
    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [allBankCards, allBankCardsMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${bank}`);
    const card = allBankCards?.[cardID];

    const cardBank = card?.bank ?? '';
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(cardholder);
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy, card);

    const unassignCard = () => {
        setIsUnassignModalVisible(false);
        if (card) {
            CompanyCards.unassignWorkspaceCompanyCard(workspaceAccountID, bank, card);
        }
        Navigation.goBack();
    };

    const updateCard = () => {
        CompanyCards.updateWorkspaceCompanyCard(workspaceAccountID, cardID, bank);
    };

    if (!card && !isLoadingOnyxValue(allBankCardsMetadata)) {
        return <NotFoundPage />;
    }

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
                                    src={CardUtils.getCardFeedIcon(cardBank as CompanyCardFeed)}
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
                                title={CardUtils.maskCardNumber(card?.cardName ?? '', bank)}
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
                                    title={customCardNames?.[cardID] ?? CardUtils.getDefaultCardName(cardholder?.firstName)}
                                    shouldShowRightIcon
                                    brickRoadIndicator={card?.nameValuePairs?.errorFields?.cardTitle ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_NAME.getRoute(policyID, cardID, bank))}
                                />
                            </OfflineWithFeedback>
                            {exportMenuItem?.shouldShowMenuItem ? (
                                <OfflineWithFeedback
                                    pendingAction={exportMenuItem?.exportType ? card?.nameValuePairs?.pendingFields?.[exportMenuItem.exportType] : undefined}
                                    errorRowStyles={[styles.ph5, styles.mb3]}
                                    errors={exportMenuItem.exportType ? ErrorUtils.getLatestErrorField(card?.nameValuePairs ?? {}, exportMenuItem.exportType) : undefined}
                                    onClose={() => {
                                        if (!exportMenuItem.exportType) {
                                            return;
                                        }
                                        CompanyCards.clearCompanyCardErrorField(workspaceAccountID, cardID, bank, exportMenuItem.exportType);
                                    }}
                                >
                                    <MenuItemWithTopDescription
                                        description={exportMenuItem.description}
                                        title={exportMenuItem.title}
                                        shouldShowRightIcon
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(policyID, cardID, bank))}
                                    />
                                </OfflineWithFeedback>
                            ) : null}
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
                                title={card?.scrapeMinDate ? format(parseISO(card.scrapeMinDate), CONST.DATE.FNS_FORMAT_STRING) : ''}
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
                                    disabled={isOffline || card?.isLoadingLastUpdated}
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
