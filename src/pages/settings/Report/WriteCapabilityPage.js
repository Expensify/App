import React from 'react';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import OptionsList from '../../../components/OptionsList';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import * as Report from '../../../libs/actions/Report';
import * as Expensicons from '../../../components/Icon/Expensicons';
import themeColors from '../../../styles/themes/default';
import * as ReportUtils from '../../../libs/ReportUtils';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import * as PolicyUtils from '../../../libs/PolicyUtils';
import {policyPropTypes, policyDefaultProps} from '../../workspace/withPolicy';

const propTypes = {
    ...withLocalizePropTypes,
    ...policyPropTypes,

    /** The report for which we are setting write capability */
    report: reportPropTypes.isRequired,
};

const defaultProps = {
    ...policyDefaultProps,
};

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

function WriteCapabilityPage(props) {
    const writeCapabilityOptions = _.map(CONST.REPORT.WRITE_CAPABILITIES, (value) => ({
        value,
        text: props.translate(`writeCapabilityPage.writeCapability.${value}`),
        keyForList: value,

        // Include the green checkmark icon to indicate the currently selected value
        customIcon: value === (props.report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL) ? greenCheckmark : null,

        // This property will make the currently selected value have bold text
        boldStyle: value === (props.report.writeCapability || CONST.REPORT.WRITE_CAPABILITIES.ALL),
    }));

    const isAbleToEdit = !ReportUtils.isAdminRoom(props.report) && PolicyUtils.isPolicyAdmin(props.policy) && !ReportUtils.isArchivedRoom(props.report);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <FullPageNotFoundView shouldShow={!isAbleToEdit}>
                <HeaderWithBackButton
                    title={props.translate('writeCapabilityPage.label')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(ROUTES.getReportSettingsRoute(props.report.reportID))}
                />
                <OptionsList
                    sections={[{data: writeCapabilityOptions}]}
                    onSelectRow={(option) => Report.updateWriteCapabilityAndNavigate(props.report, option.value)}
                    hideSectionHeaders
                    optionHoveredStyle={{
                        ...styles.hoveredComponentBG,
                        ...styles.mhn5,
                        ...styles.ph5,
                    }}
                    shouldHaveOptionSeparator
                    shouldDisableRowInnerPadding
                    contentContainerStyles={[styles.ph5]}
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
