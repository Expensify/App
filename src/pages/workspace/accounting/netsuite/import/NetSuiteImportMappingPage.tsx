import React from 'react';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';


function NetSuiteImportMappingPage({policy, importField}: WithPolicyConnectionsProps & { importField: string}) {
  const policyID = policy?.id ?? '-1';
  return <>Import Mapping Page {policyID} {importField}</>
}

NetSuiteImportMappingPage.displayName = 'NetSuiteImportMappingPage';

export default withPolicyConnections(NetSuiteImportMappingPage);