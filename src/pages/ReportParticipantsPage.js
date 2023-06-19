import React from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import OptionsList from '../components/OptionsList';
import ROUTES from '../ROUTES';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/ReportUtils';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import CONST from '../CONST';
import * as UserUtils from '../libs/UserUtils';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: personalDetailsPropType,

    /** The active report */
    report: reportPropTypes.isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/participants */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
};

function ReportParticipantsPage(props) {
    const participants = ReportUtils.getAllParticipants(props.report, props.personalDetails);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={_.isEmpty(props.report)}>
                    <HeaderWithBackButton
                        title={props.translate(
                            ReportUtils.isChatRoom(props.report) || ReportUtils.isPolicyExpenseChat(props.report) || ReportUtils.isThread(props.report) ? 'common.members' : 'common.details',
                        )}
                    />
                    <View
                        pointerEvents="box-none"
                        style={[styles.containerWithSpaceBetween]}
                    >
                        {Boolean(participants.length) && (
                            <OptionsList
                                sections={[
                                    {
                                        title: '',
                                        data: participants,
                                        shouldShow: true,
                                        indexOffset: 0,
                                    },
                                ]}
                                onSelectRow={(option) => {
                                    Navigation.navigate(ROUTES.getReportParticipantRoute(props.route.params.reportID, option.accountID));
                                }}
                                hideSectionHeaders
                                showTitleTooltip
                                disableFocusOptions
                                boldStyle
                                optionHoveredStyle={styles.hoveredComponentBG}
                                contentContainerStyles={[safeAreaPaddingBottomStyle]}
                            />
                        )}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

ReportParticipantsPage.propTypes = propTypes;
ReportParticipantsPage.defaultProps = defaultProps;
ReportParticipantsPage.displayName = 'ReportParticipantsPage';

export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(ReportParticipantsPage);
