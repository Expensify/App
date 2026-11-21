/**
 * Right-hand pane displaying a single workspace vendor's enablement toggle and read-only details.
 */
import FocusTrapExtraContainersContext from '@components/FocusTrap/FocusTrapExtraContainersContext';
import Header from '@components/Header';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import InteractiveTooltip, {useInteractiveTooltipActions} from '@components/Tooltip/InteractiveTooltip';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearVendorErrors, setPolicyVendorsEnabled} from '@libs/actions/Policy/Vendor';
import getAccountingExportRoute from '@libs/Navigation/helpers/getAccountingExportRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getActiveVendorMatchingIntegration, getDefaultVendorID, hasVendorFeature, isDefaultVendor as isDefaultVendorUtil, isVendorReadOnly} from '@libs/PolicyUtils';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useContext, useState} from 'react';
import {View} from 'react-native';

type DefaultVendorLockedSwitchProps = {
    onToggle: (enabled: boolean) => void;
};

function DefaultVendorLockedSwitch({onToggle}: DefaultVendorLockedSwitchProps) {
    const {translate} = useLocalize();
    const {openTooltip} = useInteractiveTooltipActions();

    return (
        <Switch
            isOn
            accessibilityLabel={translate('workspace.vendors.enableVendor')}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.DETAILS_ENABLE_SWITCH}
            onToggle={onToggle}
            disabled
            disabledAction={openTooltip}
            showLockIcon
            shouldAnimateOnExternalChange
        />
    );
}

type DefaultVendorTooltipBodyProps = {
    accountingExportRoute: Route;
};

function DefaultVendorTooltipBody({accountingExportRoute}: DefaultVendorTooltipBodyProps) {
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {closeTooltip} = useInteractiveTooltipActions();

    const openAccountingExportSettings = () => {
        closeTooltip();
        Navigation.navigate(accountingExportRoute);
    };

    return (
        <Text
            variant="micro"
            color={theme.textReversed}
            textAlign="center"
        >
            {translate('workspace.vendors.defaultVendorTooltipPrefix')}{' '}
            <TextLink
                variant="micro"
                style={StyleUtils.getColorStyle(theme.linkReversed)}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.DETAILS_ACCOUNTING_EXPORT_SETTINGS_LINK}
                onPress={openAccountingExportSettings}
            >
                {translate('workspace.vendors.accountingExportSettings')}
            </TextLink>
            .
        </Text>
    );
}

type WorkspaceVendorDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.VENDOR_DETAILS>;

function WorkspaceVendorDetailsPage({route}: WorkspaceVendorDetailsPageProps) {
    const {policyID, vendorID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const policyData = usePolicyData(policyID);
    const {policy, vendors: policyVendors} = policyData;
    const {canWrite: canWriteVendors, showReadOnlyModal, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.VENDORS);

    const parentFocusTrapContainers = useContext(FocusTrapExtraContainersContext);
    const [tooltipElement, setTooltipElement] = useState<HTMLElement | null>(null);
    const focusTrapExtraContainers = tooltipElement ? [...parentFocusTrapContainers, tooltipElement] : parentFocusTrapContainers;

    const isVendorMatchingBetaEnabled = isBetaEnabled(CONST.BETAS.VENDOR_MATCHING);
    const isFeatureAvailable = hasVendorFeature(policy, isVendorMatchingBetaEnabled);
    const vendor = policyVendors?.[vendorID];

    if (!vendor) {
        return <NotFoundPage />;
    }

    const defaultVendorID = getDefaultVendorID(policy, vendor.origin);
    const isDefaultVendor = isDefaultVendorUtil(vendorID, vendor.externalID, defaultVendorID);
    const isDefaultVendorLocked = vendor.enabled && isDefaultVendor;
    const isReadOnlyVendor = isVendorReadOnly(vendor);
    const accountingExportRoute = getAccountingExportRoute(policyID, vendor.origin ?? getActiveVendorMatchingIntegration(policy));

    const toggleVendorEnabled = (enabled: boolean) => {
        if (!canWriteVendors) {
            showReadOnlyModal();
            return;
        }

        if (!enabled && isDefaultVendor) {
            return;
        }

        setPolicyVendorsEnabled({
            policyID,
            vendorIDs: [vendorID],
            enabled,
            policyVendors,
            policyData,
            isVendorMatchingBetaEnabled,
        });
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            policyFeature={CONST.POLICY.POLICY_FEATURE.VENDORS}
            shouldBeBlocked={!isFeatureAvailable}
        >
            <FocusTrapExtraContainersContext.Provider value={focusTrapExtraContainers}>
                <ScreenWrapper
                    enableEdgeToEdgeBottomSafeAreaPadding
                    style={[styles.defaultModalContainer]}
                    testID="WorkspaceVendorDetailsPage"
                >
                    <Header>
                        <Header.BackButton onPress={() => Navigation.goBack()} />
                        <Header.Title title={vendor.name} />
                    </Header>
                    <ScrollView
                        contentContainerStyle={[styles.flexGrow1]}
                        addBottomSafeAreaPadding
                    >
                        <OfflineWithFeedback
                            errors={vendor.errors ?? undefined}
                            pendingAction={vendor.pendingFields?.enabled}
                            errorRowStyles={styles.mh5}
                            onClose={() => clearVendorErrors(policyID, vendorID)}
                        >
                            <View style={[styles.mt2, styles.mh5]}>
                                <View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                    <Text
                                        style={[styles.flexShrink1, styles.mr2]}
                                        accessible={false}
                                        aria-hidden
                                    >
                                        {translate('workspace.vendors.enableVendor')}
                                    </Text>
                                    {isDefaultVendorLocked && canWriteVendors ? (
                                        <InteractiveTooltip.Root
                                            anchorAlignment={{
                                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                            }}
                                            onTooltipElementChange={setTooltipElement}
                                        >
                                            <InteractiveTooltip.Trigger>
                                                <DefaultVendorLockedSwitch onToggle={toggleVendorEnabled} />
                                            </InteractiveTooltip.Trigger>
                                            <InteractiveTooltip.Content>
                                                <DefaultVendorTooltipBody accountingExportRoute={accountingExportRoute} />
                                            </InteractiveTooltip.Content>
                                        </InteractiveTooltip.Root>
                                    ) : (
                                        <Switch
                                            isOn={vendor.enabled}
                                            accessibilityLabel={translate('workspace.vendors.enableVendor')}
                                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.VENDORS.DETAILS_ENABLE_SWITCH}
                                            onToggle={toggleVendorEnabled}
                                            disabled={!canWriteVendors}
                                            disabledAction={withReadOnlyFallback()}
                                            showLockIcon={!canWriteVendors}
                                            shouldAnimateOnExternalChange
                                        />
                                    )}
                                </View>
                            </View>
                        </OfflineWithFeedback>
                        <MenuItemField
                            name={translate('common.name')}
                            value={vendor.name}
                            isValueSelectable={isReadOnlyVendor}
                        />
                        <MenuItemField
                            name={translate('workspace.vendors.externalID')}
                            value={vendor.externalID}
                            isValueSelectable={isReadOnlyVendor}
                        />
                    </ScrollView>
                </ScreenWrapper>
            </FocusTrapExtraContainersContext.Provider>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceVendorDetailsPage;
