import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import ConfirmModal from '@components/ConfirmModal';
import EmptyStateComponent from '@components/EmptyStateComponent';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import TableListItemSkeleton from '@components/Skeletons/TableRowSkeleton';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useAutoTurnSelectionModeOffWhenHasNoActiveOption from '@hooks/useAutoTurnSelectionModeOffWhenHasNoActiveOption';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import localeCompare from '@libs/LocaleCompare';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as ReportField from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyReportField} from '@src/types/onyx/Policy';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type ReportFieldForList = ListItem & {
    value: string;
    fieldID: string;
    orderWeight?: number;
};

type WorkspaceReportFieldsPageProps = PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS>;

function WorkspaceReportFieldsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceReportFieldsPageProps) {
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const {environmentURL} = useEnvironment();
    const policy = usePolicy(policyID);
    const {selectionMode} = useMobileSelectionMode();
    const filteredPolicyFieldList = useMemo(() => {
        if (!policy?.fieldList) {
            return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Object.fromEntries(Object.entries(policy.fieldList).filter(([_, value]) => value.fieldID !== 'text_title'));
    }, [policy]);
    const [selectedReportFields, setSelectedReportFields] = useState<PolicyReportField[]>([]);
    const [deleteReportFieldsConfirmModalVisible, setDeleteReportFieldsConfirmModalVisible] = useState(false);
    const hasAccountingConnections = PolicyUtils.hasAccountingConnections(policy);
    const isConnectedToAccounting = Object.keys(policy?.connections ?? {}).length > 0;
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);

    const canSelectMultiple = !hasAccountingConnections && (isSmallScreenWidth ? selectionMode?.isEnabled : true);

    const fetchReportFields = useCallback(() => {
        ReportField.openPolicyReportFieldsPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchReportFields});

    const hasVisibleReportField = Object.values(filteredPolicyFieldList).some((reportField) => reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline);

    useFocusEffect(fetchReportFields);

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedReportFields([]);
    }, [isFocused]);

    const reportFieldsSections = useMemo(() => {
        if (!policy) {
            return [{data: [], isDisabled: true}];
        }

        return [
            {
                data: Object.values(filteredPolicyFieldList)
                    .sort((a, b) => localeCompare(a.name, b.name))
                    .map((reportField) => ({
                        value: reportField.name,
                        fieldID: reportField.fieldID,
                        keyForList: String(reportField.fieldID),
                        orderWeight: reportField.orderWeight,
                        pendingAction: reportField.pendingAction,
                        isSelected: selectedReportFields.find((selectedReportField) => selectedReportField.name === reportField.name) !== undefined && canSelectMultiple,
                        isDisabled: reportField.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        text: reportField.name,
                        rightElement: (
                            <ListItemRightCaretWithLabel
                                shouldShowCaret={false}
                                labelText={Str.recapitalize(translate(WorkspaceReportFieldUtils.getReportFieldTypeTranslationKey(reportField.type)))}
                            />
                        ),
                    })),
                isDisabled: false,
            },
        ];
    }, [filteredPolicyFieldList, policy, selectedReportFields, canSelectMultiple, translate]);

    useAutoTurnSelectionModeOffWhenHasNoActiveOption(reportFieldsSections[0].data);

    const updateSelectedReportFields = (item: ReportFieldForList) => {
        const fieldKey = ReportUtils.getReportFieldKey(item.fieldID);
        const updatedReportFields = selectedReportFields.find((selectedReportField) => selectedReportField.name === item.value)
            ? selectedReportFields.filter((selectedReportField) => selectedReportField.name !== item.value)
            : [...selectedReportFields, filteredPolicyFieldList[fieldKey]];
        setSelectedReportFields(updatedReportFields);
    };

    const toggleAllReportFields = () => {
        const availableReportFields = Object.values(filteredPolicyFieldList).filter((reportField) => reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const isAllSelected = availableReportFields.length === selectedReportFields.length;
        setSelectedReportFields(isAllSelected ? [] : availableReportFields);
    };

    const navigateToReportFieldsSettings = (reportField: ReportFieldForList) => {
        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_SETTINGS.getRoute(policyID, reportField.fieldID));
    };

    const handleDeleteReportFields = () => {
        const reportFieldKeys = selectedReportFields.map((selectedReportField) => ReportUtils.getReportFieldKey(selectedReportField.fieldID));
        setSelectedReportFields([]);
        ReportField.deleteReportFields(policyID, reportFieldKeys);
        setDeleteReportFieldsConfirmModalVisible(false);
    };

    const isLoading = !isOffline && policy === undefined;
    const shouldShowEmptyState =
        !Object.values(filteredPolicyFieldList).some((reportField) => reportField.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || isOffline) && !isLoading;

    const getHeaderButtons = () => {
        const options: Array<DropdownOption<DeepValueOf<typeof CONST.POLICY.BULK_ACTION_TYPES>>> = [];

        if (shouldUseNarrowLayout ? canSelectMultiple : selectedReportFields.length > 0) {
            options.push({
                icon: Expensicons.Trashcan,
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
                    icon={Expensicons.Plus}
                    text={translate('workspace.reportFields.addField')}
                    style={[shouldUseNarrowLayout && styles.flex1]}
                />
            </View>
        );
    };

    const getCustomListHeader = () => {
        const header = (
            <View
                style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.justifyContentBetween,
                    // Required padding accounting for the checkbox and the right arrow in multi-select mode
                    canSelectMultiple && styles.pl3,
                ]}
            >
                <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
                <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.type')}</Text>
            </View>
        );
        if (canSelectMultiple) {
            return header;
        }
        return <View style={[styles.flexRow, styles.ph9, styles.pv3, styles.pb5]}>{header}</View>;
    };

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            {isConnectedToAccounting ? (
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
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={WorkspaceReportFieldsPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={!selectionModeHeader ? Illustrations.Pencil : undefined}
                    title={translate(selectionModeHeader ? 'common.selectMultiple' : 'workspace.common.reportFields')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={() => {
                        if (selectionModeHeader) {
                            setSelectedReportFields([]);
                            turnOffMobileSelectionMode();
                            return;
                        }
                        Navigation.goBack();
                    }}
                >
                    {!shouldUseNarrowLayout && !hasAccountingConnections && getHeaderButtons()}
                </HeaderWithBackButton>
                {shouldUseNarrowLayout && <View style={[styles.pl5, styles.pr5]}>{!hasAccountingConnections && getHeaderButtons()}</View>}
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
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        color={theme.spinner}
                    />
                )}
                {shouldShowEmptyState && (
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
                )}
                {!shouldShowEmptyState && !isLoading && (
                    <SelectionListWithModal
                        canSelectMultiple={canSelectMultiple}
                        turnOnSelectionModeOnLongPress={!hasAccountingConnections}
                        onTurnOnSelectionMode={(item) => item && updateSelectedReportFields(item)}
                        sections={reportFieldsSections}
                        onCheckboxPress={updateSelectedReportFields}
                        onSelectRow={navigateToReportFieldsSettings}
                        onSelectAll={toggleAllReportFields}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        listHeaderContent={shouldUseNarrowLayout ? getHeaderText() : null}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
                        showScrollIndicator={false}
                    />
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceReportFieldsPage.displayName = 'WorkspaceReportFieldsPage';

export default WorkspaceReportFieldsPage;
