import React from 'react';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import type {StackScreenProps} from '@react-navigation/stack';
import type SCREENS from '@src/SCREENS';
import type { SettingsNavigatorParamList } from '@libs/Navigation/types';

type NetSuiteImportMappingPageProps = WithPolicyConnectionsProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.NETSUITE_IMPORT_MAPPING>;

function NetSuiteImportMappingPage({policy, route: {
  params: {
    importField
  }
}}: NetSuiteImportMappingPageProps) {
  const policyID = policy?.id ?? '-1';
  return <>Import Mapping Page {policyID} {importField}</>
}

NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';

export default withPolicyConnections(NetSuiteImportMappingPage);