import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SageIntacctToggleMappingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

function SageIntacctToggleMappingsPage({route}: SageIntacctToggleMappingsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? '-1'}`);
    console.log('%%%%%\n', 'route.params', route.params);
    const policyID = policy?.id ?? '-1';

    return (
        <ConnectionLayout
            displayName={SageIntacctToggleMappingsPage.displayName}
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Expense types"
                subtitle="Sage Intacct expense types import into Expensify as categories."
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
        </ConnectionLayout>
    );
}

SageIntacctToggleMappingsPage.displayName = 'PolicySageIntacctImportPage';

export default SageIntacctToggleMappingsPage;
