import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import reportPropTypes from '../pages/reportPropTypes';
import participantPropTypes from './participantPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import SubscriptAvatar from './SubscriptAvatar';
import * as ReportUtils from '../libs/ReportUtils';
import Avatar from './Avatar';
import DisplayNames from './DisplayNames';
import compose from '../libs/compose';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import Text from './Text';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** The size of the avatar */
    size: PropTypes.oneOf(_.values(CONST.AVATAR_SIZE)),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    policies: {},
    report: null,
    size: CONST.AVATAR_SIZE.DEFAULT,
};

const AvatarWithDisplayName = (props) => {
    const title = ReportUtils.getDisplayNameForParticipant(props.report.ownerEmail, true);
    const subtitle = ReportUtils.getChatRoomSubtitle(props.report, props.policies);
    const isExpenseReport = ReportUtils.isExpenseReport(props.report);
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policies);
    const ownerPersonalDetails = OptionsListUtils.getPersonalDetailsForLogins([props.report.ownerEmail], props.personalDetails);
    const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(ownerPersonalDetails, false);
    return (
        <View style={[styles.appContentHeaderTitle, styles.flex1]}>
            {Boolean(props.report && title) && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    {isExpenseReport ? (
                        <SubscriptAvatar
                            mainAvatar={icons[0]}
                            secondaryAvatar={icons[1]}
                            mainTooltip={props.report.ownerEmail}
                            secondaryTooltip={subtitle}
                            size={props.size}
                        />
                    ) : (
                        <Avatar
                            size={props.size}
                            source={icons[0].source}
                            type={icons[0].type}
                            name={icons[0].name}
                            containerStyles={props.size === CONST.AVATAR_SIZE.SMALL ? styles.emptyAvatarSmall : styles.emptyAvatar}
                        />
                    )}
                    <View style={[styles.flex1, styles.flexColumn, styles.ml3]}>
                        <DisplayNames
                            fullTitle={title}
                            displayNamesWithTooltips={displayNamesWithTooltips}
                            tooltipEnabled
                            numberOfLines={1}
                            textStyles={[styles.headerText, styles.pre]}
                            shouldUseFullTitle={isExpenseReport}
                        />
                        {!_.isEmpty(subtitle) && (
                            <Text
                                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.pre]}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};
AvatarWithDisplayName.propTypes = propTypes;
AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';
AvatarWithDisplayName.defaultProps = defaultProps;

export default compose(withWindowDimensions, withLocalize)(AvatarWithDisplayName);
