import Str from 'expensify-common/lib/str';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {FormOnyxValues} from '@components/Form/types';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as ReportActions from '@src/libs/actions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import EditReportFieldDatePage from './EditReportFieldDatePage';
import EditReportFieldDropdownPage from './EditReportFieldDropdownPage';
import EditReportFieldTextPage from './EditReportFieldTextPage';

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
    const fieldKey = ReportUtils.getReportFieldKey(route.params.fieldID);
    const reportField = report?.fieldList?.[fieldKey] ?? policy?.fieldList?.[fieldKey];
    const isDisabled = ReportUtils.isReportFieldDisabled(report, reportField ?? null, policy);

    if (!reportField || !report || isDisabled) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={EditReportFieldPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow
                    onBackButtonPress={() => {}}
                    onLinkPress={() => {}}
                />
            </ScreenWrapper>
        );
    }

    const isReportFieldTitle = ReportUtils.isReportFieldOfTypeTitle(reportField);

    const handleReportFieldChange = (form: FormOnyxValues<typeof ONYXKEYS.FORMS.REPORT_FIELD_EDIT_FORM>) => {
        const value = form[fieldKey];
        if (isReportFieldTitle) {
            ReportActions.updateReportName(report.reportID, value, report.reportName ?? '');
        } else {
            ReportActions.updateReportField(report.reportID, {...reportField, value: value === '' ? null : value}, reportField);
        }

        Navigation.dismissModal(report?.reportID);
    };

    const fieldValue = isReportFieldTitle ? report.reportName ?? '' : reportField.value ?? reportField.defaultValue;

    if (reportField.type === 'text' || isReportFieldTitle) {
        return (
            <EditReportFieldTextPage
                fieldName={Str.UCFirst(reportField.name)}
                fieldKey={fieldKey}
                fieldValue={fieldValue}
                isRequired={!reportField.deletable}
                onSubmit={handleReportFieldChange}
            />
        );
    }

    if (reportField.type === 'date') {
        return (
            <EditReportFieldDatePage
                fieldName={Str.UCFirst(reportField.name)}
                fieldKey={fieldKey}
                fieldValue={fieldValue}
                isRequired={!reportField.deletable}
                onSubmit={handleReportFieldChange}
            />
        );
    }

    if (reportField.type === 'dropdown') {
        return (
            <EditReportFieldDropdownPage
                policyID={report.policyID ?? ''}
                fieldKey={fieldKey}
                fieldName={Str.UCFirst(reportField.name)}
                fieldValue={fieldValue}
                fieldOptions={reportField.values.filter((_value: string, index: number) => !reportField.disabledOptions[index])}
                onSubmit={handleReportFieldChange}
            />
        );
    }
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
