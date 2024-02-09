import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import withReportOrNotFound from '@pages/home/report/withReportOrNotFound';
import reportPropTypes from '@pages/reportPropTypes';
import {policyDefaultProps, policyPropTypes} from '@pages/workspace/withPolicy';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
    ...policyPropTypes,

    /** The report for which we are setting write capability */
    report: reportPropTypes.isRequired,
};

const defaultProps = {
    ...policyDefaultProps,
};

function WriteCapabilityPage(props) {
    const writeCapabilityOptions = _.map(CONST.REPORT.WRITE_CAPABILITIES, (value) => ({
        value,
        text: props.translate(`writeCapabilityPage.writeCapability.${value}`),
        keyForList: value,
        isSelected: value === (props.report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL),
    }));

    const isAbleToEdit = ReportUtils.canEditWriteCapability(props.report, props.policy);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={WriteCapabilityPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton
                    title={props.translate('writeCapabilityPage.label')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(props.report.reportID))}
                />
                <SelectionList
                    sections={[{data: writeCapabilityOptions}]}
                    onSelectRow={(option) => Report.updateWriteCapabilityAndNavigate(props.report, option.value)}
                    initiallyFocusedOptionKey={_.find(writeCapabilityOptions, (locale) => locale.isSelected).keyForList}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WriteCapabilityPage.displayName = 'WriteCapabilityPage';
WriteCapabilityPage.propTypes = propTypes;
WriteCapabilityPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withReportOrNotFound(),
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
    }),
)(WriteCapabilityPage);
