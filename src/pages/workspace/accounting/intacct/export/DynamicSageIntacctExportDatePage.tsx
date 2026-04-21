import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import Text from '@components/Text';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {updateSageIntacctExportDate} from '@userActions/connections/SageIntacct';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type MenuListItem = ListItem & {
    value: ValueOf<typeof CONST.SAGE_INTACCT_EXPORT_DATE>;
};

function DynamicSageIntacctExportDatePage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfig, pendingFields} = policy?.connections?.intacct?.config ?? {};
    const data: MenuListItem[] = Object.values(CONST.SAGE_INTACCT_EXPORT_DATE).map((dateType) => ({
        value: dateType,
        text: translate(`workspace.sageIntacct.exportDate.values.${dateType}.label`),
        alternateText: translate(`workspace.sageIntacct.exportDate.values.${dateType}.description`),
        keyForList: dateType,
        isSelected: exportConfig?.exportDate === dateType,
    }));
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE.path);

    const goBack = useCallback(() => {
        Navigation.goBack(backPath);
    }, [backPath]);

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.sageIntacct.exportDate.description')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    const selectExportDate = useCallback(
        (row: MenuListItem) => {
            if (row.value !== exportConfig?.exportDate && policyID) {
                updateSageIntacctExportDate(policyID, row.value, exportConfig?.exportDate);
            }
            goBack();
        },
        [exportConfig?.exportDate, policyID, goBack],
    );

    return (
        <SelectionScreen
            displayName="DynamicSageIntacctExportDatePage"
            title="workspace.sageIntacct.exportDate.label"
            headerContent={headerContent}
            data={data}
            listItem={RadioListItem}
            onSelectRow={(selection: SelectorType) => selectExportDate(selection as MenuListItem)}
            initiallyFocusedOptionKey={data.find((mode) => mode.isSelected)?.keyForList}
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            onBackButtonPress={goBack}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE], pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE)}
        />
    );
}

export default withPolicyConnections(DynamicSageIntacctExportDatePage);
