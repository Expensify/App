import React, {useMemo} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import Navigation from '../libs/Navigation/Navigation';
import ScreenWrapper from '../components/ScreenWrapper';
import ROUTES from '../ROUTES';
import personalDetailsPropType from './personalDetailsPropType';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import * as ReportUtils from '../libs/ReportUtils';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';
import CONST from '../CONST';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import * as Expensicons from '../components/Icon/Expensicons';
import MultipleAvatars from '../components/MultipleAvatars';
import DisplayNames from '../components/DisplayNames';
import MenuItem from '../components/MenuItem';

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

function ReportParticipantsPage(props) {
    const participants = useMemo(() => lodashGet(props.report, 'participantAccountIDs', []), [props.report]);
    const isArchivedRoom = useMemo(() => ReportUtils.isArchivedRoom(props.report), [props.report]);
    const participantAvatars = OptionsListUtils.getAvatarsForAccountIDs(participants, props.personalDetails);
    const displayNamesWithTooltips = useMemo(() => {
        const hasMultipleParticipants = participants.length > 1;
        return ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs(participants, props.personalDetails), hasMultipleParticipants);
    }, [participants, props.personalDetails]);
    const menuItems = useMemo(() => {
        const items = [];

        if (isArchivedRoom) {
            return items;
        }

        if (participants.length) {
            items.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS,
                translationKey: 'common.members',
                icon: Expensicons.Users,
                subtitle: participants.length,
                isAnonymousAction: false,
                action: () => {
                    Navigation.navigate(ROUTES.REPORT_PARTICIPANTS.getRoute(props.report.reportID));
                },
            });
        }

        items.push({
            key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
            translationKey: 'common.settings',
            icon: Expensicons.Gear,
            isAnonymousAction: false,
            action: () => {
                Navigation.navigate(ROUTES.REPORT_SETTINGS.getRoute(props.report.reportID));
            },
        });

        return items;
    }, [props.report, participants, isArchivedRoom]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ReportParticipantsPage.displayName}
        >
            {() => (
                <FullPageNotFoundView shouldShow={_.isEmpty(props.report) || ReportUtils.isArchivedRoom(props.report)}>
                    <HeaderWithBackButton
                        title={props.translate(
                            ReportUtils.isChatRoom(props.report) ||
                                ReportUtils.isPolicyExpenseChat(props.report) ||
                                ReportUtils.isChatThread(props.report) ||
                                ReportUtils.isTaskReport(props.report)
                                ? 'common.members'
                                : 'common.details',
                        )}
                    />
                    <View
                        pointerEvents="box-none"
                        style={[styles.containerWithSpaceBetween]}
                    >
                        {Boolean(participants.length) && (
                            <View>
                                <MultipleAvatars
                                    icons={participantAvatars}
                                    shouldStackHorizontally
                                    size="small"
                                    isHovered={props.isHovered}
                                    shouldUseCardBackground
                                />
                                <View style={[styles.alignSelfCenter, styles.w100, styles.mt1]}>
                                    <DisplayNames
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled
                                        numberOfLines={1}
                                        textStyles={[styles.textHeadline, styles.textAlignCenter, styles.pre]}
                                        shouldUseFullTitle
                                    />
                                </View>
                            </View>
                        )}
                        {_.map(menuItems, (item) => {
                            const brickRoadIndicator =
                                ReportUtils.hasReportNameError(props.report) && item.key === CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
                            return (
                                <MenuItem
                                    key={item.key}
                                    title={props.translate(item.translationKey)}
                                    subtitle={item.subtitle}
                                    icon={item.icon}
                                    onPress={item.action}
                                    isAnonymousAction={item.isAnonymousAction}
                                    shouldShowRightIcon
                                    brickRoadIndicator={brickRoadIndicator || item.brickRoadIndicator}
                                />
                            );
                        })}
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
