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
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@libs/actions/Policy/Policy';
import * as CardUtils from '@libs/CardUtils';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {CardFeeds} from '@src/types/onyx';
import {getExportMenuItem} from './utils';

type WorkspaceCompanyCardDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_DETAILS>;

const mockedFeeds: CardFeeds = {
    companyCards: {
        cdfbmo: {
            pending: false,
            asrEnabled: true,
            forceReimbursable: 'force_no',
            liabilityType: 'corporate',
            preferredPolicy: '',
            reportTitleFormat: '{report:card}{report:bank}{report:submit:from}{report:total}{report:enddate:MMMM}',
            statementPeriodEndDay: 'LAST_DAY_OF_MONTH',
        },
    },
    companyCardNicknames: {
        cdfbmo: 'BMO MasterCard',
    },
};

function WorkspaceCompanyCardDetailsPage({route}: WorkspaceCompanyCardDetailsPageProps) {
    const {policyID, cardID, backTo} = route.params;
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const policy = usePolicy(policyID);
    const [isUnassignModalVisible, setIsUnassignModalVisible] = useState(false);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;

    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const defaultFeed = Object.keys(mockedFeeds?.companyCards ?? {})[0];
    const selectedFeed = lastSelectedFeed ?? defaultFeed;

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    // TODO: use data form onyx instead of mocked one when API is implemented
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${selectedFeed}`);
    const card = cardsList?.[cardID];
    const cardholder = personalDetails?.[card?.accountID ?? -1];
    const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(cardholder);
    // const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy);
    const exportMenuItem = getExportMenuItem(connectedIntegration, policyID, translate, policy);

    const unassignCard = () => {
        setIsUnassignModalVisible(false);
        Policy.unassignWorkspaceCompanyCard(workspaceAccountID, cardID, selectedFeed);
        Navigation.goBack();
    };

    const updateCard = () => {
        Policy.updateWorkspaceCompanyCard(workspaceAccountID, cardID, selectedFeed);
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
                                    src={CardUtils.getCardDetailsImage(selectedFeed)}
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
                            <MenuItemWithTopDescription
                                description={translate('workspace.moreFeatures.companyCards.cardName')}
                                title={card?.nameValuePairs?.cardTitle}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_NAME.getRoute(policyID, cardID))}
                            />
                            {exportMenuItem && (
                                <MenuItemWithTopDescription
                                    description={exportMenuItem.description}
                                    title={exportMenuItem.title}
                                    shouldShowRightIcon
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_EXPORT.getRoute(policyID, cardID))}
                                />
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
                                title={card?.isLoadingLastUpdated ? translate('workspace.moreFeatures.companyCards.updating') : card?.lastUpdated}
                                interactive={false}
                            />
                            <MenuItemWithTopDescription
                                description={translate('workspace.moreFeatures.companyCards.transactionStartDate')}
                                title={card?.startDate ? format(card.startDate, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING) : ''}
                                interactive={false}
                            />
                            <MenuItem
                                icon={Expensicons.Sync}
                                iconFill={theme.icon}
                                title={translate('workspace.moreFeatures.companyCards.updateCard')}
                                style={styles.mv1}
                                onPress={updateCard}
                            />
                            <MenuItem
                                icon={Expensicons.UserCheck}
                                iconFill={theme.icon}
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
