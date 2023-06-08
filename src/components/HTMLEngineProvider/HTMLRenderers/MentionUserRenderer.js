import React from 'react';
import _ from 'underscore';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Text from '../../Text';
import Tooltip from '../../Tooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withCurrentUserPersonalDetails from '../../withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../../pages/personalDetailsPropType';
import * as StyleUtils from '../../../styles/StyleUtils';
import TextLink from "../../TextLink";

const propTypes = {
    ...htmlRendererPropTypes,

    /**
     * Current user personal details
     */
    currentUserPersonalDetails: personalDetailsPropType.isRequired,
};

/**
 * Navigates to user details screen based on email
 * @param {String} email
 * @returns {void}
 * */
const showUserDetails = (email) => Navigation.navigate(ROUTES.getDetailsRoute(email));

const MentionUserRenderer = (props) => {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);

    // We need to remove the leading @ from data as it is not part of the login
    const loginWithoutLeadingAt = props.tnode.data.slice(1);

    const isOurMention = loginWithoutLeadingAt === props.currentUserPersonalDetails.login;

    return (
        <Text>
            <Tooltip text={loginWithoutLeadingAt}>
                <TextLink
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    href={ROUTES.getDetailsRoute(loginWithoutLeadingAt)}
                    color={StyleUtils.getMentionTextColor(isOurMention)}
                    style={[_.omit(props.style, 'color'), StyleUtils.getMentionStyle(isOurMention)]}
                    onPress={() => showUserDetails(loginWithoutLeadingAt)}
                >
                    <TNodeChildrenRenderer tnode={props.tnode} />
                </TextLink>
            </Tooltip>
        </Text>
    );
};

MentionUserRenderer.propTypes = propTypes;
MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
