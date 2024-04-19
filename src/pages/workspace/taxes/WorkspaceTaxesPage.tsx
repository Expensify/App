import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceTaxRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RightElementEnabledStatus from '@components/SelectionList/RightElementEnabledStatus';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {openPolicyTaxesPage} from '@libs/actions/Policy';
import {clearTaxRateError, deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WorkspacesCentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TaxRate} from '@src/types/onyx';

type WorkspaceTaxesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES>;

function WorkspaceTaxesPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceTaxesPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [selectedTaxesIDs, setSelectedTaxesIDs] = useState<string[]>([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    const dropdownButtonRef = useRef(null);
    const isFocused = useIsFocused();

    const fetchTaxes = useCallback(() => {
        openPolicyTaxesPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchTaxes});

    useFocusEffect(
        useCallback(() => {
            fetchTaxes();
        }, [fetchTaxes]),
    );

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedTaxesIDs([]);
    }, [isFocused]);

    const textForDefault = useCallback(
        (taxID: string, taxRate: TaxRate): string => {
            let suffix;
            if (taxID === defaultExternalID && taxID === foreignTaxDefault) {
                suffix = translate('common.default');
            } else if (taxID === defaultExternalID) {
                suffix = translate('workspace.taxes.workspaceDefault');
            } else if (taxID === foreignTaxDefault) {
                suffix = translate('workspace.taxes.foreignDefault');
            }
            if (suffix) {
                return `${taxRate.value} ${CONST.DOT_SEPARATOR} ${suffix}`;
            }
            return `${taxRate.value}`;
        },
        [defaultExternalID, foreignTaxDefault, translate],
    );

    const taxesList = useMemo<ListItem[]>(() => {
        if (!policy) {
            return [];
        }
        return Object.entries(policy.taxRates?.taxes ?? {})
            .map(([key, value]) => ({
                text: value.name,
                alternateText: textForDefault(key, value),
                keyForList: key,
                isSelected: !!selectedTaxesIDs.includes(key),
                isDisabledCheckbox: !PolicyUtils.canEditTaxRate(policy, key),
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
                errors: value.errors ?? ErrorUtils.getLatestErrorFieldForAnyField(value),
                rightElement: <RightElementEnabledStatus enabled={!value.isDisabled} />,
            }))
            .sort((a, b) => (a.text ?? a.keyForList ?? '').localeCompare(b.text ?? b.keyForList ?? ''));
    }, [policy, textForDefault, selectedTaxesIDs]);

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

    const deleteTaxes = useCallback(() => {
        if (!policyID) {
            return;
        }
        deletePolicyTaxes(policyID, selectedTaxesIDs);
        setSelectedTaxesIDs([]);
        setIsDeleteModalVisible(false);
    }, [policyID, selectedTaxesIDs]);

    const toggleTaxes = useCallback(
        (isEnabled: boolean) => {
            if (!policyID) {
                return;
            }
            setPolicyTaxesEnabled(policyID, selectedTaxesIDs, isEnabled);
            setSelectedTaxesIDs([]);
        },
        [policyID, selectedTaxesIDs],
    );

    const navigateToEditTaxRate = (taxRate: ListItem) => {
        if (!taxRate.keyForList) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_TAX_EDIT.getRoute(policyID, taxRate.keyForList));
    };

    const dropdownMenuOptions = useMemo(() => {
        const isMultiple = selectedTaxesIDs.length > 1;
        const options: Array<DropdownOption<WorkspaceTaxRatesBulkActionType>> = [
            {
                icon: Expensicons.Trashcan,
                text: isMultiple ? translate('workspace.taxes.actions.deleteMultiple') : translate('workspace.taxes.actions.delete'),
                value: CONST.POLICY.TAX_RATES_BULK_ACTION_TYPES.DELETE,
                onSelected: () => setIsDeleteModalVisible(true),
            },
        ];

        // `Disable rates` when at least one enabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => !policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: Expensicons.DocumentSlash,
                text: isMultiple ? translate('workspace.taxes.actions.disableMultiple') : translate('workspace.taxes.actions.disable'),
                value: CONST.POLICY.TAX_RATES_BULK_ACTION_TYPES.DISABLE,
                onSelected: () => toggleTaxes(false),
            });
        }

        // `Enable rates` when at least one disabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: Expensicons.Document,
                text: isMultiple ? translate('workspace.taxes.actions.enableMultiple') : translate('workspace.taxes.actions.enable'),
                value: CONST.POLICY.TAX_RATES_BULK_ACTION_TYPES.ENABLE,
                onSelected: () => toggleTaxes(true),
            });
        }
        return options;
    }, [policy?.taxRates?.taxes, selectedTaxesIDs, toggleTaxes, translate]);

    const headerButtons = !selectedTaxesIDs.length ? (
        <View style={[styles.w100, styles.flexRow, isSmallScreenWidth && styles.mb3]}>
            <Button
                medium
                success
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_CREATE.getRoute(policyID))}
                icon={Expensicons.Plus}
                text={translate('workspace.taxes.addRate')}
                style={[styles.mr3, isSmallScreenWidth && styles.w50]}
            />
            <Button
                medium
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID))}
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={[isSmallScreenWidth && styles.w50]}
            />
        </View>
    ) : (
        <ButtonWithDropdownMenu<WorkspaceTaxRatesBulkActionType>
            buttonRef={dropdownButtonRef}
            onPress={() => {}}
            options={dropdownMenuOptions}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            customText={translate('workspace.common.selected', {selectedNumber: selectedTaxesIDs.length})}
            shouldAlwaysShowDropdownMenu
            pressOnEnter
            style={[isSmallScreenWidth && styles.w50, isSmallScreenWidth && styles.mb3]}
        />
    );

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}
                >
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

                        <View style={[styles.ph5, styles.pb5, styles.pt3]}>
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
                            sections={[{data: taxesList, isDisabled: false}]}
                            onCheckboxPress={toggleTax}
                            onSelectRow={navigateToEditTaxRate}
                            onSelectAll={toggleAllTaxes}
                            showScrollIndicator
                            ListItem={TableListItem}
                            customListHeader={getCustomListHeader()}
                            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                            onDismissError={(item) => (item.keyForList ? clearTaxRateError(policyID, item.keyForList, item.pendingAction) : undefined)}
                        />
                        <ConfirmModal
                            title={translate('workspace.taxes.actions.delete')}
                            isVisible={isDeleteModalVisible}
                            onConfirm={deleteTaxes}
                            onCancel={() => setIsDeleteModalVisible(false)}
                            prompt={
                                selectedTaxesIDs.length > 1
                                    ? translate('workspace.taxes.deleteMultipleTaxConfirmation', {taxAmount: selectedTaxesIDs.length})
                                    : translate('workspace.taxes.deleteTaxConfirmation')
                            }
                            confirmText={translate('common.delete')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesPage.displayName = 'WorkspaceTaxesPage';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesPage);
