import lodashGet from 'lodash/get';
import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import reportActionPropTypes from './reportActionPropTypes';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
import personalDetailsPropType from '../../personalDetailsPropType';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import {withPersonalDetails} from '../../../components/OnyxProvider';
import Tooltip from '../../../components/Tooltip';
import ControlSelection from '../../../libs/ControlSelection';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** All of the personalDetails */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Styles for the outermost View */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    /** Show header for action */
    showHeader: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    wrapperStyles: [styles.chatItem],
    showHeader: true,
};

const showUserDetails = (email) => {
    Navigation.navigate(ROUTES.getDetailsRoute(email));
};

const ReportActionItemSingle = (props) => {
    const {avatar, displayName, login, pendingFields} = props.personalDetails[props.action.actorEmail] || {};
    const avatarUrl = props.action.automatic
        ? CONST.CONCIERGE_ICON_URL

        // Use avatar in personalDetails if we have one then fallback to avatar provided by the action
        : (avatar || props.action.avatar);

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = displayName
        ? [{type: 'TEXT', text: Str.isSMSLogin(login) ? props.toLocalPhone(displayName) : displayName}]
        : props.action.person;

    return (
        <View style={props.wrapperStyles}>
            <Pressable
                style={styles.alignSelfStart}
                onPressIn={ControlSelection.block}
                onPressOut={ControlSelection.unblock}
                onPress={() => showUserDetails(props.action.actorEmail)}
            >
                <Tooltip text={props.action.actorEmail}>
                    <OfflineWithFeedback
                        pendingAction={lodashGet(pendingFields, 'avatar', null)}
                    >
                        <Avatar
                            containerStyles={[styles.actionAvatar]}
                            source={avatarUrl}
                        />
                    </OfflineWithFeedback>
                </Tooltip>
            </Pressable>
            <View style={[styles.chatItemRight]}>
                {props.showHeader ? (
                    <View style={[styles.chatItemMessageHeader]}>
                        <Pressable
                            style={[styles.flexShrink1]}
                            onPressIn={ControlSelection.block}
                            onPressOut={ControlSelection.unblock}
                            onPress={() => showUserDetails(props.action.actorEmail)}
                        >
                            {_.map(personArray, (fragment, index) => (
                                <ReportActionItemFragment
                                    key={`person-${props.action.reportActionID}-${index}`}
                                    fragment={fragment}
                                    tooltipText={props.action.actorEmail}
                                    isAttachment={props.action.isAttachment}
                                    isLoading={props.action.isLoading}
                                    isSingleLine
                                />
                            ))}
                        </Pressable>
                        <ReportActionItemDate created={props.action.created} />
                    </View>
                ) : null}
                {props.children}
            </View>
        </View>
    );
};

ReportActionItemSingle.propTypes = propTypes;
ReportActionItemSingle.defaultProps = defaultProps;
ReportActionItemSingle.displayName = 'ReportActionItemSingle';

export default compose(
    withLocalize,
    withPersonalDetails(),
)(ReportActionItemSingle);
