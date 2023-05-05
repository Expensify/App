import React from 'react';
import _ from 'underscore';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Text from '../../Text';
import Tooltip from '../../Tooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withCurrentUserPersonalDetails from '../../withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../../pages/personalDetailsPropType';
import * as StyleUtils from '../../../styles/StyleUtils';
import InlineCodeBlock from '../../InlineCodeBlock';
import styles from '../../../styles/styles';

const propTypes = {
    ...htmlRendererPropTypes,

    /* Stores info about currently logged in user */
    currentUserPersonalDetails: personalDetailsPropType.isRequired,
};

/**
 * Navigates to user details screen based on email
 * @param {String} email
 * @returns {void}
 * */
const showUserDetails = email => Navigation.navigate(ROUTES.getDetailsRoute(email));

const MentionUserRenderer = (props) => {
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);

    // We need to remove the leading @ from data as it is not part of the login
    const loginWhithoutLeadingAt = props.tnode.data.slice(1);
    const isOurMention = loginWhithoutLeadingAt === props.currentUserPersonalDetails.login;

    return (
        <Tooltip absolute text={loginWhithoutLeadingAt}>
            <Text onPress={() => showUserDetails(loginWhithoutLeadingAt)}>

                {/* We are using here workaround from CodeRenderer.js in order to apply borderRadius and padding for nested Text */}
                <InlineCodeBlock
                    defaultRendererProps={defaultRendererProps}
                    TDefaultRenderer={props.TDefaultRenderer}
                    boxModelStyle={StyleUtils.getUserMentionStyle(isOurMention)}
                    textStyle={StyleUtils.getUserMentionTextStyle(isOurMention)}
                    codeFirstWordStyle={styles.mentionFirstWordStyle}
                    codeLastWordStyle={styles.mentionLastWordStyle}
                    key={props.key}
                />
            </Text>
        </Tooltip>
    );
};

MentionUserRenderer.propTypes = propTypes;
MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
