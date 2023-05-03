import React from 'react';
import _ from 'underscore';
import {
    TNodeChildrenRenderer,
} from 'react-native-render-html';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Text from '../../Text';
import Tooltip from '../../Tooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withCurrentUserPersonalDetails from '../../withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../../pages/personalDetailsPropType';
import * as StyleUtils from '../../../styles/StyleUtils';

/**
 * navigates to user details screen based on email
 * @param {String} email
 * @returns {void}
 * */
const showUserDetails = email => Navigation.navigate(ROUTES.getDetailsRoute(email));

const MentionUserRenderer = (props) => {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);

    // We need to remove the leading @ from data as it is not part of the login
    const loginWhithoutLeadingAt = props.tnode.data.slice(1);

    const isOurMention = loginWhithoutLeadingAt === props.currentUserPersonalDetails.login;

    return (
        <Tooltip absolute text={loginWhithoutLeadingAt}>
            <Text
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                color={StyleUtils.getUserMentionTextColor(isOurMention)}
                style={StyleUtils.getUserMentionStyle(isOurMention)}
                onPress={() => showUserDetails(loginWhithoutLeadingAt)}
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        </Tooltip>
    );
};

MentionUserRenderer.propTypes = {...htmlRendererPropTypes, currentUserPersonalDetails: personalDetailsPropType.isRequired};
MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
