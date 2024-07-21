import {Str} from 'expensify-common';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import {usePersonalDetails} from '@components/OnyxProvider';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import asMutable from '@src/types/utils/asMutable';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type MentionUserRendererProps = WithCurrentUserPersonalDetailsProps & CustomRendererProps<TText | TPhrasing>;

function MentionUserRenderer({style, tnode, TDefaultRenderer, currentUserPersonalDetails, ...defaultRendererProps}: MentionUserRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const htmlAttribAccountID = tnode.attributes.accountid;
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const htmlAttributeAccountID = tnode.attributes.accountid;

    let accountID: number;
    let mentionDisplayText: string;
    let navigationRoute: Route;

    const tnodeClone = cloneDeep(tnode);

    const getShortMentionIfFound = (displayText: string, userAccountID: string, userLogin = '') => {
        // If the userAccountID does not exist, this is an email-based mention so the displayText must be an email.
        // If the userAccountID exists but userLogin is different from displayText, this means the displayText is either user display name, Hidden, or phone number, in which case we should return it as is.
        if (userAccountID && userLogin !== displayText) {
            return displayText;
        }

        // If the emails are not in the same private domain, we also return the displayText
        if (!LoginUtils.areEmailsFromSamePrivateDomain(displayText, currentUserPersonalDetails.login ?? '')) {
            return displayText;
        }

        // Otherwise, the emails must be of the same private domain, so we should remove the domain part
        return displayText.split('@')[0];
    };

    if (!isEmpty(htmlAttribAccountID)) {
        const user = personalDetails[htmlAttribAccountID];
        accountID = parseInt(htmlAttribAccountID, 10);
        mentionDisplayText = LocalePhoneNumber.formatPhoneNumber(user?.login ?? '') || PersonalDetailsUtils.getDisplayNameOrDefault(user);
        mentionDisplayText = getShortMentionIfFound(mentionDisplayText, htmlAttributeAccountID, user?.login ?? '');
        navigationRoute = ROUTES.PROFILE.getRoute(htmlAttribAccountID);
    } else if ('data' in tnodeClone && !isEmptyObject(tnodeClone.data)) {
        // We need to remove the LTR unicode and leading @ from data as it is not part of the login
        mentionDisplayText = tnodeClone.data.replace(CONST.UNICODE.LTR, '').slice(1);
        // We need to replace tnode.data here because we will pass it to TNodeChildrenRenderer below
        asMutable(tnodeClone).data = tnodeClone.data.replace(mentionDisplayText, Str.removeSMSDomain(getShortMentionIfFound(mentionDisplayText, htmlAttributeAccountID)));

        accountID = PersonalDetailsUtils.getAccountIDsByLogins([mentionDisplayText])?.[0];
        navigationRoute = ROUTES.PROFILE.getRoute(accountID, undefined, mentionDisplayText);
        mentionDisplayText = Str.removeSMSDomain(mentionDisplayText);
    } else {
        // If neither an account ID or email is provided, don't render anything
        return null;
    }

    const isOurMention = accountID === currentUserPersonalDetails.accountID;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <ShowContextMenuContext.Consumer>
            {({anchor, report, reportNameValuePairs, action, checkIfContextMenuActive}) => (
                <Text
                    suppressHighlighting
                    onLongPress={(event) =>
                        showContextMenuForReport(event, anchor, report?.reportID ?? '-1', action, checkIfContextMenuActive, ReportUtils.isArchivedRoom(report, reportNameValuePairs))
                    }
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
                            displayName: mentionDisplayText,
                        }}
                    >
                        <Text
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...defaultRendererProps}
                            style={[styles.link, styleWithoutColor, StyleUtils.getMentionStyle(isOurMention), {color: StyleUtils.getMentionTextColor(isOurMention)}]}
                            role={CONST.ROLE.LINK}
                            testID="mention-user"
                            href={`/${navigationRoute}`}
                        >
                            {htmlAttribAccountID ? `@${mentionDisplayText}` : <TNodeChildrenRenderer tnode={tnodeClone} />}
                        </Text>
                    </UserDetailsTooltip>
                </Text>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

MentionUserRenderer.displayName = 'MentionUserRenderer';

export default withCurrentUserPersonalDetails(MentionUserRenderer);
