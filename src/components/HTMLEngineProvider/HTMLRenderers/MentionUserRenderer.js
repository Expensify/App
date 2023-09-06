import React from 'react';
import _ from 'underscore';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Text from '../../Text';
import UserDetailsTooltip from '../../UserDetailsTooltip';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import withCurrentUserPersonalDetails from '../../withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../../pages/personalDetailsPropType';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import * as PersonalDetailsUtils from '../../../libs/PersonalDetailsUtils';
import compose from '../../../libs/compose';
import TextLink from '../../TextLink';
import ONYXKEYS from '../../../ONYXKEYS';
import useLocalize from '../../../hooks/useLocalize';

const propTypes = {
    ...htmlRendererPropTypes,

    /** Current user personal details */
    currentUserPersonalDetails: personalDetailsPropType.isRequired,

    /** Personal details of all users */
    personalDetails: personalDetailsPropType.isRequired,
};

function MentionUserRenderer(props) {
    const {translate} = useLocalize();
    const defaultRendererProps = _.omit(props, ['TDefaultRenderer', 'style']);
    const htmlAttribAccountID = lodashGet(props.tnode.attributes, 'accountid');

    let accountID;
    let displayNameOrLogin;
    let navigationRoute;

    if (!_.isEmpty(htmlAttribAccountID)) {
        const user = lodashGet(props.personalDetails, htmlAttribAccountID);
        accountID = parseInt(htmlAttribAccountID, 10);
        displayNameOrLogin = lodashGet(user, 'login', '') || lodashGet(user, 'displayName', '');

        if (_.isEmpty(displayNameOrLogin)) {
            displayNameOrLogin = translate('common.hidden');
        } else {
            navigationRoute = ROUTES.getProfileRoute(htmlAttribAccountID);
        }
    } else {
        // We need to remove the leading @ from data as it is not part of the login
        displayNameOrLogin = props.tnode.data ? props.tnode.data.slice(1) : '';

        accountID = _.first(PersonalDetailsUtils.getAccountIDsByLogins([displayNameOrLogin]));
        navigationRoute = ROUTES.getDetailsRoute(displayNameOrLogin);
    }

    const isOurMention = accountID === props.currentUserPersonalDetails.accountID;
    const TextLinkComponent = _.isEmpty(navigationRoute) ? Text : TextLink;

    return (
        <Text>
            <UserDetailsTooltip
                accountID={accountID}
                fallbackUserDetails={{
                    // If there is no navigation route (i.e. user is hidden), empty the displayName here to ensure the tooltip is removed
                    displayName: _.isEmpty(navigationRoute) ? '' : displayNameOrLogin,
                }}
            >
                <TextLinkComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    style={[
                        _.omit(props.style, 'color'),
                        StyleUtils.getMentionStyle(isOurMention),
                        {color: StyleUtils.getMentionTextColor(isOurMention)},
                        _.isEmpty(navigationRoute) && styles.cursorDefault,
                    ]}
                    href={_.isEmpty(navigationRoute) ? undefined : `/${navigationRoute}`}
                    onPress={_.isEmpty(navigationRoute) ? undefined : () => Navigation.navigate(navigationRoute)}
                    // Add testID so it is NOT selected as an anchor tag by SelectionScraper
                    testID="span"
                >
                    {!_.isEmpty(htmlAttribAccountID) ? `@${displayNameOrLogin}` : <TNodeChildrenRenderer tnode={props.tnode} />}
                </TextLinkComponent>
            </UserDetailsTooltip>
        </Text>
    );
}

MentionUserRenderer.propTypes = propTypes;
MentionUserRenderer.displayName = 'MentionUserRenderer';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    }),
)(MentionUserRenderer);
