import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import Icon from '@components/Icon';
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
import {filterPolicyIDSelector} from '@src/selectors/Search';
import getEmptyArray from '@src/types/utils/getEmptyArray';
import type IconAsset from '@src/types/utils/IconAsset';
import MultiSelect from './MultiSelect';

type ExportedToSelectorProps = {
    value: string[] | undefined;
    onChange: (exportedTo: string[]) => void;
};

const STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL: Record<string, string> = {
    [CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
};

function ExportedToSelector({value = [], onChange}: ExportedToSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'XeroSquare',
        'QBOSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'GustoSquare',
        'Table',
        'TablePencil',
    ]);
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES);
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS);
    const [policyIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: filterPolicyIDSelector});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const connectedIntegrationNames = getConnectedIntegrationNamesForPolicies(policies, policyIDs.length > 0 ? policyIDs : undefined);

    const integrationConnectionNames = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES;

    const tableIconForExportOption = (tableIcon: IconAsset) => (
        <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getWidthAndHeightStyle(variables.w28, variables.h28)]}>
            <Icon
                src={tableIcon}
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
                    tableIconForExportOption(expensifyIcons.Table)
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
            const isStandardTemplate = !!STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL[template.templateName];
            standardAndIntegrationCustomTemplatePickerItems.push({
                text: displayName,
                value: filterValue,
                leftElement: tableIconForExportOption(isStandardTemplate ? expensifyIcons.Table : expensifyIcons.TablePencil),
            });
        }

        return [...connectedIntegrationPickerItems, ...standardAndIntegrationCustomTemplatePickerItems];
    })();
    const selectedExportedTo = exportedToPickerOptions.filter((option) => value.includes(option.value));

    return (
        <MultiSelect
            value={selectedExportedTo}
            items={exportedToPickerOptions}
            isSearchable={exportedToPickerOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChange={(exportedTo) => onChange(exportedTo.map((e) => e.value))}
        />
    );
}

export default ExportedToSelector;
