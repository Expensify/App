import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSearchValueForConnection} from '@libs/AccountingUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectedIntegrationNamesForPolicies} from '@libs/PolicyUtils';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import {getExportTemplates, updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/** Maps standard export template IDs to the display label used in search query/filter */
const STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL: Record<string, string> = {
    [CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
};

function SearchFiltersExportedToPage() {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare', 'CertiniaSquare', 'Table']);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const integrationConnectionNames = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const selectedExportedToValues = searchAdvancedFiltersForm?.exportedTo ?? [];
    const connectedIntegrationNames = getConnectedIntegrationNamesForPolicies(policies, policyIDs.length > 0 ? policyIDs : undefined);

    const tableIconForExportOption = (
        <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getWidthAndHeightStyle(variables.w28, variables.h28)]}>
            <Icon
                src={expensifyIcons.Table}
                fill={theme.icon}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
            />
        </View>
    );

    const exportedToPickerOptions: SearchMultipleSelectionPickerItem[] = (() => {
        const integrationConnectionNamesSet = new Set<string>(integrationConnectionNames);

        const connectedIntegrationPickerItems: SearchMultipleSelectionPickerItem[] = integrationConnectionNames
            .filter((connectionName) => connectedIntegrationNames.has(connectionName))
            .map((connectionName) => {
                const icon = getIntegrationIcon(connectionName, expensifyIcons);
                const leftElement = icon ? (
                    <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={icon}
                            width={variables.iconSizeXLarge}
                            height={variables.iconSizeXLarge}
                            additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)]}
                        />
                    </View>
                ) : (
                    tableIconForExportOption
                );
                return {
                    name: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName],
                    value: getSearchValueForConnection(connectionName),
                    leftElement,
                };
            });

        const policiesToLoadTemplatesFrom = policyIDs.length > 0 ? policyIDs.map((id) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`]).filter(Boolean) : Object.values(policies ?? {});
        const exportTemplatesFromPolicies = policiesToLoadTemplatesFrom.flatMap((policy) => getExportTemplates([], {}, translate, policy, false));
        const exportTemplatesFromAccount = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, undefined, true);
        const allExportTemplates = [...exportTemplatesFromAccount, ...exportTemplatesFromPolicies];

        const exportTemplatesByTemplateId = new Map<string, TupleToUnion<typeof allExportTemplates>>();
        for (const template of allExportTemplates) {
            if (template.templateName && !exportTemplatesByTemplateId.has(template.templateName)) {
                exportTemplatesByTemplateId.set(template.templateName, template);
            }
        }
        const deduplicatedExportTemplates = Array.from(exportTemplatesByTemplateId.values());

        const customExportTemplatePickerItems: SearchMultipleSelectionPickerItem[] = [];
        const standardExportTemplatePickerItems: SearchMultipleSelectionPickerItem[] = [];

        for (const template of deduplicatedExportTemplates) {
            if (!template.templateName || integrationConnectionNamesSet.has(template.templateName)) {
                continue;
            }

            const displayName = template.name ?? template.templateName ?? '';
            const isStandardExportTemplate = !!STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL[template.templateName];
            const filterValue = isStandardExportTemplate
                ? (STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL[template.templateName] ?? template.templateName)
                : (template.name ?? template.templateName);
            const pickerItem: SearchMultipleSelectionPickerItem = {
                name: displayName,
                value: filterValue,
                leftElement: tableIconForExportOption,
            };

            if (STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL[template.templateName]) {
                standardExportTemplatePickerItems.push(pickerItem);
            } else {
                customExportTemplatePickerItems.push(pickerItem);
            }
        }

        customExportTemplatePickerItems.sort((a, b) => localeCompare(a.name, b.name));

        return [...connectedIntegrationPickerItems, ...customExportTemplatePickerItems, ...standardExportTemplatePickerItems];
    })();

    const initiallySelectedPickerItems: SearchMultipleSelectionPickerItem[] | undefined = (() => {
        if (selectedExportedToValues.length === 0) {
            return undefined;
        }
        const normalizedSelectedValues = new Set(selectedExportedToValues);
        const selectedOptionsPresentInCurrentList = exportedToPickerOptions.filter((option) => {
            const optionValue = typeof option.value === 'string' ? option.value : (option.value.at(0) ?? '');
            return normalizedSelectedValues.has(optionValue);
        });
        const selectedValueIdsFoundInCurrentOptions = new Set(
            selectedOptionsPresentInCurrentList.map((option) => (typeof option.value === 'string' ? option.value : (option.value.at(0) ?? ''))),
        );
        const unavailableSelectedValues = selectedExportedToValues.filter((value) => !selectedValueIdsFoundInCurrentOptions.has(value));
        const unavailableSelectedOptions: SearchMultipleSelectionPickerItem[] = unavailableSelectedValues.map((value) => {
            const connectionName = integrationConnectionNames.find((name) => CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[name] === value);
            const integrationIcon = connectionName ? getIntegrationIcon(connectionName, expensifyIcons) : null;
            const leftElement = integrationIcon ? (
                <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={integrationIcon}
                        width={variables.iconSizeXLarge}
                        height={variables.iconSizeXLarge}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)]}
                    />
                </View>
            ) : (
                tableIconForExportOption
            );
            return {
                name: value,
                value,
                leftElement,
            };
        });
        return [...selectedOptionsPresentInCurrentList, ...unavailableSelectedOptions];
    })();

    const onSaveSelection = (values: string[]) => updateAdvancedFilters({exportedTo: values});

    return (
        <ScreenWrapper
            testID="SearchFiltersExportedToPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.exportedTo')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={exportedToPickerOptions}
                    initiallySelectedItems={initiallySelectedPickerItems}
                    onSaveSelection={onSaveSelection}
                    shouldShowTextInput
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersExportedToPage;
