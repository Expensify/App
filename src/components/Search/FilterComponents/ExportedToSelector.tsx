import Icon from '@components/Icon';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useCombinedExportTemplates from '@hooks/useCombinedExportTemplates';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSearchValueForConnection} from '@libs/AccountingUtils';
import {getIntegrationIcon} from '@libs/ReportUtils';
import {getAllPolicyValues, getConnectedIntegrationNamesForPolicies} from '@libs/SearchQueryUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import MultiSelect from './MultiSelect';

type ExportedToSelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

const STANDARD_EXPORT_TEMPLATE_ID_TO_DISPLAY_LABEL: Record<string, string> = {
    [CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
};

function ExportedToSelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: ExportedToSelectorProps) {
    const styles = useThemeStyles();
    const {localeCompare} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'XeroSquare',
        'QBOSquare',
        'NetSuiteSquare',
        'IntacctSquare',
        'QBDSquare',
        'CertiniaSquare',
        'RilletSquare',
        'GustoSquare',
        'Table',
        'TablePencil',
    ]);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const connectedIntegrationNames = getConnectedIntegrationNamesForPolicies(policies, policyID);

    const policiesToLoadTemplatesFrom = getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY, policies);
    const {combinedExportTemplates: deduplicatedExportTemplates} = useCombinedExportTemplates(policiesToLoadTemplatesFrom);

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
    const sortedExportedToPickerOptions = exportedToPickerOptions.toSorted((a, b) => localeCompare(a.text.toString(), b.text.toString()));

    return (
        <MultiSelect
            value={selectedExportedTo}
            items={sortedExportedToPickerOptions}
            isSearchable={exportedToPickerOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(exportedTo) => onChange(exportedTo.map((e) => e.value))}
        />
    );
}

export default ExportedToSelector;
