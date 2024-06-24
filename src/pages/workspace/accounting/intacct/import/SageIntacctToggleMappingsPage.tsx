import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SageIntacctConnection from '@libs/actions/connections/SageIntacct';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SageIntacctMappingValue} from '@src/types/onyx/Policy';

type SageIntacctToggleMappingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

type DisplayTypeTranslationKeys = {
    titleKey: TranslationPaths;
    descriptionKey: TranslationPaths;
};

function getDisplayTypeTranslationKeys(displayType?: SageIntacctMappingValue): DisplayTypeTranslationKeys | undefined {
    switch (displayType) {
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.DEFAULT: {
            return {titleKey: 'workspace.intacct.employeeDefault', descriptionKey: 'workspace.intacct.employeeDefaultDescription'};
        }
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG: {
            return {titleKey: 'workspace.common.tags', descriptionKey: 'workspace.intacct.displayedAsTagDescription'};
        }
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD: {
            return {titleKey: 'workspace.common.reportFields', descriptionKey: 'workspace.intacct.displayedAsReportFieldDescription'};
        }
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.NONE: {
            return undefined;
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
    const mapping = route.params.mapping;
    const policyID = policy?.id ?? '-1';

    const mappings = policy?.connections?.intacct?.config?.mappings;
    const translationKeys = getDisplayTypeTranslationKeys(mappings?.[mapping]);
    const [importDepartments, setImportDepartments] = useState(mappings?.[mapping] && mappings?.[mapping] !== CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.NONE);
    const updateFunction = SageIntacctConnection.getUpdateFunctionForMapping(mapping);

    return (
        <ConnectionLayout
            displayName={SageIntacctToggleMappingsPage.displayName}
            headerTitleAlreadyTranslated={translate('workspace.common.mappingTitle', mapping, true)}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mb5, styles.ph5]}>
                <Text style={[styles.textNormal]}>{translate('workspace.intacct.toggleImportTitleFirstPart')}</Text>
                <Text style={[styles.textStrong]}>{translate('workspace.common.mappingTitle', mapping)}</Text>
                <Text style={[styles.textNormal]}>{translate('workspace.intacct.toggleImportTitleSecondPart')}</Text>
            </Text>
            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={`${translate('workspace.accounting.import')} ${translate('workspace.common.mappingTitle', mapping)}`} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={importDepartments ?? false}
                onToggle={() => {
                    if (!updateFunction) {
                        return;
                    }
                    if (importDepartments) {
                        setImportDepartments(false);
                        updateFunction(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.NONE);
                    } else {
                        setImportDepartments(true);
                        updateFunction(policyID, CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.DEFAULT);
                    }
                }}
            />
            {importDepartments && (
                <View>
                    <OfflineWithFeedback pendingAction={mappings?.pendingFields?.[mapping]}>
                        <MenuItemWithTopDescription
                            title={translationKeys?.titleKey ? translate(translationKeys?.titleKey) : undefined}
                            description={translate('workspace.common.displayedAs')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE.getRoute(policyID, mapping))}
                            brickRoadIndicator={mappings?.errorFields?.[mapping] ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        />
                    </OfflineWithFeedback>
                    <Text
                        style={[styles.textLabelSupporting, styles.ph5]}
                        numberOfLines={2}
                    >
                        {translationKeys?.descriptionKey ? translate(translationKeys?.descriptionKey) : undefined}
                    </Text>
                </View>
            )}
        </ConnectionLayout>
    );
}

SageIntacctToggleMappingsPage.displayName = 'SageIntacctToggleMappingsPage';

export default SageIntacctToggleMappingsPage;
