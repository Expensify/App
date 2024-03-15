import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceTaxRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {openPolicyTaxesPage} from '@libs/actions/Policy';
import {clearTaxRateError} from '@libs/actions/TaxRate';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {WorkspacesCentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceTaxesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES>;

function WorkspaceTaxesPage({policy, route}: WorkspaceTaxesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTaxesIDs, setSelectedTaxesIDs] = useState<string[]>([]);
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;

    const fetchTaxes = () => {
        openPolicyTaxesPage(route.params.policyID);
    };

    const {isOffline} = useNetwork({onReconnect: fetchTaxes});

    useEffect(() => {
        fetchTaxes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const textForDefault = useCallback(
        (taxID: string): string => {
            if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
                return translate('common.default');
            }
            if (taxID === defaultExternalID) {
                return translate('workspace.taxes.workspaceDefault');
            }
            if (taxID === foreignTaxDefault) {
                return translate('workspace.taxes.foreignDefault');
            }
            return '';
        },
        [defaultExternalID, foreignTaxDefault, translate],
    );

    const taxesList = useMemo<ListItem[]>(
        () =>
            Object.entries(policy?.taxRates?.taxes ?? {})
                .map(([key, value]) => ({
                    text: value.name,
                    alternateText: textForDefault(key),
                    keyForList: key,
                    isSelected: !!selectedTaxesIDs.includes(key),
                    isDisabledCheckbox: key === defaultExternalID,
                    pendingAction: value.pendingAction,
                    errors: value.errors ?? ErrorUtils.getLatestErrorFieldForAnyField(value),
                    rightElement: (
                        <View style={styles.flexRow}>
                            <Text style={[styles.disabledText, styles.alignSelfCenter]}>
                                {value.isDisabled ? translate('workspace.common.disabled') : translate('workspace.common.enabled')}
                            </Text>
                            <View style={[styles.p1, styles.pl2]}>
                                <Icon
                                    src={Expensicons.ArrowRight}
                                    fill={theme.icon}
                                />
                            </View>
                        </View>
                    ),
                }))
                .sort((a, b) => a.text.localeCompare(b.text)),
        [policy?.taxRates?.taxes, textForDefault, defaultExternalID, selectedTaxesIDs, styles, theme.icon, translate],
    );

    const isLoading = !isOffline && taxesList === undefined;

    const toggleTax = (tax: ListItem) => {
        const key = tax.keyForList;
        if (typeof key !== 'string') {
            return;
        }

        setSelectedTaxesIDs((prev) => {
            if (prev?.includes(key)) {
                return prev.filter((item) => item !== key);
            }
            return [...prev, key];
        });
    };

    const toggleAllTaxes = () => {
        const taxesToSelect = taxesList.filter((tax) => tax.keyForList !== defaultExternalID);
        setSelectedTaxesIDs((prev) => {
            if (prev.length === taxesToSelect.length) {
                return [];
            }

            return taxesToSelect.map((item) => (item.keyForList ? item.keyForList : ''));
        });
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('statusPage.status')}</Text>
        </View>
    );

    const dropdownMenuOptions = useMemo(() => {
        const options: Array<DropdownOption<WorkspaceTaxRatesBulkActionType>> = [
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.taxes.actions.delete'),
                value: CONST.POLICY.TAX_RATES_BULK_ACTION_TYPES.DELETE,
                onSelected: () => {},
            },
        ];

        // `Disable rates` when at least one enabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => !policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: Expensicons.Document,
                text: translate('workspace.taxes.actions.disable'),
                value: CONST.POLICY.TAX_RATES_BULK_ACTION_TYPES.DISABLE,
            });
        }

        // `Enable rates` when at least one disabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: Expensicons.Document,
                text: translate('workspace.taxes.actions.enable'),
                value: CONST.POLICY.TAX_RATES_BULK_ACTION_TYPES.ENABLE,
            });
        }
        return options;
    }, [policy?.taxRates?.taxes, selectedTaxesIDs, translate]);

    const headerButtons = (
        <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
            {!selectedTaxesIDs.length ? (
                <>
                    <Button
                        medium
                        success
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAXES_NEW.getRoute(route.params.policyID))}
                        icon={Expensicons.Plus}
                        text={translate('workspace.taxes.addRate')}
                        style={[styles.mr3, isSmallScreenWidth && styles.w50]}
                    />
                    <Button
                        medium
                        onPress={() => {}}
                        icon={Expensicons.Gear}
                        text={translate('common.settings')}
                        style={[isSmallScreenWidth && styles.w50]}
                    />
                </>
            ) : (
                <ButtonWithDropdownMenu<WorkspaceTaxRatesBulkActionType>
                    onPress={() => {}}
                    options={dropdownMenuOptions}
                    buttonSize="medium"
                    customText={`${selectedTaxesIDs.length} selected`}
                />
            )}
        </View>
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={WorkspaceTaxesPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        icon={Illustrations.Coins}
                        title={translate('workspace.common.taxes')}
                        shouldShowBackButton={isSmallScreenWidth}
                    >
                        {!isSmallScreenWidth && headerButtons}
                    </HeaderWithBackButton>

                    {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}

                    <View style={[styles.ph5, styles.pb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.taxes.subtitle')}</Text>
                    </View>
                    {isLoading && (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={[styles.flex1]}
                            color={theme.spinner}
                        />
                    )}
                    <SelectionList
                        canSelectMultiple
                        sections={[{data: taxesList, indexOffset: 0, isDisabled: false}]}
                        onCheckboxPress={toggleTax}
                        onSelectRow={(tax: ListItem) => tax.keyForList && Navigation.navigate(ROUTES.WORKSPACE_TAXES_EDIT.getRoute(policy?.id ?? '', tax.keyForList))}
                        onSelectAll={toggleAllTaxes}
                        showScrollIndicator
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        onDismissError={(item) => item.keyForList && clearTaxRateError(policy?.id ?? '', item.keyForList, item.pendingAction)}
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesPage.displayName = 'WorkspaceTaxesPage';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesPage);
