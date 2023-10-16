import React from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import * as Report from '../../../libs/actions/Report';
import * as ReportUtils from '../../../libs/ReportUtils';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import * as PolicyUtils from '../../../libs/PolicyUtils';
import {policyPropTypes, policyDefaultProps} from '../../workspace/withPolicy';
import SelectionList from '../../../components/SelectionList';

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

    const isAbleToEdit = !ReportUtils.isAdminRoom(props.report) && PolicyUtils.isPolicyAdmin(props.policy) && !ReportUtils.isArchivedRoom(props.report);

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
    withReportOrNotFound,
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`,
        },
    }),
)(WriteCapabilityPage);
