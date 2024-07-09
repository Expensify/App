import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as WorkspaceReportFieldUtils from '@libs/WorkspaceReportFieldUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as ReportField from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldSettingsPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELD_SETTINGS>;

function ReportFieldSettingsPage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    const reportField = policy?.fieldList?.[reportFieldKey] ?? null;

    if (!reportField) {
        return <NotFoundPage />;
    }

    const isDateFieldType = reportField.type === CONST.REPORT_FIELD_TYPES.DATE;
    const isListFieldType = reportField.type === CONST.REPORT_FIELD_TYPES.LIST;

    const deleteReportFieldAndHideModal = () => {
        ReportField.deleteReportFields(policyID, [reportFieldKey]);
        setIsDeleteModalVisible(false);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_REPORT_FIELDS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={ReportFieldSettingsPage.displayName}
            >
                <HeaderWithBackButton
                    title={reportField.name}
                    shouldSetModalVisibility={false}
                />
                <MenuItemWithTopDescription
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    title={reportField.name}
                    description={translate('common.name')}
                    interactive={false}
                />
                <MenuItemWithTopDescription
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    title={Str.recapitalize(translate(WorkspaceReportFieldUtils.getReportFieldTypeTranslationKey(reportField.type)))}
                    description={translate('common.type')}
                    interactive={false}
                />
                <MenuItemWithTopDescription
                    style={[styles.moneyRequestMenuItem]}
                    titleStyle={styles.flex1}
                    title={WorkspaceReportFieldUtils.getReportFieldInitialValue(reportField)}
                    description={translate('common.initialValue')}
                    shouldShowRightIcon={!isDateFieldType}
                    interactive={!isDateFieldType}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_REPORT_FIELD_INITIAL_VALUE.getRoute(policyID, reportFieldID))}
                />
                {isListFieldType && (
                    <MenuItemWithTopDescription
                        style={[styles.moneyRequestMenuItem]}
                        titleStyle={styles.flex1}
                        description={translate('workspace.reportFields.listValues')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELD_LIST_VALUES.getRoute(policyID, reportFieldID))}
                    />
                )}
                <View style={styles.flexGrow1}>
                    <MenuItem
                        icon={Expensicons.Trashcan}
                        title={translate('common.delete')}
                        onPress={() => setIsDeleteModalVisible(true)}
                    />
                </View>
                <ConfirmModal
                    title={translate('workspace.reportFields.delete')}
                    isVisible={isDeleteModalVisible}
                    onConfirm={deleteReportFieldAndHideModal}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.reportFields.deleteConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

ReportFieldSettingsPage.displayName = 'ReportFieldSettingsPage';

export default withPolicyAndFullscreenLoading(ReportFieldSettingsPage);
