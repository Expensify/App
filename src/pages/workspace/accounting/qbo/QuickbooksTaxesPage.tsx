import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function QuickbooksTaxesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncTaxes, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = Boolean(syncTaxes && syncTaxes !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    shouldEnableMaxHeight
                    testID={QuickbooksTaxesPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.qbo.taxes')} />
                    <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                        <Text style={styles.pb5}>{translate('workspace.qbo.taxesDescription')}</Text>
                        <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <View style={styles.flex1}>
                                <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.import')}</Text>
                            </View>
                            <OfflineWithFeedback pendingAction={pendingFields?.syncTaxes}>
                                <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                    <Switch
                                        accessibilityLabel={translate('workspace.qbo.taxes')}
                                        isOn={isSwitchOn}
                                        onToggle={() =>
                                            Connections.updatePolicyConnectionConfig(
                                                policyID,
                                                CONST.POLICY.CONNECTIONS.NAME.QBO,
                                                CONST.QUICKBOOKS_IMPORTS.SYNC_TAXES,
                                                isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                                            )
                                        }
                                    />
                                </View>
                            </OfflineWithFeedback>
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksTaxesPage.displayName = 'QuickbooksTaxesPage';

export default withPolicy(QuickbooksTaxesPage);
