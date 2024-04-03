import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasAccessToAccountingFeatures} from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function QuickbooksClassesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncClasses, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = Boolean(syncClasses && syncClasses !== 'NONE');
    const isReportFieldsSelected = syncClasses === 'REPORT_FIELD';
    const {canUseAccountingIntegrations} = usePermissions();
    const hasAccess = hasAccessToAccountingFeatures(policy, canUseAccountingIntegrations);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksClassesPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.resetToHome}
                shouldShow={!hasAccess}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldForceFullScreen
            >
                <HeaderWithBackButton title={translate('workspace.qbo.classes')} />
                <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                    <Text style={styles.pb5}>{translate('workspace.qbo.classesDescription')}</Text>
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={styles.flex1}>
                            <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.import')}</Text>
                        </View>
                        <OfflineWithFeedback pendingAction={pendingFields?.syncClasses}>
                            <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                <Switch
                                    accessibilityLabel={translate('workspace.qbo.classes')}
                                    isOn={isSwitchOn}
                                    onToggle={() => Policy.updatePolicyConnectionConfig(policyID, 'quickbooksOnline', 'syncClasses', isSwitchOn ? 'NONE' : 'TAG')}
                                />
                            </View>
                        </OfflineWithFeedback>
                    </View>
                    {isSwitchOn && (
                        <OfflineWithFeedback>
                            <MenuItemWithTopDescription
                                interactive={false}
                                title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                                description={translate('workspace.qbo.displayedAs')}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                            />
                        </OfflineWithFeedback>
                    )}
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

QuickbooksClassesPage.displayName = 'QuickbooksClassesPage';

export default withPolicy(QuickbooksClassesPage);
