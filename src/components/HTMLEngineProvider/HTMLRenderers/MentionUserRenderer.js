import React from 'react';
import _ from 'underscore';
import {
    TNodeChildrenRenderer,
} from 'react-native-render-html';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import themeColors from '../../../styles/themes/default';
import Text from '../../Text';
import Tooltip from '../../Tooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withCurrentUserPersonalDetails from '../../withCurrentUserPersonalDetails';
import styles from '../../../styles/styles';

const showUserDetails = email => Navigation.navigate(ROUTES.getDetailsRoute(email));

const MentionUserRenderer = (props) => {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style', 'tnode']);

    // We need to remove the leading @ from data as it is not part of the login
    const loginWhithoutLeadingAt = props.tnode.data.slice(1);

    const isOurMention = loginWhithoutLeadingAt === props.currentUserPersonalDetails.login;
    const backgroundColor = isOurMention ? themeColors.ourMentionBG : themeColors.mentionBG;

    return (
        <Tooltip containerStyles={[styles.dInline]} text={loginWhithoutLeadingAt}>
            <Text
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultRendererProps}
                color={themeColors.textSupporting}
                style={[props.style, {backgroundColor}]}
                onPress={() => showUserDetails(loginWhithoutLeadingAt)}
            >
                <TNodeChildrenRenderer tnode={props.tnode} />
            </Text>
        </Tooltip>
    );
};

MentionUserRenderer.propTypes = htmlRendererPropTypes;
MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
