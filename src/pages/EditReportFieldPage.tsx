import {Str} from 'expensify-common';
import React, {useState} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import {useSession} from '@components/OnyxListItemProvider';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {deleteReportField, updateReportField, updateReportName} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {EditRequestNavigatorParamList} from '@libs/Navigation/types';
import {
    getReportFieldKey,
    hasViolations as hasViolationsReportUtils,
    isAdminOwnerApproverOrReportOwner,
    isInvoiceReport,
    isPaidGroupPolicyExpenseReport,
    isReportFieldDisabled,
    isReportFieldOfTypeTitle,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import EditReportFieldDate from './EditReportFieldDate';
import EditReportFieldDropdown from './EditReportFieldDropdown';
import EditReportFieldText from './EditReportFieldText';

type EditReportFieldPageProps = PlatformStackScreenProps<EditRequestNavigatorParamList, typeof SCREENS.EDIT_REQUEST.REPORT_FIELD>;

function EditReportFieldPage({route}: EditReportFieldPageProps) {
    const {backTo, reportID, policyID} = route.params;
    const fieldKey = getReportFieldKey(route.params.fieldID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: false});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const reportField = report?.fieldList?.[fieldKey] ?? policy?.fieldList?.[fieldKey];
    const policyField = policy?.fieldList?.[fieldKey] ?? reportField;
    const isDisabled = isReportFieldDisabled(report, reportField, policy) || !isAdminOwnerApproverOrReportOwner(report, policy);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const {translate} = useLocalize();
    const isReportFieldTitle = isReportFieldOfTypeTitle(reportField);
    const reportFieldsEnabled = ((isPaidGroupPolicyExpenseReport(report) || isInvoiceReport(report)) && !!policy?.areReportFieldsEnabled) || isReportFieldTitle;
    const hasOtherViolations =
        report?.fieldList && Object.entries(report.fieldList).some(([key, field]) => key !== fieldKey && field.value === '' && !isReportFieldDisabled(report, reportField, policy));

    if (!reportFieldsEnabled || !reportField || !policyField || !report || isDisabled) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={EditReportFieldPage.displayName}
            >
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    const goBack = () => {
        if (isReportFieldTitle) {
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
            return;
        }
        Navigation.goBack(backTo);
    };

    const handleReportFieldDelete = () => {
        setIsDeleteModalVisible(false);
        goBack();
        setTimeout(() => {
            deleteReportField(report.reportID, reportField);
        }, CONST.ANIMATED_TRANSITION);
    };

    const fieldValue = isReportFieldTitle ? (report.reportName ?? '') : (reportField.value ?? reportField.defaultValue);

    const handleReportFieldChange = (form: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM>) => {
        const value = form[fieldKey];
        if ((fieldValue ?? '').trim() === value?.trim()) {
            goBack();
            return;
        }

        if (isReportFieldTitle) {
            updateReportName(report.reportID, value, report.reportName ?? '');
            goBack();
        } else {
            if (value !== '') {
                updateReportField(
                    {...report, reportID: report.reportID},
                    {...reportField, value},
                    reportField,
                    policy as unknown as Policy,
                    isASAPSubmitBetaEnabled,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    hasViolations,
                    hasOtherViolations,
                );
            }
            goBack();
        }
    };

    const menuItems: PopoverMenuItem[] = [];

    const isReportFieldDeletable = reportField.deletable && reportField?.fieldID !== CONST.REPORT_FIELD_TITLE_FIELD_ID;

    if (isReportFieldDeletable) {
        menuItems.push({icon: Expensicons.Trashcan, text: translate('common.delete'), onSelected: () => setIsDeleteModalVisible(true), shouldCallAfterModalHide: true});
    }

    const fieldName = Str.UCFirst(reportField.name);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={EditReportFieldPage.displayName}
        >
            <HeaderWithBackButton
                title={fieldName}
                threeDotsMenuItems={menuItems}
                shouldShowThreeDotsButton={!!menuItems?.length}
                onBackButtonPress={goBack}
            />

            <ConfirmModal
                title={translate('workspace.reportFields.delete')}
                isVisible={isDeleteModalVisible}
                onConfirm={handleReportFieldDelete}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('workspace.reportFields.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />

            {(reportField.type === CONST.REPORT_FIELD_TYPES.TEXT || isReportFieldTitle) && (
                <EditReportFieldText
                    fieldName={Str.UCFirst(reportField.name)}
                    fieldKey={fieldKey}
                    fieldValue={fieldValue}
                    isRequired={!isReportFieldDeletable}
                    onSubmit={handleReportFieldChange}
                />
            )}

            {reportField.type === CONST.REPORT_FIELD_TYPES.DATE && (
                <EditReportFieldDate
                    fieldName={Str.UCFirst(reportField.name)}
                    fieldKey={fieldKey}
                    fieldValue={fieldValue}
                    isRequired={!reportField.deletable}
                    onSubmit={handleReportFieldChange}
                />
            )}

            {reportField.type === CONST.REPORT_FIELD_TYPES.LIST && (
                <EditReportFieldDropdown
                    fieldKey={fieldKey}
                    fieldValue={fieldValue}
                    fieldOptions={policyField.values.filter((_value: string, index: number) => !policyField.disabledOptions.at(index))}
                    onSubmit={handleReportFieldChange}
                />
            )}
        </ScreenWrapper>
    );
}

EditReportFieldPage.displayName = 'EditReportFieldPage';

export default EditReportFieldPage;
