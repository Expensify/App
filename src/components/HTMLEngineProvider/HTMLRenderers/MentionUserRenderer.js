import React from 'react';
import _ from 'underscore';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Text from '../../Text';
import UserDetailsTooltip from '../../UserDetailsTooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withCurrentUserPersonalDetails from '../../withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../../pages/personalDetailsPropType';
import * as StyleUtils from '../../../styles/StyleUtils';
import * as PersonalDetailsUtils from '../../../libs/PersonalDetailsUtils';
import TextLink from '../../TextLink';

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

function MentionUserRenderer(props) {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);

    // We need to remove the leading @ from data as it is not part of the login
    const loginWithoutLeadingAt = props.tnode.data.slice(1);

    const accountID = _.first(PersonalDetailsUtils.getAccountIDsByLogins([loginWithoutLeadingAt]));

    const isOurMention = loginWithoutLeadingAt === props.currentUserPersonalDetails.login;

    return (
        <Text>
            <UserDetailsTooltip
                accountID={accountID}
                fallbackUserDetails={{
                    displayName: loginWithoutLeadingAt,
                }}
            >
                <TextLink
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    href={ROUTES.getDetailsRoute(loginWithoutLeadingAt)}
                    style={[_.omit(props.style, 'color'), StyleUtils.getMentionStyle(isOurMention), {color: StyleUtils.getMentionTextColor(isOurMention)}]}
                    onPress={() => showUserDetails(loginWithoutLeadingAt)}
                    // Add testID so it is NOT selected as an anchor tag by SelectionScraper
                    testID="span"
                >
                    <TNodeChildrenRenderer tnode={props.tnode} />
                </TextLink>
            </UserDetailsTooltip>
        </Text>
    );
}

MentionUserRenderer.propTypes = propTypes;
MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
