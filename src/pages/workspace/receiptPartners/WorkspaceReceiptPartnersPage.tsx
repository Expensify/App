import React, {useCallback, useEffect, useMemo} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThreeDotsAnchorPosition from '@hooks/useThreeDotsAnchorPosition';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {MenuItemData} from '@pages/workspace/accounting/types';
import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import {getReceiptPartnersIntegrationData} from './utils';

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const threeDotsAnchorPosition = useThreeDotsAnchorPosition(styles.threeDotsPopoverOffsetNoCloseButton);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const receiptPartnerNames = CONST.POLICY.RECEIPT_PARTNERS.NAME;
    const receiptPartnerIntegrations = Object.values(receiptPartnerNames);
    const {isOffline} = useNetwork();
    const policy = usePolicy(policyID);
    const theme = useTheme();
    const isLoading = policy?.isLoading;
    const integrations = policy?.receiptPartners;

    const startIntegrationFlow = useCallback(
        ({name}: {name: string}) => {
            switch (name) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER: {
                    const {connectFormData} = integrations?.uber ?? {};
                    const hash = connectFormData?.hash;
                    const query = connectFormData?.query;
                    const userName = connectFormData?.name;
                    const id = connectFormData?.id;
                    openExternalLink(`${CONST.UBER_CONNECT_URL}?query=${query}&hash=${hash}&name=${userName}&id=${id}`);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [integrations],
    );

    const fetchReceiptPartners = useCallback(() => {
        openPolicyReceiptPartnersPage(policyID);
    }, [policyID]);

    useEffect(() => {
        fetchReceiptPartners();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (policyID) {
            return receiptPartnerIntegrations
                .map((integration) => {
                    const integrationData = getReceiptPartnersIntegrationData(integration, translate);
                    if (!integrationData) {
                        return undefined;
                    }

                    const iconProps = integrationData?.icon
                        ? {
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                          }
                        : {};

                    return {
                        ...iconProps,
                        interactive: false,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: true,
                        title: integrationData?.title,
                        description: integrationData?.description,
                        rightComponent: (
                            <Button
                                onPress={() => startIntegrationFlow({name: integration})}
                                text={translate('workspace.accounting.setup')}
                                style={styles.justifyContentCenter}
                                small
                                isDisabled={isOffline}
                            />
                        ),
                    };
                })
                .filter(Boolean) as MenuItemData[];
        }

        return [];
    }, [isOffline, policyID, receiptPartnerIntegrations, startIntegrationFlow, styles.justifyContentCenter, styles.sectionMenuItemTopDescription, translate]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
            {isLoading ? (
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            ) : (
                <ScreenWrapper
                    testID={WorkspaceReceiptPartnersPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        title={translate('workspace.common.accounting')}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        icon={Illustrations.ReceiptPartners}
                        shouldUseHeadlineHeader
                        threeDotsAnchorPosition={threeDotsAnchorPosition}
                        onBackButtonPress={Navigation.popToSidebar}
                    />
                    <ScrollView
                        contentContainerStyle={styles.pt3}
                        addBottomSafeAreaPadding
                    >
                        <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                            <Section
                                title={translate('workspace.accounting.title')}
                                isCentralPane
                                subtitleMuted
                                titleStyles={styles.accountSettingsSectionTitle}
                                childrenStyles={styles.pt5}
                            >
                                {connectionsMenuItems.map((menuItem) => (
                                    <OfflineWithFeedback
                                        pendingAction={menuItem.pendingAction}
                                        key={menuItem.title}
                                        shouldDisableStrikeThrough
                                    >
                                        <MenuItem
                                            brickRoadIndicator={menuItem.brickRoadIndicator}
                                            key={menuItem.title}
                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                            {...menuItem}
                                        />
                                    </OfflineWithFeedback>
                                ))}
                            </Section>
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceReceiptPartnersPage.displayName = 'WorkspaceReceiptPartnersPage';

export default WorkspaceReceiptPartnersPage;
