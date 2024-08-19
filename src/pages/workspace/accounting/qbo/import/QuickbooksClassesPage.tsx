import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function QuickbooksClassesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {syncClasses, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = !!(syncClasses && syncClasses !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isReportFieldsSelected = syncClasses === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={QuickbooksClassesPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.qbo.classes')} />
                <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                    <Text style={styles.pb5}>{translate('workspace.qbo.classesDescription')}</Text>
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={styles.flex1}>
                            <Text fontSize={variables.fontSizeNormal}>{translate('workspace.accounting.import')}</Text>
                        </View>
                        <OfflineWithFeedback pendingAction={pendingFields?.syncClasses}>
                            <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                <Switch
                                    accessibilityLabel={translate('workspace.qbo.classes')}
                                    isOn={isSwitchOn}
                                    onToggle={() =>
                                        QuickbooksOnline.updateQuickbooksOnlineSyncClasses(
                                            policyID,
                                            isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                                        )
                                    }
                                />
                            </View>
                        </OfflineWithFeedback>
                    </View>
                    {isSwitchOn && (
                        <OfflineWithFeedback>
                            <MenuItemWithTopDescription
                                interactive={false}
                                title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                                description={translate('workspace.common.displayedAs')}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                            />
                        </OfflineWithFeedback>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksClassesPage.displayName = 'QuickbooksClassesPage';

export default withPolicyConnections(QuickbooksClassesPage);
