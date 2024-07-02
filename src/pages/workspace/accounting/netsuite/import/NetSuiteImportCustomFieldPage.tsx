import {ExpensiMark} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import RenderHTML from '@components/RenderHTML';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import SelectionScreen from '@components/SelectionScreen';
import CONST from '@src/CONST';
import MenuItem from '@components/MenuItem';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

const parser = new ExpensiMark();

type ImportCustomFieldsKeys = TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>;

type NetSuiteImportCustomFieldPageProps = WithPolicyConnectionsProps & {
  route: {
      params: {
          importCustomField: ImportCustomFieldsKeys;
      };
  };
};


function NetSuiteImportCustomFieldPage({policy,
  route: {
      params: {importCustomField},
  },
}: NetSuiteImportCustomFieldPageProps) {
  const policyID  = policy?.id ?? '-1';
  const styles = useThemeStyles();
  const {translate} = useLocalize();

  const customListData = [];

  const listHeaderComponent = useMemo(
    () => (
        <View style={[styles.ph5, styles.mt2, styles.mb4]}>
              <RenderHTML
                  html={`<comment><muted-text>${parser.replace(`Test Description ${importCustomField}`)}</muted-text></comment>`}
              />
        </View>
    ),
    [styles.ph5, styles.mt2, styles.mb4, importCustomField],
);

  return <SelectionScreen
  policyID={policyID}
  accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
  featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
  displayName={NetSuiteImportCustomFieldPage.displayName}
  sections={customListData.length > 0 ? [{data: customListData}] : []}
  listItem={MenuItem}
  onSelectRow={() => {}}
  connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
  headerContent={listHeaderComponent}
  onBackButtonPress={() => Navigation.goBack()}
  title='common.tax'
/>
}

NetSuiteImportCustomFieldPage.displayName = 'NetSuiteImportCustomFieldPage';
export default withPolicyConnections(NetSuiteImportCustomFieldPage);
