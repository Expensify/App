import {useFocusEffect} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Plus, Trashcan} from '@components/Icon/Expensicons';
import {Pencil} from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SearchBar from '@components/SearchBar';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CustomListHeader from '@components/SelectionListWithModal/CustomListHeader';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import useEnvironment from '@hooks/useEnvironment';
import useFilteredSelection from '@hooks/useFilteredSelection';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import goBackFromWorkspaceCentralScreen from '@libs/Navigation/helpers/goBackFromWorkspaceCentralScreen';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections, shouldShowSyncError} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {deleteReportFields, openPolicyReportFieldsPage} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyReportField} from '@src/types/onyx';
import type {OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type ReportFieldForList = ListItem & {
    value: string;
    fieldID: string;
    orderWeight?: number;
};

type WorkspaceReportFieldsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS>;

function WorkspaceReportFieldsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceReportFieldsPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const policy = usePolicy(policyID);
    const {selectionMode} = useMobileSelectionMode();
    const [deleteReportFieldsConfirmModalVisible, setDeleteReportFieldsConfirmModalVisible] = useState(false);
    const hasReportAccountingConnections = hasAccountingConnections(policy);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);

    const canSelectMultiple = !hasReportAccountingConnections && (isSmallScreenWidth ? selectionMode?.isEnabled : true);

    const selectionFieldList = useMemo(() => {
        if (!policy?.fieldList) {
            return {};
        }
        return Object.values(policy.fieldList).reduce<Record<string, OnyxValueWithOfflineFeedback<PolicyReportField>>>((acc, reportField) => {
            if (reportField.fieldID === CONST.POLICY.FIELDS.FIELD_LIST_TITLE) {
                return acc;
            }
            const reportFieldKey = getReportFieldKey(reportField.fieldID);
            acc[reportFieldKey] = reportField;
            return acc;
        }, {});
    }, [policy]);

    const filterReportFields = useCallback((reportField: OnyxValueWithOfflineFeedback<PolicyReportField> | undefined) => {
        return !!reportField && reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    }, []);

    const [selectedReportFields, setSelectedReportFields] = useFilteredSelection(selectionFieldList, filterReportFields);

    const fetchReportFields = useCallback(() => {
        openPolicyReportFieldsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchReportFields});

    const hasVisibleReportField = Object.values(selectionFieldList).some((reportField) => reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    useFocusEffect(fetchReportFields);

    const reportFieldsSections = useMemo(() => {
        if (!policy) {
            return [];
        }
        return Object.values(selectionFieldList).map((reportField) => ({
            value: reportField.name,
            fieldID: reportField.fieldID,
            keyForList: String(reportField.fieldID),
            orderWeight: reportField.orderWeight,
            pendingAction: reportField.pendingAction,
            isSelected: selectedReportFields.includes(getReportFieldKey(reportField.fieldID)) && canSelectMultiple,
            isDisabled: reportField.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            text: reportField.name,
            rightElement: <ListItemRightCaretWithLabel labelText={Str.recapitalize(translate(getReportFieldTypeTranslationKey(reportField.type)))} />,
        }));
    }, [canSelectMultiple, selectionFieldList, policy, selectedReportFields, translate]);

    const filterReportField = useCallback((reportField: ReportFieldForList, searchInput: string) => !!reportField.text?.toLowerCase().includes(searchInput), []);
    const sortReportFields = useCallback((reportFields: ReportFieldForList[]) => reportFields.sort((a, b) => localeCompare(a.value, b.value)), []);
    const [inputValue, setInputValue, filteredReportFields] = useSearchResults(reportFieldsSections, filterReportField, sortReportFields);

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(filteredReportFields);

    const updateSelectedReportFields = (item: ReportFieldForList) => {
        const fieldKey = getReportFieldKey(item.fieldID);
        setSelectedReportFields((prevSelectedReportFields) => {
            if (prevSelectedReportFields.includes(fieldKey)) {
                return prevSelectedReportFields.filter((selectedField) => selectedField !== fieldKey);
            }
            return [...prevSelectedReportFields, fieldKey];
        });
    };

    const toggleAllReportFields = () => {
        const availableReportFields = Object.values(reportFieldsSections).filter(
            (reportField) => reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && filteredReportFields.find((item) => item.fieldID === reportField.fieldID),
        );
        setSelectedReportFields(selectedReportFields.length > 0 ? [] : Object.values(availableReportFields).map((reportField) => getReportFieldKey(reportField.fieldID)));
    };

    const navigateToReportFieldsSettings = (reportField: ReportFieldForList) => {
        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_SETTINGS.getRoute(policyID, reportField.fieldID));
    };

    const handleDeleteReportFields = () => {
        setSelectedReportFields([]);
        deleteReportFields(policyID, selectedReportFields);
        setDeleteReportFieldsConfirmModalVisible(false);
    };

    const isLoading = !isOffline && policy === undefined;
    const shouldShowEmptyState =
        !Object.values(selectionFieldList).some((reportField) => reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline) && !isLoading;

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (shouldUseNarrowLayout ? canSelectMultiple : selectedReportFields.length > 0) {
            options.push({
                icon: Trashcan,
                text: translate(selectedReportFields.length === 1 ? 'workspace.reportFields.delete' : 'workspace.reportFields.deleteFields'),
                value: CONST.POLICY.BULK_ACTION_TYPES.DELETE,
                onSelected: () => setDeleteReportFieldsConfirmModalVisible(true),
            });

            return (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {count: selectedReportFields.length})}
                    options={options}
                    isSplitButton={false}
                    style={[shouldUseNarrowLayout && styles.flexGrow1, shouldUseNarrowLayout && styles.mb3]}
                    isDisabled={!selectedReportFields.length}
                />
            );
        }
        return (
            <View style={[styles.w100, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <Button
                    success
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID))}
                    icon={Plus}
                    text={translate('workspace.reportFields.addField')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            </View>
        );
    };

    const getCustomListHeader = () => {
        return (
            <CustomListHeader
                canSelectMultiple={canSelectMultiple}
                leftHeaderText={translate('common.name')}
                rightHeaderText={translate('common.type')}
            />
        );
    };

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {!hasSyncError && isConnectionVerified ? (
                <Text>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{`${translate('workspace.reportFields.importedFromAccountingSoftware')} `}</Text>
                    <TextLink
                        style={[styles.textNormal, styles.link]}
                        href={`${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}`}
                    >
                        {`${currentConnectionName} ${translate('workspace.accounting.settings')}`}
                    </TextLink>
                    <Text style={[styles.textNormal, styles.colorMuted]}>.</Text>
                </Text>
            ) : (
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.reportFields.subtitle')}</Text>
            )}
        </View>
    );
    const selectionModeHeader = selectionMode?.isEnabled && shouldUseNarrowLayout;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={WorkspaceReportFieldsPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={!selectionModeHeader ? Pencil : undefined}
                    shouldUseHeadlineHeader={!selectionModeHeader}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.reportFields')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (selectionModeHeader) {
                            setSelectedReportFields([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        goBackFromWorkspaceCentralScreen(policyID);
                    }}
                >
                    {!shouldUseNarrowLayout && !hasReportAccountingConnections && getHeaderButtons()}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{!hasReportAccountingConnections && getHeaderButtons()}</View>}
                <ConfirmModal
                    isVisible={deleteReportFieldsConfirmModalVisible}
                    onConfirm={handleDeleteReportFields}
                    onCancel={() => setDeleteReportFieldsConfirmModalVisible(false)}
                    title={translate(selectedReportFields.length === 1 ? 'workspace.reportFields.delete' : 'workspace.reportFields.deleteFields')}
                    prompt={translate(selectedReportFields.length === 1 ? 'workspace.reportFields.deleteConfirmation' : 'workspace.reportFields.deleteFieldsConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                {(!shouldUseNarrowLayout || !hasVisibleReportField || isLoading) && getHeaderText()}
                {!shouldShowEmptyState && !isLoading && shouldUseNarrowLayout && getHeaderText()}
                {reportFieldsSections.length > CONST.SEARCH_ITEM_LIMIT && (
                    <SearchBar
                        label={translate('workspace.reportFields.findReportField')}
                        inputValue={inputValue}
                        onChangeText={setInputValue}
                        shouldShowEmptyState={!shouldShowEmptyState && filteredReportFields.length === 0}
                    />
                )}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        color={theme.spinner}
                    />
                )}
                {shouldShowEmptyState && filteredReportFields.length === 0 && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
                        <EmptyStateComponent
                            title={translate('workspace.reportFields.emptyReportFields.title')}
                            subtitle={translate('workspace.reportFields.emptyReportFields.subtitle')}
                            SkeletonComponent={TableListItemSkeleton}
                            headerMediaType={CONST.EMPTY_STATE_MEDIA.ANIMATION}
                            headerMedia={LottieAnimations.GenericEmptyState}
                            headerStyles={[styles.emptyStateCardIllustrationContainer, styles.emptyFolderBG]}
                            lottieWebViewStyles={styles.emptyStateFolderWebStyles}
                            headerContentStyles={styles.emptyStateFolderWebStyles}
                        />
                    </ScrollView>
                )}
                {!shouldShowEmptyState && !isLoading && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={!hasReportAccountingConnections}
                        onTurnOnSelectionMode={(item) => item && updateSelectedReportFields(item)}
                        sections={[
                            {
                                data: filteredReportFields,
                                isDisabled: !policy,
                            },
                        ]}
                        onCheckboxPress={updateSelectedReportFields}
                        onSelectRow={navigateToReportFieldsSettings}
                        onSelectAll={toggleAllReportFields}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        listHeaderContent={shouldUseNarrowLayout ? getHeaderText() : null}
                        shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                        addBottomSafeAreaPadding
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceReportFieldsPage.displayName = 'WorkspaceReportFieldsPage';

export default WorkspaceReportFieldsPage;
