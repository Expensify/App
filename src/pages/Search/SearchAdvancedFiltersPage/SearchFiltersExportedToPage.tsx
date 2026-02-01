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
import {getExportTemplates, updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getIntegrationIcon} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';

const CONNECTION_NAME_TO_EXPORTED_TO_SEARCH_VALUE: Record<ConnectionName, string> = {
    [CONST.POLICY.CONNECTIONS.NAME.XERO]: 'xero',
    [CONST.POLICY.CONNECTIONS.NAME.QBO]: 'qbo',
    [CONST.POLICY.CONNECTIONS.NAME.QBD]: 'qbd',
    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: 'netsuite',
    [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: 'intacct',
    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: 'certinia',
};

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
    const policy = policyIDs?.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDs[0]}`] : undefined;

    const tableIconElement = useMemo(
        () => (
            <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                <Icon
                    src={expensifyIcons.Table}
                    fill={theme.icon}
                    width={24}
                    height={24}
                />
            </View>
        ),
        [styles],
    );

    const items = useMemo((): SearchMultipleSelectionPickerItem[] => {
        const predefinedConnectionNamesList = Object.keys(CONNECTION_NAME_TO_EXPORTED_TO_SEARCH_VALUE) as ConnectionName[];
        const predefinedConnectionNamesSet = new Set<string>(predefinedConnectionNamesList);

        const integrationItems: SearchMultipleSelectionPickerItem[] = predefinedConnectionNamesList.map((connectionName) => {
            const icon = getIntegrationIcon(connectionName, expensifyIcons);
            const leftElement = icon ? (
                <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <Icon
                        src={icon}
                        width={24}
                        height={24}
                        fill={theme.icon}
                        additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)]}
                    />
                </View>
            ) : (
                tableIconElement
            );
            return {
                name: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName],
                value: CONNECTION_NAME_TO_EXPORTED_TO_SEARCH_VALUE[connectionName],
                leftElement,
            };
        });
        const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, true);

        const otherItems: SearchMultipleSelectionPickerItem[] = exportTemplates
            .filter((template) => template.templateName && !predefinedConnectionNamesSet.has(template.templateName))
            .map((template) => {
                const name = template.name ?? template.templateName ?? '';
                const value = EXPORT_OPTION_TO_QUERY_LABEL[template.templateName] ?? template.templateName;
                return {
                    name,
                    value,
                    leftElement: tableIconElement,
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));

        return [...integrationItems, ...otherItems];
    }, [integrationsExportTemplates, csvExportLayouts, policy, expensifyIcons, styles, StyleUtils, translate, tableIconElement]);

    const initiallySelectedItems = useMemo((): SearchMultipleSelectionPickerItem[] | undefined => {
        const selectedValues = searchAdvancedFiltersForm?.exportedTo ?? [];
        if (selectedValues.length === 0) {
            return undefined;
        }
        const normalizedSet = new Set(selectedValues.map((selectedValue) => selectedValue.toLowerCase()));
        return items.filter((item) => {
            const value = typeof item.value === 'string' ? item.value : (item.value[0] ?? '');
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
                onBackButtonPress={() => Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute())}
            />
            <View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker
                    items={items}
                    initiallySelectedItems={initiallySelectedItems}
                    onSaveSelection={onSaveSelection}
                    shouldShowTextInput={true}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchFiltersExportedToPage;
