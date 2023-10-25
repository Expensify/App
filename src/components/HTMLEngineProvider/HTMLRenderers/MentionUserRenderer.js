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
import * as StyleUtils from '../../../styles/StyleUtils';
import * as PersonalDetailsUtils from '../../../libs/PersonalDetailsUtils';
import compose from '../../../libs/compose';
import TextLink from '../../TextLink';
import ONYXKEYS from '../../../ONYXKEYS';
import useLocalize from '../../../hooks/useLocalize';
import CONST from '../../../CONST';
import * as LocalePhoneNumber from '../../../libs/LocalePhoneNumber';

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
        displayNameOrLogin = LocalePhoneNumber.formatPhoneNumber(lodashGet(user, 'login', '')) || lodashGet(user, 'displayName', '') || translate('common.hidden');
        navigationRoute = ROUTES.PROFILE.getRoute(htmlAttribAccountID);
    } else if (!_.isEmpty(props.tnode.data)) {
        // We need to remove the LTR unicode and leading @ from data as it is not part of the login
        displayNameOrLogin = props.tnode.data.replace(CONST.UNICODE.LTR, '').slice(1);

        accountID = _.first(PersonalDetailsUtils.getAccountIDsByLogins([displayNameOrLogin]));
        navigationRoute = ROUTES.DETAILS.getRoute(displayNameOrLogin);
    } else {
        // If neither an account ID or email is provided, don't render anything
        return null;
    }

    const isOurMention = accountID === props.currentUserPersonalDetails.accountID;

    return (
        <Text>
            <UserDetailsTooltip
                accountID={accountID}
                fallbackUserDetails={{
                    displayName: displayNameOrLogin,
                }}
            >
                <TextLink
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    href={`/${navigationRoute}`}
                    style={[_.omit(props.style, 'color'), StyleUtils.getMentionStyle(isOurMention), {color: StyleUtils.getMentionTextColor(isOurMention)}]}
                    onPress={() => Navigation.navigate(navigationRoute)}
                    // Add testID so it is NOT selected as an anchor tag by SelectionScraper
                    testID="span"
                >
                    {!_.isEmpty(htmlAttribAccountID) ? `@${displayNameOrLogin}` : <TNodeChildrenRenderer tnode={props.tnode} />}
                </TextLink>
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
