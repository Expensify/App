import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyReportFields, Report} from '@src/types/onyx';
import EditReportFieldDatePage from './EditReportFieldDatePage';
import EditReportFieldDropdownPage from './EditReportFieldDropdownPage';
import EditReportFieldTextPage from './EditReportFieldTextPage';

type EditReportFieldPageOnyxProps = {
    /** The report object for the expense report */
    report: OnyxEntry<Report>;

    /** Policy report fields */
    policyReportFields: OnyxEntry<PolicyReportFields>;
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

function EditReportFieldPage({route, report, policyReportFields}: EditReportFieldPageProps) {
    const policyReportField = policyReportFields?.[route.params.fieldID];
    const reportFieldValue = report?.reportFields?.[policyReportField?.fieldID ?? ''];

    // Decides whether to allow or disallow editing a money request
    useEffect(() => {}, []);

    if (policyReportField) {
        if (policyReportField.type === 'text' || policyReportField.type === 'formula') {
            return (
                <EditReportFieldTextPage
                    fieldName={policyReportField.name}
                    fieldID={policyReportField.fieldID}
                    fieldValue={reportFieldValue ?? policyReportField.defaultValue}
                    onSubmit={() => {}}
                />
            );
        }

        if (policyReportField.type === 'date') {
            return (
                <EditReportFieldDatePage
                    fieldName={policyReportField.name}
                    fieldID={policyReportField.fieldID}
                    fieldValue={reportFieldValue ?? policyReportField.defaultValue}
                    onSubmit={() => {}}
                />
            );
        }

        if (policyReportField.type === 'dropdown') {
            return (
                <EditReportFieldDropdownPage
                    fieldName={policyReportField.name}
                    fieldValue={reportFieldValue ?? policyReportField.defaultValue}
                    fieldOptions={policyReportField.values}
                    onSubmit={() => {}}
                />
            );
        }
    }

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

EditReportFieldPage.displayName = 'EditReportFieldPage';

export default withOnyx<EditReportFieldPageProps, EditReportFieldPageOnyxProps>({
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    policyReportFields: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY_REPORT_FIELDS}${route.params.policyID}`,
    },
})(EditReportFieldPage);
