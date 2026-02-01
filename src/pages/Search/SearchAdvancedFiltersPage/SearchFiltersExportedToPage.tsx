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
        const predefinedConnectionNamesList: ConnectionName[] = [
            CONST.POLICY.CONNECTIONS.NAME.XERO,
            CONST.POLICY.CONNECTIONS.NAME.QBO,
            CONST.POLICY.CONNECTIONS.NAME.QBD,
            CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
            CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
            CONST.POLICY.CONNECTIONS.NAME.CERTINIA,
        ];
        const predefinedConnectionNamesSet = new Set<string>(predefinedConnectionNamesList);

        const integrationItems: SearchMultipleSelectionPickerItem[] = predefinedConnectionNamesList.map((value) => {
            const icon = getIntegrationIcon(value, expensifyIcons);
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
                name: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[value],
                value,
                leftElement,
            };
        });
        const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, true);

        const otherItems: SearchMultipleSelectionPickerItem[] = exportTemplates
            .filter((template) => template.templateName && !predefinedConnectionNamesSet.has(template.templateName))
            .map((template) => ({
                name: template.name ?? template.templateName ?? '',
                value: template.templateName,
                leftElement: tableIconElement,
            }))
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
