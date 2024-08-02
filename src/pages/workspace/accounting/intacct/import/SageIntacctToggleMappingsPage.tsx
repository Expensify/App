import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctMappingValue} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SageIntacctMappingName, SageIntacctMappingValue} from '@src/types/onyx/Policy';

type SageIntacctToggleMappingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

type DisplayTypeTranslationKeys = {
    titleKey: TranslationPaths;
    descriptionKey: TranslationPaths;
};

function getDisplayTypeTranslationKeys(displayType?: SageIntacctMappingValue): DisplayTypeTranslationKeys | undefined {
    switch (displayType) {
        case CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT: {
            return {titleKey: 'workspace.intacct.employeeDefault', descriptionKey: 'workspace.intacct.employeeDefaultDescription'};
        }
        case CONST.SAGE_INTACCT_MAPPING_VALUE.TAG: {
            return {titleKey: 'workspace.common.tags', descriptionKey: 'workspace.intacct.displayedAsTagDescription'};
        }
        case CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD: {
            return {titleKey: 'workspace.common.reportFields', descriptionKey: 'workspace.intacct.displayedAsReportFieldDescription'};
        }
        default: {
            return undefined;
        }
    }
}

function SageIntacctToggleMappingsPage({route}: SageIntacctToggleMappingsPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID ?? '-1'}`);
    const mappingName: SageIntacctMappingName = route.params.mapping;
    const policyID: string = policy?.id ?? '-1';

    const config = policy?.connections?.intacct?.config;
    const translationKeys = getDisplayTypeTranslationKeys(config?.mappings?.[mappingName]);
    const [importMapping, setImportMapping] = useState(config?.mappings?.[mappingName] && config?.mappings?.[mappingName] !== CONST.SAGE_INTACCT_MAPPING_VALUE.NONE);

    return (
        <ConnectionLayout
            displayName={SageIntacctToggleMappingsPage.displayName}
            headerTitleAlreadyTranslated={Str.recapitalize(translate('workspace.intacct.mappingTitle', mappingName))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID))}
        >
            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mb5, styles.ph5]}>
                <Text style={[styles.textNormal]}>{translate('workspace.intacct.toggleImportTitleFirstPart')}</Text>
                <Text style={[styles.textStrong]}>{translate('workspace.intacct.mappingTitle', mappingName)}</Text>
                <Text style={[styles.textNormal]}>{translate('workspace.intacct.toggleImportTitleSecondPart')}</Text>
            </Text>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={`${translate('workspace.accounting.import')} ${translate('workspace.intacct.mappingTitle', mappingName)}`}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={importMapping ?? false}
                onToggle={() => {
                    if (importMapping) {
                        setImportMapping(false);
                        updateSageIntacctMappingValue(policyID, mappingName, CONST.SAGE_INTACCT_MAPPING_VALUE.NONE);
                    } else {
                        setImportMapping(true);
                        updateSageIntacctMappingValue(policyID, mappingName, CONST.SAGE_INTACCT_MAPPING_VALUE.TAG);
                    }
                }}
                pendingAction={settingsPendingAction([mappingName], config?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(config ?? {}, mappingName)}
                onCloseError={() => clearSageIntacctErrorField(policyID, mappingName)}
            />
            {importMapping && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([mappingName], config?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translationKeys?.titleKey ? translate(translationKeys?.titleKey) : undefined}
                        description={translate('workspace.common.displayedAs')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE.getRoute(policyID, mappingName))}
                        brickRoadIndicator={areSettingsInErrorFields([mappingName], config?.errorFields) ? 'error' : undefined}
                    />
                    <Text
                        style={[styles.textLabelSupporting, styles.ph5]}
                        numberOfLines={2}
                    >
                        {translationKeys?.descriptionKey ? translate(translationKeys?.descriptionKey) : undefined}
                    </Text>
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

SageIntacctToggleMappingsPage.displayName = 'SageIntacctToggleMappingsPage';

export default SageIntacctToggleMappingsPage;
