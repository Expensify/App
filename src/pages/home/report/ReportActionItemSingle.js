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

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** All of the personalDetails */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Styles for the outermost View */
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    wrapperStyles: [styles.chatItem],
};

const showUserDetails = (email) => {
    Navigation.navigate(ROUTES.getDetailsRoute(email));
};

const ReportActionItemSingle = (props) => {
    const {avatar, displayName, login} = props.personalDetails[props.action.actorEmail] || {};
    const avatarUrl = props.action.automatic
        ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`

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
            <Pressable style={styles.alignSelfStart} onPress={() => showUserDetails(props.action.actorEmail)}>
                <Avatar
                    imageStyles={[styles.actionAvatar]}
                    source={avatarUrl}
                />
            </Pressable>
            <View style={[styles.chatItemRight]}>
                <View style={[styles.chatItemMessageHeader]}>
                    <Pressable style={[styles.flexShrink1]} onPress={() => showUserDetails(props.action.actorEmail)}>
                        {_.map(personArray, (fragment, index) => (
                            <ReportActionItemFragment
                                key={`person-${props.action.sequenceNumber}-${index}`}
                                fragment={fragment}
                                tooltipText={props.action.actorEmail}
                                isAttachment={props.action.isAttachment}
                                isLoading={props.action.loading}
                                isSingleLine
                            />
                        ))}
                    </Pressable>
                    <ReportActionItemDate timestamp={props.action.timestamp} />
                </View>
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
