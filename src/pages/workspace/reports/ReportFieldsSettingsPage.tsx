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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {getReportFieldInitialValue, getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import {deleteReportFields} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldsSettingsPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.REPORT_FIELDS_SETTINGS>;

function ReportFieldsSettingsPage({
    policy,
    route: {
        params: {policyID, reportFieldID},
    },
}: ReportFieldsSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const reportFieldKey = getReportFieldKey(reportFieldID);
    const reportField = policy?.fieldList?.[reportFieldKey] ?? null;

    if (!reportField) {
        return <NotFoundPage />;
    }

    const isDateFieldType = reportField.type === CONST.REPORT_FIELD_TYPES.DATE;
    const isListFieldType = reportField.type === CONST.REPORT_FIELD_TYPES.LIST;
    const isListFieldEmpty = isListFieldType && reportField.disabledOptions.filter((disabledListValue) => !disabledListValue).length <= 0;
    const listValues = Object.values(policy?.fieldList?.[reportFieldKey]?.values ?? {})?.sort(localeCompare);

    const deleteReportFieldAndHideModal = () => {
        deleteReportFields({policy, reportFieldsToUpdate: [reportFieldKey]});
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
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="ReportFieldsSettingsPage"
            >
                <HeaderWithBackButton
                    title={reportField.name}
                    shouldSetModalVisibility={false}
                />
                <ConfirmModal
                    title={translate('workspace.reportFields.delete')}
                    isVisible={isDeleteModalVisible && !hasAccountingConnections}
                    onConfirm={deleteReportFieldAndHideModal}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    shouldSetModalVisibility={false}
                    prompt={translate('workspace.reportFields.deleteConfirmation')}
                    confirmText={translate('common.delete')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <View style={styles.flexGrow1}>
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
                        title={Str.recapitalize(translate(getReportFieldTypeTranslationKey(reportField.type)))}
                        description={translate('common.type')}
                        interactive={false}
                    />
                    {isListFieldType && (
                        <MenuItemWithTopDescription
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            description={translate('workspace.reportFields.listValues')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_LIST_VALUES.getRoute(policyID, reportFieldID))}
                            title={listValues.join(', ')}
                            numberOfLinesTitle={5}
                        />
                    )}
                    {!isListFieldEmpty && (
                        <MenuItemWithTopDescription
                            style={[styles.moneyRequestMenuItem]}
                            titleStyle={styles.flex1}
                            title={getReportFieldInitialValue(reportField, translate)}
                            description={translate('common.initialValue')}
                            shouldShowRightIcon={!isDateFieldType}
                            interactive={!isDateFieldType}
                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE.getRoute(policyID, reportFieldID))}
                        />
                    )}
                    {!hasAccountingConnections && (
                        <View style={styles.flexGrow1}>
                            <MenuItem
                                icon={Expensicons.Trashcan}
                                title={translate('common.delete')}
                                onPress={() => setIsDeleteModalVisible(true)}
                            />
                        </View>
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(ReportFieldsSettingsPage);
