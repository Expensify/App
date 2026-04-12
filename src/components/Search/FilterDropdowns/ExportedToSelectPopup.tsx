import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import Icon from '@components/Icon';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getSearchValueForConnection} from '@libs/AccountingUtils';
import {getExportTemplates} from '@libs/actions/Search';
import {getConnectedIntegrationNamesForPolicies} from '@libs/PolicyUtils';
import {getIntegrationIcon} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {MultiSelectItem} from './MultiSelectPopup';

type ExportedToSelectPopupProps = {
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

const STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL: Record<string, string> = {
    [CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
};

function filterExportedToSelector(searchAdvancedFiltersForm: SearchAdvancedFiltersForm | undefined) {
    return searchAdvancedFiltersForm?.exportedTo;
}

function ExportedToSelectPopup({closeOverlay, updateFilterForm}: ExportedToSelectPopupProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare', 'CertiniaSquare', 'GustoSquare', 'Table']);
    const [exportedTo] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterExportedToSelector});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const connectedIntegrationNames = getConnectedIntegrationNamesForPolicies(policies, policyIDs.length > 0 ? policyIDs : undefined);

    const integrationConnectionNames = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES;

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
    const exportedToPickerOptions = (() => {
        const integrationConnectionNamesSet = new Set<string>(integrationConnectionNames);

        const connectedIntegrationPickerItems = integrationConnectionNames
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
                    text: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName],
                    value: getSearchValueForConnection(connectionName),
                    leftElement,
                };
            });

        const usedPickerValueKeys = new Set(connectedIntegrationPickerItems.map((item) => item.value));
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

        const standardAndIntegrationCustomTemplatePickerItems = [];

        for (const template of deduplicatedExportTemplates) {
            if (!template.templateName || integrationConnectionNamesSet.has(template.templateName) || template.type === CONST.EXPORT_TEMPLATE_TYPES.IN_APP) {
                continue;
            }

            const displayName = template.name ?? template.templateName ?? '';
            const filterValue = STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL[template.templateName] ?? displayName;
            if (usedPickerValueKeys.has(filterValue)) {
                continue;
            }

            usedPickerValueKeys.add(filterValue);
            standardAndIntegrationCustomTemplatePickerItems.push({
                text: displayName,
                value: filterValue,
                leftElement: tableIconForExportOption,
            });
        }

        return [...connectedIntegrationPickerItems, ...standardAndIntegrationCustomTemplatePickerItems];
    })();
    const selectedExportedTo = exportedToPickerOptions.filter((option) => exportedTo?.includes(option.value));

    const updateExportedToFilterForm = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({exportedTo: items.map((item) => item.value)});
    };

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey="search.exportedTo"
            items={exportedToPickerOptions}
            value={selectedExportedTo}
            isSearchable={exportedToPickerOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChangeCallback={updateExportedToFilterForm}
        />
    );
}

export default ExportedToSelectPopup;
