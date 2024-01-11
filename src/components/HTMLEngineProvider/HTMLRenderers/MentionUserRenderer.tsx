import isEmpty from 'lodash/isEmpty';
import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import {usePersonalDetails} from '@components/OnyxProvider';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type HtmlRendererProps from './types';

type MentionUserRendererProps = WithCurrentUserPersonalDetailsProps & HtmlRendererProps;

function MentionUserRenderer(props: MentionUserRendererProps) {
    const {TDefaultRenderer, style, tnode, currentUserPersonalDetails} = props;
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const defaultRendererProps = {TDefaultRenderer, style, ...props};
    const htmlAttribAccountID = tnode.attributes.accountid;
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;

    let accountID: number;
    let displayNameOrLogin: string;
    let navigationRoute: Route;

    if (!isEmpty(htmlAttribAccountID)) {
        const user = personalDetails.htmlAttribAccountID;
        accountID = parseInt(htmlAttribAccountID, 10);
        displayNameOrLogin = LocalePhoneNumber.formatPhoneNumber(user?.login ?? '') ?? user?.displayName ?? '' ?? translate('common.hidden');
        navigationRoute = ROUTES.PROFILE.getRoute(htmlAttribAccountID);
    } else if (!isEmpty(tnode.data)) {
        // We need to remove the LTR unicode and leading @ from data as it is not part of the login
        displayNameOrLogin = tnode.data.replace(CONST.UNICODE.LTR, '').slice(1);

        accountID = PersonalDetailsUtils.getAccountIDsByLogins([displayNameOrLogin]).slice(0)?.[0];
        navigationRoute = ROUTES.DETAILS.getRoute(displayNameOrLogin);
    } else {
        // If neither an account ID or email is provided, don't render anything
        return null;
    }

    const isOurMention = accountID === currentUserPersonalDetails.accountID;

    const styleWithoutColor: StyleProp<TextStyle> =
        typeof style === 'object'
            ? {
                  ...style,
                  color: undefined,
              }
            : {};

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, action, checkIfContextMenuActive}) => (
                <Text
                    suppressHighlighting
                    onLongPress={(event) => showContextMenuForReport(event, anchor, report.reportID, action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report))}
                    onPress={(event) => {
                        event.preventDefault();
                        Navigation.navigate(navigationRoute);
                    }}
                    role={CONST.ROLE.LINK}
                    accessibilityLabel={`/${navigationRoute}`}
                >
                    <UserDetailsTooltip
                        accountID={accountID}
                        fallbackUserDetails={{
                            displayName: displayNameOrLogin,
                        }}
                    >
                        <Text
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...defaultRendererProps}
                            style={[styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isOurMention) as StyleProp<TextStyle>, {color: StyleUtils.getMentionTextColor(isOurMention)}]}
                            role={CONST.ROLE.LINK}
                            testID="span"
                            href={`/${navigationRoute}`}
                        >
                            {htmlAttribAccountID !== null ? `@${displayNameOrLogin}` : <TNodeChildrenRenderer tnode={props.tnode} />}
                        </Text>
                    </UserDetailsTooltip>
                </Text>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
