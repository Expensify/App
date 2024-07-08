import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import ListItemRightCaretWithLabel from '@components/SelectionList/ListItemRightCaretWithLabel';
import TableListItem from '@components/SelectionList/TableListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import WorkspaceEmptyStateSection from '@components/WorkspaceEmptyStateSection';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as ReportUtils from '@libs/ReportUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyReportField} from '@src/types/onyx/Policy';

type ReportFieldForList = ListItem & {
    value: string;
    fieldID: string;
    orderWeight?: number;
};

type WorkspaceReportFieldsPageProps = StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS>;

function WorkspaceReportFieldsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceReportFieldsPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isFocused = useIsFocused();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const filteredPolicyFieldList = useMemo(() => {
        if (!policy?.fieldList) {
            return {};
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return Object.fromEntries(Object.entries(policy.fieldList).filter(([_, value]) => value.fieldID !== 'text_title'));
    }, [policy]);
    const [selectedReportFields, setSelectedReportFields] = useState<PolicyReportField[]>([]);

    useEffect(() => {
        if (isFocused) {
            return;
        }
        setSelectedReportFields([]);
    }, [isFocused]);

    const reportFieldsList = useMemo<ReportFieldForList[]>(() => {
        if (!policy) {
            return [];
        }
        return Object.values(filteredPolicyFieldList).map((reportField) => ({
            value: reportField.name,
            fieldID: reportField.fieldID,
            keyForList: String(reportField.orderWeight),
            orderWeight: reportField.orderWeight,
            pendingAction: reportField.pendingAction,
            isSelected: selectedReportFields.find((selectedReportField) => selectedReportField.name === reportField.name) !== undefined,
            text: reportField.name,
            rightElement: (
                <ListItemRightCaretWithLabel
                    shouldShowCaret={false}
                    labelText={Str.recapitalize(reportField.type)}
                />
            ),
        }));
    }, [filteredPolicyFieldList, policy, selectedReportFields]);

    const updateSelectedReportFields = (item: ReportFieldForList) => {
        const fieldKey = ReportUtils.getReportFieldKey(item.fieldID);
        const updatedReportFields = selectedReportFields.find((selectedReportField) => selectedReportField.name === item.value)
            ? selectedReportFields.filter((selectedReportField) => selectedReportField.name !== item.value)
            : [...selectedReportFields, filteredPolicyFieldList[fieldKey]];
        setSelectedReportFields(updatedReportFields);
    };

    const navigateToReportFieldSettings = (reportField: ReportFieldForList) => {
        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_SETTINGS.getRoute(policyID, reportField.fieldID));
    };

    const isLoading = reportFieldsList === undefined;
    const shouldShowEmptyState = Object.values(filteredPolicyFieldList).length <= 0 && !isLoading;

    const getHeaderButtons = () => (
        <View style={[styles.w100, styles.flexRow, styles.gap2, isSmallScreenWidth && styles.mb3]}>
            <Button
                medium
                success
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID))}
                icon={Expensicons.Plus}
                text={translate('workspace.reportFields.addField')}
                style={isSmallScreenWidth && styles.flex1}
            />
        </View>
    );

    const getCustomListHeader = () => (
        <View style={[styles.flex1, styles.flexRow, styles.justifyContentBetween, styles.pl3]}>
            <Text style={styles.searchInputStyle}>{translate('common.name')}</Text>
            <Text style={[styles.searchInputStyle, styles.textAlignCenter]}>{translate('common.type')}</Text>
        </View>
    );

    const getHeaderText = () => (
        <View style={[styles.ph5, styles.pb5, styles.pt3]}>
            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.reportFields.subtitle')}</Text>
        </View>
    );

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
                    icon={Illustrations.Pencil}
                    title={translate('workspace.common.reportFields')}
                    shouldShowBackButton={isSmallScreenWidth}
                >
                    {!isSmallScreenWidth && getHeaderButtons()}
                </HeaderWithBackButton>
                {isSmallScreenWidth && <View style={[styles.pl5, styles.pr5]}>{getHeaderButtons()}</View>}
                {(!isSmallScreenWidth || reportFieldsList.length === 0 || isLoading) && getHeaderText()}
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        color={theme.spinner}
                    />
                )}
                {shouldShowEmptyState && (
                    <WorkspaceEmptyStateSection
                        title={translate('workspace.reportFields.emptyReportFields.title')}
                        icon={Illustrations.EmptyStateExpenses}
                        subtitle={translate('workspace.reportFields.emptyReportFields.subtitle')}
                    />
                )}
                {!shouldShowEmptyState && !isLoading && (
                    <SelectionList
                        canSelectMultiple
                        sections={[{data: reportFieldsList, isDisabled: false}]}
                        onCheckboxPress={updateSelectedReportFields}
                        onSelectRow={navigateToReportFieldSettings}
                        onSelectAll={() => {}}
                        ListItem={TableListItem}
                        customListHeader={getCustomListHeader()}
                        listHeaderContent={isSmallScreenWidth ? getHeaderText() : null}
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
