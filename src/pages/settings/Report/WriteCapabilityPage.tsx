import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from '@pages/home/report/withReportOrNotFound';
import * as ReportActions from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import useLocalize from "@hooks/useLocalize";
import type {Policy, Report} from "@src/types/onyx";

type WriteCapabilityPageOnyxProps = {
    /** The policy object for the current route */
    policy:  OnyxEntry<Policy>;
};

type WriteCapabilityPageProps = WriteCapabilityPageOnyxProps & WithReportOrNotFoundProps & {
    /** The report for which we are setting write capability */
    report: Report,
};


function WriteCapabilityPage({report, policy}: WriteCapabilityPageProps) {
    const {translate} = useLocalize()
    const writeCapabilityOptions = Object.values(CONST.REPORT.WRITE_CAPABILITIES).map((value) => ({
        value,
        text: translate(`writeCapabilityPage.writeCapability.${value}`),
        keyForList: value,
        isSelected: value === (report.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL),
    }));

    const isAbleToEdit = ReportUtils.canEditWriteCapability(report, policy);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WriteCapabilityPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton
                    title={translate('writeCapabilityPage.label')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID))}
                />
                <SelectionList
                    sections={[{data: writeCapabilityOptions}]}
                    onSelectRow={(option) => ReportActions.updateWriteCapabilityAndNavigate(report, option.value)}
                    initiallyFocusedOptionKey={Object.values(writeCapabilityOptions).find((locale) => locale.isSelected)?.keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WriteCapabilityPage.displayName = 'WriteCapabilityPage';

export default compose(
    withReportOrNotFound(),
    withOnyx<WriteCapabilityPageProps, WriteCapabilityPageOnyxProps>({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
    }),
)(WriteCapabilityPage);
