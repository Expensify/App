import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OptionsList from '@components/OptionsList';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import personalDetailsPropType from './personalDetailsPropType';
import reportPropTypes from './reportPropTypes';

const propTypes = {
    /* Onyx Props */

    /** The personal details of the person who is logged in */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

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

/**
 * Returns all the participants in the active report
 *
 * @param {Object} report The active report object
 * @param {Object} personalDetails The personal details of the users
 * @param {Object} translate The localize
 * @return {Array}
 */
const getAllParticipants = (report, personalDetails, translate) =>
    _.chain(ReportUtils.getParticipantsIDs(report))
        .map((accountID, index) => {
            const userPersonalDetail = lodashGet(personalDetails, accountID, {displayName: personalDetails.displayName || translate('common.hidden'), avatar: ''});
            const userLogin = LocalePhoneNumber.formatPhoneNumber(userPersonalDetail.login || '') || translate('common.hidden');
            const displayName = PersonalDetailsUtils.getDisplayNameOrDefault(userPersonalDetail, 'displayName');

            return {
                alternateText: userLogin,
                displayName,
                accountID: userPersonalDetail.accountID,
                icons: [
                    {
                        id: accountID,
                        source: UserUtils.getAvatar(userPersonalDetail.avatar, accountID),
                        name: userLogin,
                        type: CONST.ICON_TYPE_AVATAR,
                    },
                ],
                keyForList: `${index}-${userLogin}`,
                login: userLogin,
                text: displayName,
                tooltipText: userLogin,
                participantsList: [{accountID, displayName}],
            };
        })
        .sortBy((participant) => participant.displayName.toLowerCase())
        .value();

function ReportParticipantsPage(props) {
    const styles = useThemeStyles();
    const participants = _.map(getAllParticipants(props.report, props.personalDetails, props.translate), (participant) => ({
        ...participant,
        isDisabled: ReportUtils.isOptimisticPersonalDetail(participant.accountID),
    }));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ReportParticipantsPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || ReportUtils.isArchivedRoom(props.report)}>
                    <HeaderWithBackButton
                        title={props.translate(
                            ReportUtils.isChatRoom(props.report) ||
                                ReportUtils.isPolicyExpenseChat(props.report) ||
                                ReportUtils.isChatThread(props.report) ||
                                ReportUtils.isTaskReport(props.report) ||
                                ReportUtils.isMoneyRequestReport(props.report)
                                ? 'common.members'
                                : 'common.details',
                        )}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
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
                                    Navigation.navigate(ROUTES.PROFILE.getRoute(option.accountID));
                                }}
                                hideSectionHeaders
                                showTitleTooltip
                                showScrollIndicator
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
    withReportOrNotFound(),
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(ReportParticipantsPage);
