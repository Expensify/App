import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctMappingValue} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SageIntacctMappingName, SageIntacctMappingValue} from '@src/types/onyx/Policy';

type SageIntacctToggleMappingsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_MAPPING_TYPE>;

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

    const policy = usePolicy(route.params.policyID);
    const mappingName: SageIntacctMappingName = route.params.mapping;
    const policyID = policy?.id;
    const config = policy?.connections?.intacct?.config;
    const isImportMappingEnable = config?.mappings?.[mappingName] !== CONST.SAGE_INTACCT_MAPPING_VALUE.NONE;
    const isAccordionExpanded = useSharedValue(isImportMappingEnable);
    const shouldAnimateAccordionSection = useSharedValue(false);

    // We are storing translation keys in the local state for animation purposes.
    // Otherwise, the values change to undefined immediately after clicking, before the closing animation finishes,
    // resulting in a janky animation effect.
    const [translationKeys, setTranslationKey] = useState<DisplayTypeTranslationKeys | undefined>(undefined);

    useEffect(() => {
        if (!isImportMappingEnable) {
            return;
        }
        setTranslationKey(getDisplayTypeTranslationKeys(config?.mappings?.[mappingName]));
    }, [isImportMappingEnable, config?.mappings, mappingName]);

    return (
        <ConnectionLayout
            displayName="SageIntacctToggleMappingsPage"
            headerTitleAlreadyTranslated={Str.recapitalize(translate('workspace.intacct.mappingTitle', {mappingName}))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID))}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mb5, styles.ph5, styles.flexRow]}>
                <RenderHTML html={translate('workspace.intacct.toggleImportTitle', translate('workspace.intacct.mappingTitle', {mappingName}))} />
            </View>
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={`${translate('workspace.accounting.import')} ${translate('workspace.intacct.mappingTitle', {mappingName})}`}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={isImportMappingEnable}
                onToggle={(enabled) => {
                    const mappingValue = enabled ? CONST.SAGE_INTACCT_MAPPING_VALUE.TAG : CONST.SAGE_INTACCT_MAPPING_VALUE.NONE;
                    updateSageIntacctMappingValue(policyID, mappingName, mappingValue, config?.mappings?.[mappingName]);
                    isAccordionExpanded.set(enabled);
                    shouldAnimateAccordionSection.set(true);
                }}
                pendingAction={settingsPendingAction([mappingName], config?.pendingFields)}
                errors={getLatestErrorField(config ?? {}, mappingName)}
                onCloseError={() => clearSageIntacctErrorField(policyID, mappingName)}
            />
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([mappingName], config?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translationKeys?.titleKey ? translate(translationKeys?.titleKey) : undefined}
                        description={translate('workspace.common.displayedAs')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE.getRoute(policyID, mappingName))}
                        brickRoadIndicator={areSettingsInErrorFields([mappingName], config?.errorFields) ? 'error' : undefined}
                        hintText={translationKeys?.descriptionKey ? translate(translationKeys?.descriptionKey) : undefined}
                    />
                </OfflineWithFeedback>
            </Accordion>
        </ConnectionLayout>
    );
}

export default SageIntacctToggleMappingsPage;
