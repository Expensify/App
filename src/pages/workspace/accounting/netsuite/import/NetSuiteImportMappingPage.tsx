import React, { useMemo } from 'react';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import SelectionScreen from '@components/SelectionScreen';
import CONST from '@src/CONST';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import { View } from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type { TranslationPaths } from '@src/languages/types';

type NetSuiteImportMappingPageProps = WithPolicyConnectionsProps & {
  route: {
    params: {
      importField: string
    }
  }
};

function NetSuiteImportMappingPage({policy, route: {
  params: {
    importField
  }
}}: NetSuiteImportMappingPageProps) {
  
  const policyID = policy?.id ?? '-1';
  const styles = useThemeStyles();
  const {translate}  = useLocalize();

  const listHeaderComponent = useMemo(
    () => (
        <View style={[styles.ph5, styles.mt2, styles.mb4]}>
            <Text style={[styles.ph5, styles.pb5]}>'Description hre'</Text>
        </View>
    ),
    [styles.ph5, styles.mt2, styles.pb5, styles.mb4, translate, policyID],
);

const titleKey = `workspace.netsuite.import.importFields.${importField}` as TranslationPaths;

  return (
    <SelectionScreen
        policyID={policyID}
        accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        displayName={NetSuiteImportMappingPage.displayName}
        sections={[{data: []}]}
        // sections={subsidiaryListSections.length > 0 ? [{data: subsidiaryListSections}] : []}
        listItem={RadioListItem}
        connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        onSelectRow={() => {}}
        // initiallyFocusedOptionKey={netsuiteConfig?.subsidiaryID ?? subsidiaryListSections?.[0]?.keyForList}
        headerContent={listHeaderComponent}
        onBackButtonPress={() => Navigation.goBack()}
        title={titleKey}
    />
);
}

NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';

export default withPolicyConnections(NetSuiteImportMappingPage);