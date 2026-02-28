import {Str} from 'expensify-common';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {ShowContextMenuContext, showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getAccountIDsByLogins, getDisplayNameOrDefault, getShortMentionIfFound} from '@libs/PersonalDetailsUtils';
import {isArchivedNonExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import asMutable from '@src/types/utils/asMutable';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type MentionUserRendererProps = WithCurrentUserPersonalDetailsProps & CustomRendererProps<TText | TPhrasing>;

function MentionUserRenderer({style, tnode, TDefaultRenderer, currentUserPersonalDetails, ...defaultRendererProps}: MentionUserRendererProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {formatPhoneNumber} = useLocalize();
    const htmlAttribAccountID = tnode.attributes.accountid;
    const personalDetails = usePersonalDetails();
    const htmlAttributeAccountID = tnode.attributes.accountid;

    let accountID: number;
    let mentionDisplayText: string;
    let navigationRoute: Route;
    let tnodeClone: typeof tnode | undefined;

    if (!isEmpty(htmlAttribAccountID) && personalDetails?.[htmlAttribAccountID]) {
        const user = personalDetails[htmlAttribAccountID];
        accountID = parseInt(htmlAttribAccountID, 10);
        mentionDisplayText = formatPhoneNumber(user?.login ?? '') || getDisplayNameOrDefault(user);
        mentionDisplayText = getShortMentionIfFound(mentionDisplayText, htmlAttributeAccountID, currentUserPersonalDetails, user?.login ?? '') ?? '';
        navigationRoute = ROUTES.PROFILE.getRoute(accountID, Navigation.getReportRHPActiveRoute());
    } else if ('data' in tnode && !isEmptyObject(tnode.data)) {
        tnodeClone = cloneDeep(tnode);
        // We need to remove the LTR unicode and leading @ from data as it is not part of the login
        mentionDisplayText = tnodeClone.data.replace(CONST.UNICODE.LTR, '').slice(1);
        // We need to replace tnode.data here because we will pass it to TNodeChildrenRenderer below
        asMutable(tnodeClone).data = tnodeClone.data.replace(
            mentionDisplayText,
            Str.removeSMSDomain(getShortMentionIfFound(mentionDisplayText, htmlAttributeAccountID, currentUserPersonalDetails) ?? ''),
        );

        accountID = getAccountIDsByLogins([mentionDisplayText])?.at(0) ?? -1;
        navigationRoute = ROUTES.PROFILE.getRoute(accountID, Navigation.getReportRHPActiveRoute(), mentionDisplayText);
        mentionDisplayText = Str.removeSMSDomain(mentionDisplayText);
    } else if (!isEmpty(htmlAttribAccountID)) {
        // accountID not found in personal details and mention data not provided
        accountID = parseInt(htmlAttribAccountID, 10);
        mentionDisplayText = getDisplayNameOrDefault();
        navigationRoute = ROUTES.PROFILE.getRoute(accountID, Navigation.getReportRHPActiveRoute());
    } else {
        // If neither an account ID or email is provided, don't render anything
        return null;
    }

    const isOurMention = accountID === currentUserPersonalDetails.accountID;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <ShowContextMenuContext.Consumer>
            {({onShowContextMenu, anchor, report, isReportArchived, action, checkIfContextMenuActive, isDisabled, shouldDisplayContextMenu}) => (
                <Text
                    suppressHighlighting
                    onLongPress={(event) => {
                        if (isDisabled || !shouldDisplayContextMenu) {
                            return;
                        }
                        return onShowContextMenu(() =>
                            showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, isArchivedNonExpenseReport(report, isReportArchived)),
                        );
                    }}
                    onPress={(event) => {
                        event.preventDefault();
                        if (!isEmpty(htmlAttribAccountID)) {
                            Navigation.navigate(ROUTES.PROFILE.getRoute(parseInt(htmlAttribAccountID, 10), Navigation.getReportRHPActiveRoute()));
                            return;
                        }
                        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getReportRHPActiveRoute(), mentionDisplayText));
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
                            style={[
                                styles.link,
                                styleWithoutColor,
                                StyleUtils.getMentionStyle(isOurMention),
                                {color: StyleUtils.getMentionTextColor(isOurMention)},
                                styles.breakWord,
                                styles.textWrap,
                            ]}
                            role={CONST.ROLE.LINK}
                            testID="mention-user"
                            href={`/${navigationRoute}`}
                        >
                            {htmlAttribAccountID ? `@${mentionDisplayText}` : <TNodeChildrenRenderer tnode={tnodeClone ?? tnode} />}
                        </Text>
                    </UserDetailsTooltip>
                </Text>
            )}
        </ShowContextMenuContext.Consumer>
    );
}

export default withCurrentUserPersonalDetails(MentionUserRenderer);
