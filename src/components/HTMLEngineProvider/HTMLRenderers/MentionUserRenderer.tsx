import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';

import useLocalize from '@hooks/useLocalize';
import {usePersonalDetailsByLogins} from '@hooks/usePersonalDetailByLogin';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getAccountIDsByLogins, temporaryGetDisplayNameOrDefault, getShortMentionIfFound} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import asMutable from '@src/types/utils/asMutable';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {TextStyle} from 'react-native';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import {Str} from 'expensify-common';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import {StyleSheet} from 'react-native';
import {TNodeChildrenRenderer} from 'react-native-render-html';

type MentionUserRendererProps = WithCurrentUserPersonalDetailsProps & CustomRendererProps<TText | TPhrasing>;

type MentionUserLinkProps = Omit<MentionUserRendererProps, 'TDefaultRenderer' | 'currentUserPersonalDetails'> & {
    accountID: number;
    mentionDisplayText: string;
    navigationRoute: Route;
    currentUserAccountID: number | undefined;
};

function MentionUserLink({style, tnode, accountID, mentionDisplayText, navigationRoute, currentUserAccountID, ...defaultRendererProps}: MentionUserLinkProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {anchor, report, action, isDisabled, shouldDisplayContextMenu, originalReportID} = useShowContextMenuState();
    const {onShowContextMenu, checkIfContextMenuActive} = useShowContextMenuActions();
    const htmlAttribAccountID = tnode.attributes.accountid;

    const isOurMention = accountID === currentUserAccountID;

    const flattenStyle = StyleSheet.flatten(style as TextStyle);
    const {color, ...styleWithoutColor} = flattenStyle;

    return (
        <Text
            suppressHighlighting
            onLongPress={(event) => {
                if (isDisabled || !shouldDisplayContextMenu) {
                    return;
                }
                return onShowContextMenu(() => showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, originalReportID));
            }}
            onPress={(event) => {
                event.preventDefault();
                if (!isEmpty(htmlAttribAccountID)) {
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(parseInt(htmlAttribAccountID, 10)), Navigation.getReportRHPActiveRoute()));
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID, mentionDisplayText), Navigation.getReportRHPActiveRoute()));
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
                    {htmlAttribAccountID ? `@${mentionDisplayText}` : <TNodeChildrenRenderer tnode={tnode} />}
                </Text>
            </UserDetailsTooltip>
        </Text>
    );
}

type MentionUserLoginLinkProps = Omit<MentionUserRendererProps, 'TDefaultRenderer'> & {
    tnode: TText;
};

function MentionUserLoginLink({tnode, currentUserPersonalDetails, ...props}: MentionUserLoginLinkProps) {
    const htmlAttribAccountID = tnode.attributes.accountid;
    // We need to remove the LTR unicode and leading @ from data as it is not part of the login
    const login = tnode.data.replace(CONST.UNICODE.LTR, '').slice(1);
    const accountID = usePersonalDetailsByLogins([login], (personalDetailsByLogins) => getAccountIDsByLogins([login], personalDetailsByLogins).at(0) ?? CONST.DEFAULT_NUMBER_ID);

    const tnodeClone = cloneDeep(tnode);
    // We need to replace tnode.data here because we will pass it to TNodeChildrenRenderer
    asMutable(tnodeClone).data = tnodeClone.data.replace(login, Str.removeSMSDomain(getShortMentionIfFound(login, htmlAttribAccountID, currentUserPersonalDetails) ?? ''));

    return (
        <MentionUserLink
            {...props}
            tnode={tnodeClone}
            accountID={accountID}
            mentionDisplayText={Str.removeSMSDomain(login)}
            navigationRoute={createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID, login), Navigation.getReportRHPActiveRoute())}
            currentUserAccountID={currentUserPersonalDetails.accountID}
        />
    );
}

function MentionUserRenderer({tnode, TDefaultRenderer, currentUserPersonalDetails, ...defaultRendererProps}: MentionUserRendererProps) {
    const {formatPhoneNumber, translate} = useLocalize();
    const htmlAttribAccountID = tnode.attributes.accountid;
    const personalDetails = usePersonalDetails();

    if (!isEmpty(htmlAttribAccountID) && personalDetails?.[htmlAttribAccountID]) {
        const user = personalDetails?.[htmlAttribAccountID];
        const accountID = parseInt(htmlAttribAccountID, 10);
        const displayName = formatPhoneNumber(user?.login ?? '') || temporaryGetDisplayNameOrDefault({passedPersonalDetails: user, translate, formatPhoneNumber});
        return (
            <MentionUserLink
                {...defaultRendererProps}
                tnode={tnode}
                accountID={accountID}
                mentionDisplayText={getShortMentionIfFound(displayName, htmlAttribAccountID, currentUserPersonalDetails, user?.login ?? '') ?? ''}
                navigationRoute={createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID), Navigation.getReportRHPActiveRoute())}
                currentUserAccountID={currentUserPersonalDetails.accountID}
            />
        );
    }

    if ('data' in tnode && !isEmptyObject(tnode.data)) {
        return (
            <MentionUserLoginLink
                {...defaultRendererProps}
                tnode={tnode}
                currentUserPersonalDetails={currentUserPersonalDetails}
            />
        );
    }

    if (!isEmpty(htmlAttribAccountID)) {
        // accountID not found in personal details and mention data not provided
        const accountID = parseInt(htmlAttribAccountID, 10);
        return (
            <MentionUserLink
                {...defaultRendererProps}
                tnode={tnode}
                accountID={accountID}
                mentionDisplayText={temporaryGetDisplayNameOrDefault({translate, formatPhoneNumber})}
                navigationRoute={createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID), Navigation.getReportRHPActiveRoute())}
                currentUserAccountID={currentUserPersonalDetails.accountID}
            />
        );
    }

    // If neither an account ID or email is provided, don't render anything
    return null;
}

export default withCurrentUserPersonalDetails(MentionUserRenderer);
