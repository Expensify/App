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
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy';

function QuickbooksTaxesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncTaxes, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = Boolean(syncTaxes && syncTaxes !== 'NONE');
    return (
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
                                onToggle={() => Policy.updatePolicyConnectionConfig(policyID, 'quickbooksOnline', 'syncTaxes', isSwitchOn ? 'NONE' : 'TAG')}
                            />
                        </View>
                    </OfflineWithFeedback>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksTaxesPage.displayName = 'QuickbooksTaxesPage';

export default withPolicy(QuickbooksTaxesPage);
