import React, {useMemo} from 'react';
import {View} from 'react-native';
import Table from '@assets/images/table.svg';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchMultipleSelectionPicker from '@components/Search/SearchMultipleSelectionPicker';
import type {SearchMultipleSelectionPickerItem} from '@components/Search/SearchMultipleSelectionPicker';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {getExportTemplates, updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectionNameForExportedToFilter, getIntegrationIcon} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const PREDEFINED_INTEGRATION_VALUES = [
    {value: 'xero', displayKey: 'xero' as const},
    {value: 'qbo', displayKey: 'quickbooksOnline' as const},
    {value: 'qbd', displayKey: 'quickbooksDesktop' as const},
    {value: 'netsuite', displayKey: 'netsuite' as const},
    {value: 'intacct', displayKey: 'intacct' as const},
    {value: 'certinia', displayKey: 'certinia' as const},
] as const;

function SearchFiltersExportedToPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['XeroSquare', 'QBOSquare', 'NetSuiteSquare', 'IntacctSquare', 'QBDSquare', 'CertiniaSquare']);

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [integrationsExportTemplates] = useOnyx(ONYXKEYS.NVP_INTEGRATION_SERVER_EXPORT_TEMPLATES, {canBeMissing: true});
    const [csvExportLayouts] = useOnyx(ONYXKEYS.NVP_CSV_EXPORT_LAYOUTS, {canBeMissing: true});
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const policy = policyIDs?.length === 1 ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDs[0]}`] : undefined;

    const tableIconElement = useMemo(
        () => (
            <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter, styles.opacitySemiTransparent]}>
                <Icon
                    src={Table}
                    width={24}
                    height={24}
                />
            </View>
        ),
        [styles],
    );

    const items = useMemo((): SearchMultipleSelectionPickerItem[] => {
        const integrationItems: SearchMultipleSelectionPickerItem[] = PREDEFINED_INTEGRATION_VALUES.map((item) => {
            const connectionName = getConnectionNameForExportedToFilter(item.value);
            const icon = connectionName ? getIntegrationIcon(connectionName, expensifyIcons) : undefined;
            const leftElement =
                icon != null ? (
                    <View style={[styles.mr3, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <Icon
                            src={icon}
                            width={24}
                            height={24}
                            additionalStyles={[StyleUtils.getAvatarBorderStyle(CONST.AVATAR_SIZE.DEFAULT, CONST.ICON_TYPE_AVATAR)]}
                        />
                    </View>
                ) : (
                    tableIconElement
                );
            return {
                name: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[item.displayKey],
                value: item.value,
                leftElement,
            };
        });
        const exportTemplates = getExportTemplates(integrationsExportTemplates ?? [], csvExportLayouts ?? {}, translate, policy, true);

        const otherItems: SearchMultipleSelectionPickerItem[] = exportTemplates
            .filter((template) => template.templateName && !PREDEFINED_INTEGRATION_VALUES.some((p) => p.value === template.templateName?.toLowerCase()))
            .map((template) => ({
                name: template.name ?? template.templateName ?? '',
                value: template.templateName,
                leftElement: tableIconElement,
            }))
            .filter((item) => item.name !== '')
            .sort((a, b) => (a.name as string).localeCompare(b.name as string));

        return [...integrationItems, ...otherItems];
    }, [integrationsExportTemplates, csvExportLayouts, policy, expensifyIcons, styles, StyleUtils, translate, tableIconElement]);

    const initiallySelectedItems = useMemo((): SearchMultipleSelectionPickerItem[] | undefined => {
        const selectedValues = searchAdvancedFiltersForm?.exportedTo ?? [];
        if (selectedValues.length === 0) {
            return undefined;
        }
        const normalizedSet = new Set(selectedValues.map((v) => v.toLowerCase()));
        return items.filter((item) => normalizedSet.has(item.value as string));
    }, [searchAdvancedFiltersForm?.exportedTo, items]);

    const onSaveSelection = useMemo(
        () => (values: string[]) => {
            updateAdvancedFilters({exportedTo: values});
        },
        [],
    );

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
