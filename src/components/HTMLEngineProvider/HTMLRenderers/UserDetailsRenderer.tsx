import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';

import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';

import {isPersonalDetailOptimistic} from '@selectors/PersonalDetails';
import React from 'react';
import {TNodeChildrenRenderer} from 'react-native-render-html';

type UserDetailsRendererProps = CustomRendererProps<TText | TPhrasing>;

function UserDetailsRenderer({tnode, ...defaultRendererProps}: UserDetailsRendererProps) {
    const styles = useThemeStyles();
    const accountID = tnode.attributes.accountid ? parseInt(tnode.attributes.accountid, 10) : CONST.DEFAULT_NUMBER_ID;
    const [isOptimistic] = usePersonalDetail(accountID, isPersonalDetailOptimistic);

    if (!accountID) {
        // Fallback: render without tooltip if no accountID
        return <TNodeChildrenRenderer tnode={tnode} />;
    }

    return (
        <UserDetailsTooltip accountID={accountID}>
            {isOptimistic ? (
                <Text
                    {...defaultRendererProps}
                    style={[styles.textStrong]}
                >
                    <TNodeChildrenRenderer tnode={tnode} />
                </Text>
            ) : (
                <Text
                    {...defaultRendererProps}
                    style={[styles.textStrong]}
                    onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PROFILE.getRoute(accountID)))}
                    suppressHighlighting
                    role={CONST.ROLE.LINK}
                >
                    <TNodeChildrenRenderer tnode={tnode} />
                </Text>
            )}
        </UserDetailsTooltip>
    );
}

export default UserDetailsRenderer;
