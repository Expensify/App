import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption, WorkspaceTaxRatesBulkActionType} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {clearTaxRateError, deletePolicyTaxes, setPolicyTaxesEnabled} from '@libs/actions/TaxRate';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {openPolicyTaxesPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {TaxRate} from '@src/types/onyx';

type WorkspaceTaxesPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.TAXES>;

function WorkspaceTaxesPage({
    policy,
    route: {
        params: {policyID},
    },
}: WorkspaceTaxesPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const [selectedTaxesIDs, setSelectedTaxesIDs] = useState<string[]>([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const {selectionMode} = useMobileSelectionMode();
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    const isFocused = useIsFocused();
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = PolicyUtils.hasSyncError(policy, isSyncInProgress);

    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy, true);
    const canSelectMultiple = shouldUseNarrowLayout ? selectionMode?.isEnabled : true;

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
                isSelected: !!selectedTaxesIDs.includes(key) && canSelectMultiple,
                isDisabledCheckbox: !PolicyUtils.canEditTaxRate(policy, key),
                isDisabled: value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: value.pendingAction ?? (Object.keys(value.pendingFields ?? {}).length > 0 ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
                errors: value.errors ?? ErrorUtils.getLatestErrorFieldForAnyField(value),
                rightElement: <ListItemRightCaretWithLabel labelText={!value.isDisabled ? translate('workspace.common.enabled') : translate('workspace.common.disabled')} />,
            }))
            .sort((a, b) => (a.text ?? a.keyForList ?? '').localeCompare(b.text ?? b.keyForList ?? ''));
    }, [policy, textForDefault, selectedTaxesIDs, canSelectMultiple, translate]);

    const isLoading = !isOffline && taxesList === undefined;

    const toggleTax = (tax: ListItem) => {
        const key = tax.keyForList;
        if (typeof key !== 'string' || key === defaultExternalID || key === foreignTaxDefault) {
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
        const taxesToSelect = taxesList.filter(
            (tax) => tax.keyForList !== defaultExternalID && tax.keyForList !== foreignTaxDefault && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        setSelectedTaxesIDs((prev) => {
            if (prev.length === taxesToSelect.length) {
                return [];
            }
            return taxesToSelect.map((item) => (item.keyForList ? item.keyForList : ''));
        });
    };

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3, styles.pr9, !canSelectMultiple && styles.m5]}>
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
        const options: Array<DropdownOption<WorkspaceTaxRatesBulkActionType>> = [];
        if (!hasAccountingConnections) {
            options.push({
                icon: Expensicons.Trashcan,
                text: isMultiple ? translate('workspace.taxes.actions.deleteMultiple') : translate('workspace.taxes.actions.delete'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setIsDeleteModalVisible(true),
            });
        }

        // `Disable rates` when at least one enabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => !policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: Expensicons.DocumentSlash,
                text: isMultiple ? translate('workspace.taxes.actions.disableMultiple') : translate('workspace.taxes.actions.disable'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DISABLE,
                onSelected: () => toggleTaxes(false),
            });
        }

        // `Enable rates` when at least one disabled rate is selected.
        if (selectedTaxesIDs.some((taxID) => policy?.taxRates?.taxes[taxID]?.isDisabled)) {
            options.push({
                icon: Expensicons.Document,
                text: isMultiple ? translate('workspace.taxes.actions.enableMultiple') : translate('workspace.taxes.actions.enable'),
                value: CONST.POLICY.BULK_ACTION_TYPES.ENABLE,
                onSelected: () => toggleTaxes(true),
            });
        }
        return options;
    }, [hasAccountingConnections, policy?.taxRates?.taxes, selectedTaxesIDs, toggleTaxes, translate]);

    const shouldShowBulkActionsButton = shouldUseNarrowLayout ? selectionMode?.isEnabled : selectedTaxesIDs.length > 0;
    const headerButtons = !shouldShowBulkActionsButton ? (
        <View style={[styles.w100, styles.flexRow, shouldUseNarrowLayout && styles.mb3]}>
            {!hasAccountingConnections && (
                <Button
                    success
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAX_CREATE.getRoute(policyID))}
                    icon={Expensicons.Plus}
                    text={translate('workspace.taxes.addRate')}
                    style={[styles.mr3, shouldUseNarrowLayout && styles.flex1]}
                />
            )}
            <Button
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_TAXES_SETTINGS.getRoute(policyID))}
                icon={Expensicons.Gear}
                text={translate('common.settings')}
                style={[shouldUseNarrowLayout && styles.flex1]}
            />
        </View>
    ) : (
        <ButtonWithDropdownMenu<WorkspaceTaxRatesBulkActionType>
            onPress={() => {}}
            options={dropdownMenuOptions}
            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
            customText={translate('workspace.common.selected', {count: selectedTaxesIDs.length})}
            shouldAlwaysShowDropdownMenu
            pressOnEnter
            isSplitButton={false}
            style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
            isDisabled={!selectedTaxesIDs.length}
        />
    );

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {!hasSyncError && isConnectedToAccounting ? (
                <Text>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.taxes.importedFromAccountingSoftware')} `}</Text>
                    <TextLink
                        style={[styles.textNormal, styles.link]}
                        href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                    >
                        {`${currentConnectionName} ${translate('workspace.accounting.settings')}`}
                    </TextLink>
                    <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
                </Text>
            ) : (
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.taxes.subtitle')}</Text>
            )}
        </View>
    );

    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
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
                    icon={!selectionModeHeader ? Illustrations.Coins : undefined}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.taxes')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (selectionMode?.isEnabled) {
                            setSelectedTaxesIDs([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldUseNarrowLayout && headerButtons}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{headerButtons}</View>}

                {!shouldUseNarrowLayout && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={[styles.flex1]}
                        color={theme.spinner}
                    />
                )}
                <SelectionListWithModal
                    canSelectMultiple={canSelectMultiple}
                    turnOnSelectionModeOnLongPress
                    onTurnOnSelectionMode={(item) => item && toggleTax(item)}
                    sections={[{data: taxesList, isDisabled: false}]}
                    onCheckboxPress={toggleTax}
                    onSelectRow={navigateToEditTaxRate}
                    onSelectAll={toggleAllTaxes}
                    ListItem={TableListItem}
                    customListHeader={getCustomListHeader()}
                    listHeaderContent={shouldUseNarrowLayout ? getHeaderText() : null}
                    shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                    listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                    onDismissError={(item) => (item.keyForList ? clearTaxRateError(policyID, item.keyForList, item.pendingAction) : undefined)}
                    showScrollIndicator={false}
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
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceTaxesPage.displayName = 'WorkspaceTaxesPage';

export default withPolicyAndFullscreenLoading(WorkspaceTaxesPage);
