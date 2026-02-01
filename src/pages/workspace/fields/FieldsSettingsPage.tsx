import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {hasAccountingConnections as hasAccountingConnectionsPolicyUtils} from '@libs/PolicyUtils';
import {getReportFieldKey} from '@libs/ReportUtils';
import {getReportFieldInitialValue, getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {deleteReportFields} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import type {Route as Routes} from '@src/ROUTES';
import type {Policy, PolicyReportField} from '@src/types/onyx';

type FieldsSettingsPageProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    reportFieldID: string;
    featureName: ValueOf<typeof CONST.POLICY.MORE_FEATURES>;
    expectedTarget?: PolicyReportField['target'];
    getListValuesRoute: (policyID: string, reportFieldID: string) => Routes;
    getInitialValueRoute: (policyID: string, reportFieldID: string) => Routes;
    testID: string;
};

function FieldsSettingsPage({policy, policyID, reportFieldID, featureName, expectedTarget, getListValuesRoute, getInitialValueRoute, testID}: FieldsSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const reportFieldKey = getReportFieldKey(reportFieldID);
    const reportField = policy?.fieldList?.[reportFieldKey] ?? null;

    if (!reportField || (expectedTarget && reportField.target !== expectedTarget)) {
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
            featureName={featureName}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID={testID}
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
                            onPress={() => Navigation.navigate(getListValuesRoute(policyID, reportFieldID))}
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
                            onPress={() => Navigation.navigate(getInitialValueRoute(policyID, reportFieldID))}
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

export default FieldsSettingsPage;
