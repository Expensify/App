import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import {isControlPolicy} from '@libs/PolicyUtils';
import * as Category from '@userActions/Policy/Category';
import * as DistanceRate from '@userActions/Policy/DistanceRate';
import * as Policy from '@userActions/Policy/Policy';
import * as Tag from '@userActions/Policy/Tag';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import AccessOrNotFoundWrapper from './AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import ToggleSettingOptionRow from './workflows/ToggleSettingsOptionRow';

type WorkspaceMoreFeaturesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.MORE_FEATURES>;

type Item = {
    icon: IconAsset;
    titleTranslationKey: TranslationPaths;
    subtitleTranslationKey: TranslationPaths;
    isActive: boolean;
    disabled?: boolean;
    action: (isEnabled: boolean) => void;
    disabledAction?: () => void;
    pendingAction: PendingAction | undefined;
    errors?: Errors;
    onCloseError?: () => void;
};

type SectionObject = {
    titleTranslationKey: TranslationPaths;
    subtitleTranslationKey: TranslationPaths;
    items: Item[];
};

// TODO: remove when Onyx data is available
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockedCardsList = {
    test1: {
        cardholder: {accountID: 1, lastName: 'Smith', firstName: 'Bob', displayName: 'Bob Smith', avatar: ''},
        name: 'Test 1',
        limit: 1000,
        lastFourPAN: '1234',
    },
    test2: {
        cardholder: {accountID: 2, lastName: 'Miller', firstName: 'Alex', displayName: 'Alex Miller', avatar: ''},
        name: 'Test 2',
        limit: 2000,
        lastFourPAN: '1234',
    },
    test3: {
        cardholder: {accountID: 3, lastName: 'Brown', firstName: 'Kevin', displayName: 'Kevin Brown', avatar: ''},
        name: 'Test 3',
        limit: 3000,
        lastFourPAN: '1234',
    },
};

function WorkspaceMoreFeaturesPage({policy, route}: WorkspaceMoreFeaturesPageProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {canUseReportFieldsFeature, canUseWorkspaceFeeds} = usePermissions();
    const hasAccountingConnection = !!policy?.areConnectionsEnabled && !isEmptyObject(policy?.connections);
    const isSyncTaxEnabled =
        !!policy?.connections?.quickbooksOnline?.config?.syncTax ||
        !!policy?.connections?.xero?.config?.importTaxRates ||
        !!policy?.connections?.netsuite?.options?.config?.syncOptions?.syncTax;
    const policyID = policy?.id ?? '';
    // @ts-expect-error a new props will be added during feed api implementation
    const workspaceAccountID = (policy?.workspaceAccountID as string) ?? '';
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);
    // Uncomment this line for testing disabled toggle feature - for c+
    // const [cardsList = mockedCardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const [isOrganizeWarningModalOpen, setIsOrganizeWarningModalOpen] = useState(false);
    const [isIntegrateWarningModalOpen, setIsIntegrateWarningModalOpen] = useState(false);
    const [isReportFieldsWarningModalOpen, setIsReportFieldsWarningModalOpen] = useState(false);
    const [isDisableExpensifyCardWarningModalOpen, setIsDisableExpensifyCardWarningModalOpen] = useState(false);

    const spendItems: Item[] = [
        {
            icon: Illustrations.Car,
            titleTranslationKey: 'workspace.moreFeatures.distanceRates.title',
            subtitleTranslationKey: 'workspace.moreFeatures.distanceRates.subtitle',
            isActive: policy?.areDistanceRatesEnabled ?? false,
            pendingAction: policy?.pendingFields?.areDistanceRatesEnabled,
            action: (isEnabled: boolean) => {
                DistanceRate.enablePolicyDistanceRates(policy?.id ?? '-1', isEnabled);
            },
        },
        {
            icon: Illustrations.Workflows,
            titleTranslationKey: 'workspace.moreFeatures.workflows.title',
            subtitleTranslationKey: 'workspace.moreFeatures.workflows.subtitle',
            isActive: policy?.areWorkflowsEnabled ?? false,
            pendingAction: policy?.pendingFields?.areWorkflowsEnabled,
            action: (isEnabled: boolean) => {
                Policy.enablePolicyWorkflows(policy?.id ?? '-1', isEnabled);
            },
        },
    ];

    // TODO remove this when feature will be fully done, and move spend item inside spendItems array
    if (canUseWorkspaceFeeds) {
        spendItems.splice(1, 0, {
            icon: Illustrations.HandCard,
            titleTranslationKey: 'workspace.moreFeatures.expensifyCard.title',
            subtitleTranslationKey: 'workspace.moreFeatures.expensifyCard.subtitle',
            isActive: policy?.areExpensifyCardsEnabled ?? false,
            pendingAction: policy?.pendingFields?.areExpensifyCardsEnabled,
            disabled: !isEmptyObject(cardsList),
            action: (isEnabled: boolean) => {
                Policy.enableExpensifyCard(policy?.id ?? '-1', isEnabled);
            },
            disabledAction: () => {
                setIsDisableExpensifyCardWarningModalOpen(true);
            },
        });
    }

    const organizeItems: Item[] = [
        {
            icon: Illustrations.FolderOpen,
            titleTranslationKey: 'workspace.moreFeatures.categories.title',
            subtitleTranslationKey: 'workspace.moreFeatures.categories.subtitle',
            isActive: policy?.areCategoriesEnabled ?? false,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.areCategoriesEnabled,
            action: (isEnabled: boolean) => {
                if (hasAccountingConnection) {
                    setIsOrganizeWarningModalOpen(true);
                    return;
                }
                Category.enablePolicyCategories(policy?.id ?? '-1', isEnabled);
            },
        },
        {
            icon: Illustrations.Tag,
            titleTranslationKey: 'workspace.moreFeatures.tags.title',
            subtitleTranslationKey: 'workspace.moreFeatures.tags.subtitle',
            isActive: policy?.areTagsEnabled ?? false,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.areTagsEnabled,
            action: (isEnabled: boolean) => {
                if (hasAccountingConnection) {
                    setIsOrganizeWarningModalOpen(true);
                    return;
                }
                Tag.enablePolicyTags(policy?.id ?? '-1', isEnabled);
            },
        },
        {
            icon: Illustrations.Coins,
            titleTranslationKey: 'workspace.moreFeatures.taxes.title',
            subtitleTranslationKey: 'workspace.moreFeatures.taxes.subtitle',
            isActive: (policy?.tax?.trackingEnabled ?? false) || isSyncTaxEnabled,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.tax,
            action: (isEnabled: boolean) => {
                if (hasAccountingConnection) {
                    setIsOrganizeWarningModalOpen(true);
                    return;
                }
                Policy.enablePolicyTaxes(policy?.id ?? '-1', isEnabled);
            },
        },
    ];

    if (canUseReportFieldsFeature) {
        organizeItems.push({
            icon: Illustrations.Pencil,
            titleTranslationKey: 'workspace.moreFeatures.reportFields.title',
            subtitleTranslationKey: 'workspace.moreFeatures.reportFields.subtitle',
            isActive: policy?.areReportFieldsEnabled ?? false,
            disabled: hasAccountingConnection,
            pendingAction: policy?.pendingFields?.areReportFieldsEnabled,
            action: (isEnabled: boolean) => {
                if (hasAccountingConnection) {
                    setIsOrganizeWarningModalOpen(true);
                    return;
                }
                if (isEnabled) {
                    if (!isControlPolicy(policy)) {
                        Navigation.navigate(
                            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)),
                        );
                        return;
                    }

                    Policy.enablePolicyReportFields(policyID, true);
                    return;
                }
                setIsReportFieldsWarningModalOpen(true);
            },
        });
    }

    const integrateItems: Item[] = [
        {
            icon: Illustrations.Accounting,
            titleTranslationKey: 'workspace.moreFeatures.connections.title',
            subtitleTranslationKey: 'workspace.moreFeatures.connections.subtitle',
            isActive: !!policy?.areConnectionsEnabled,
            pendingAction: policy?.pendingFields?.areConnectionsEnabled,
            action: (isEnabled: boolean) => {
                if (hasAccountingConnection) {
                    setIsIntegrateWarningModalOpen(true);
                    return;
                }
                Policy.enablePolicyConnections(policy?.id ?? '-1', isEnabled);
            },
            disabled: hasAccountingConnection,
            errors: ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED),
            onCloseError: () => Policy.clearPolicyErrorField(policy?.id ?? '-1', CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED),
        },
    ];

    const sections: SectionObject[] = [
        {
            titleTranslationKey: 'workspace.moreFeatures.spendSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.spendSection.subtitle',
            items: spendItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.organizeSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.organizeSection.subtitle',
            items: organizeItems,
        },
        {
            titleTranslationKey: 'workspace.moreFeatures.integrateSection.title',
            subtitleTranslationKey: 'workspace.moreFeatures.integrateSection.subtitle',
            items: integrateItems,
        },
    ];

    const renderItem = useCallback(
        (item: Item) => (
            <View
                key={item.titleTranslationKey}
                style={styles.mt7}
            >
                <ToggleSettingOptionRow
                    icon={item.icon}
                    disabled={item.disabled}
                    disabledAction={item.disabledAction}
                    title={translate(item.titleTranslationKey)}
                    titleStyle={styles.textStrong}
                    subtitle={translate(item.subtitleTranslationKey)}
                    switchAccessibilityLabel={translate(item.subtitleTranslationKey)}
                    isActive={item.isActive}
                    pendingAction={item.pendingAction}
                    onToggle={item.action}
                    showLockIcon={item.disabled}
                    errors={item.errors}
                    onCloseError={item.onCloseError}
                />
            </View>
        ),
        [styles, translate],
    );

    const renderSection = useCallback(
        (section: SectionObject) => (
            <View
                key={section.titleTranslationKey}
                style={[styles.mt3, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}
            >
                <Section
                    containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                    title={translate(section.titleTranslationKey)}
                    titleStyles={styles.textStrong}
                    subtitle={translate(section.subtitleTranslationKey)}
                    subtitleMuted
                >
                    {section.items.map(renderItem)}
                </Section>
            </View>
        ),
        [isSmallScreenWidth, styles, renderItem, translate],
    );

    const fetchFeatures = useCallback(() => {
        Policy.openPolicyMoreFeaturesPage(route.params.policyID);
    }, [route.params.policyID]);

    useNetwork({onReconnect: fetchFeatures});

    useFocusEffect(
        useCallback(() => {
            fetchFeatures();
        }, [fetchFeatures]),
    );

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={route.params.policyID}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceMoreFeaturesPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    icon={Illustrations.Gears}
                    title={translate('workspace.common.moreFeatures')}
                    shouldShowBackButton={isSmallScreenWidth}
                />

                <ScrollView contentContainerStyle={styles.pb2}>{sections.map(renderSection)}</ScrollView>

                <ConfirmModal
                    title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                    onConfirm={() => {
                        setIsOrganizeWarningModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                    }}
                    onCancel={() => setIsOrganizeWarningModalOpen(false)}
                    isVisible={isOrganizeWarningModalOpen}
                    prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')}
                    confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                    onConfirm={() => {
                        setIsIntegrateWarningModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                    }}
                    onCancel={() => setIsIntegrateWarningModalOpen(false)}
                    isVisible={isIntegrateWarningModalOpen}
                    prompt={translate('workspace.moreFeatures.connectionsWarningModal.disconnectText')}
                    confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                    cancelText={translate('common.cancel')}
                />
                <ConfirmModal
                    title={translate('workspace.reportFields.disableReportFields')}
                    isVisible={isReportFieldsWarningModalOpen}
                    onConfirm={() => {
                        setIsReportFieldsWarningModalOpen(false);
                        Policy.enablePolicyReportFields(policyID, false);
                    }}
                    onCancel={() => setIsReportFieldsWarningModalOpen(false)}
                    prompt={translate('workspace.reportFields.disableReportFieldsConfirmation')}
                    confirmText={translate('common.disable')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.expensifyCard.disableCardTitle')}
                    isVisible={isDisableExpensifyCardWarningModalOpen}
                    onConfirm={() => {
                        setIsDisableExpensifyCardWarningModalOpen(false);
                        Report.navigateToConciergeChat(true);
                    }}
                    onCancel={() => setIsDisableExpensifyCardWarningModalOpen(false)}
                    prompt={translate('workspace.moreFeatures.expensifyCard.disableCardPrompt')}
                    confirmText={translate('workspace.moreFeatures.expensifyCard.disableCardButton')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceMoreFeaturesPage.displayName = 'WorkspaceMoreFeaturesPage';

export default withPolicyAndFullscreenLoading(WorkspaceMoreFeaturesPage);
