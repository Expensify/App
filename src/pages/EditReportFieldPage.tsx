import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmModal from '@components/ConfirmModal';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isSearchTopmostCentralPane from '@libs/Navigation/isSearchTopmostCentralPane';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActions from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import EditReportFieldDate from './EditReportFieldDate';
import EditReportFieldDropdown from './EditReportFieldDropdown';
import EditReportFieldText from './EditReportFieldText';

type EditReportFieldPageOnyxProps = {
    /** The report object for the expense report */
    report: OnyxEntry<Report>;

    /** Policy to which the report belongs to */
    policy: OnyxEntry<Policy>;
};

type EditReportFieldPageProps = EditReportFieldPageOnyxProps & {
    /** Route from navigation */
    route: {
        /** Params from the route */
        params: {
            /** Which field we are editing */
            fieldID: string;

            /** reportID for the expense report */
            reportID: string;

            /** policyID for the expense report */
            policyID: string;
        };
    };
};

function EditReportFieldPage({route, policy, report}: EditReportFieldPageProps) {
    const {windowWidth} = useWindowDimensions();
    const styles = useThemeStyles();
    const fieldKey = ReportUtils.getReportFieldKey(route.params.fieldID);
    const reportField = report?.fieldList?.[fieldKey] ?? policy?.fieldList?.[fieldKey];
    const policyField = policy?.fieldList?.[fieldKey] ?? reportField;
    const isDisabled = ReportUtils.isReportFieldDisabled(report, reportField, policy);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const {translate} = useLocalize();
    const isReportFieldTitle = ReportUtils.isReportFieldOfTypeTitle(reportField);
    const reportFieldsEnabled = (ReportUtils.isPaidGroupPolicyExpenseReport(report) && !!policy?.areReportFieldsEnabled) || isReportFieldTitle;

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

    const handleReportFieldChange = (form: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELDS_EDIT_FORM>) => {
        const value = form[fieldKey];
        if (isReportFieldTitle) {
            ReportActions.updateReportName(report.reportID, value, report.reportName ?? '');
            Navigation.goBack();
        } else {
            ReportActions.updateReportField(report.reportID, {...reportField, value: value === '' ? null : value}, reportField);
            Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : report?.reportID);
        }
    };

    const handleReportFieldDelete = () => {
        ReportActions.deleteReportField(report.reportID, reportField);
        setIsDeleteModalVisible(false);
        Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : report?.reportID);
    };

    const fieldValue = isReportFieldTitle ? report.reportName ?? '' : reportField.value ?? reportField.defaultValue;

    const menuItems: PopoverMenuItem[] = [];

    const isReportFieldDeletable = reportField.deletable && !isReportFieldTitle;

    if (isReportFieldDeletable) {
        menuItems.push({icon: Expensicons.Trashcan, text: translate('common.delete'), onSelected: () => setIsDeleteModalVisible(true), shouldCallAfterModalHide: true});
    }

    const fieldName = Str.UCFirst(reportField.name);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={EditReportFieldPage.displayName}
        >
            <HeaderWithBackButton
                title={fieldName}
                threeDotsMenuItems={menuItems}
                shouldShowThreeDotsButton={!!menuItems?.length}
                threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
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

            {(reportField.type === 'text' || isReportFieldTitle) && (
                <EditReportFieldText
                    fieldName={Str.UCFirst(reportField.name)}
                    fieldKey={fieldKey}
                    fieldValue={fieldValue}
                    isRequired={!isReportFieldDeletable}
                    onSubmit={handleReportFieldChange}
                />
            )}

            {reportField.type === 'date' && (
                <EditReportFieldDate
                    fieldName={Str.UCFirst(reportField.name)}
                    fieldKey={fieldKey}
                    fieldValue={fieldValue}
                    isRequired={!reportField.deletable}
                    onSubmit={handleReportFieldChange}
                />
            )}

            {reportField.type === 'dropdown' && (
                <EditReportFieldDropdown
                    policyID={report.policyID ?? '-1'}
                    fieldKey={fieldKey}
                    fieldValue={fieldValue}
                    fieldOptions={policyField.values.filter((_value: string, index: number) => !policyField.disabledOptions[index])}
                    onSubmit={handleReportFieldChange}
                />
            )}
        </ScreenWrapper>
    );
}

EditReportFieldPage.displayName = 'EditReportFieldPage';

export default withOnyx<EditReportFieldPageProps, EditReportFieldPageOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
})(EditReportFieldPage);
