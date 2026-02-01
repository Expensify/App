import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
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
import {getPredefinedConnectionNamesForSearch, getSearchValueForConnection} from '@libs/AccountingUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIntegrationIcon} from '@libs/ReportUtils';
import {getExportTemplates, updateAdvancedFilters} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const EXPORT_OPTION_TO_QUERY_LABEL: Record<string, string> = {
    [CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
};

function SearchFiltersExportedToPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare', 'CertiniaSquare', 'Table']);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const policy = policyIDs?.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDs.at(0)}`] : undefined;

    const items = useMemo((): SearchMultipleSelectionPickerItem[] => {
        const predefinedConnectionNamesList = getPredefinedConnectionNamesForSearch();
        const predefinedConnectionNamesSet = new Set<string>(predefinedConnectionNamesList);

        const defaultExportOptionIcon = (
            <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Icon
                    src={expensifyIcons.Table}
                    fill={theme.icon}
                    width={24}
                    height={24}
                />
            </View>
        );

        const integrationItems: SearchMultipleSelectionPickerItem[] = predefinedConnectionNamesList.map((connectionName) => {
            const icon = getIntegrationIcon(connectionName, expensifyIcons);
            const leftElement = icon ? (
                <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={icon}
                        width={24}
                        height={24}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)]}
                    />
                </View>
            ) : (
                defaultExportOptionIcon
            );
            return {
                name: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName],
                value: getSearchValueForConnection(connectionName),
                leftElement,
            };
        });
        const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, true);

        const customItems: SearchMultipleSelectionPickerItem[] = [];
        const standardItems: SearchMultipleSelectionPickerItem[] = [];

        for (const template of exportTemplates) {
            if (!template.templateName || predefinedConnectionNamesSet.has(template.templateName)) {
                continue;
            }

            const name = template.name ?? template.templateName ?? '';
            const value = EXPORT_OPTION_TO_QUERY_LABEL[template.templateName] ?? template.templateName;
            const item: SearchMultipleSelectionPickerItem = {
                name,
                value,
                leftElement: defaultExportOptionIcon,
            };

            if (EXPORT_OPTION_TO_QUERY_LABEL[template.templateName]) {
                standardItems.push(item);
            } else {
                customItems.push(item);
            }
        }

        customItems.sort((a, b) => a.name.localeCompare?.(b.name) ?? 0);

        return [...integrationItems, ...customItems, ...standardItems];
    }, [integrationsExportTemplates, csvExportLayouts, policy, expensifyIcons, styles, StyleUtils, theme, translate]);

    const initiallySelectedItems = useMemo((): SearchMultipleSelectionPickerItem[] | undefined => {
        const selectedValues = searchAdvancedFiltersForm?.exportedTo ?? [];
        if (selectedValues.length === 0) {
            return undefined;
        }
        const normalizedSet = new Set(selectedValues.map((selectedValue) => selectedValue.toLowerCase()));
        return items.filter((item) => {
            const value = typeof item.value === 'string' ? item.value : (item.value.at(0) ?? '');
            return normalizedSet.has(value.toLowerCase());
        });
    }, [searchAdvancedFiltersForm?.exportedTo, items]);

    const onSaveSelection = useCallback((values: string[]) => updateAdvancedFilters({exportedTo: values}), []);

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
                    items={items}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={onSaveSelection}
                    shouldShowTextInput
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersExportedToPage;
