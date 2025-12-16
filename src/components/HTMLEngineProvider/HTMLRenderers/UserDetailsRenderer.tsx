import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isOptimisticPersonalDetail} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type UserDetailsRendererProps = CustomRendererProps<TText | TPhrasing>;

function UserDetailsRenderer({tnode, ...defaultRendererProps}: UserDetailsRendererProps) {
    const styles = useThemeStyles();
    const accountID = tnode.attributes.accountid ? parseInt(tnode.attributes.accountid, 10) : undefined;

    if (!accountID) {
        // Fallback: render without tooltip if no accountID
        return <TNodeChildrenRenderer tnode={tnode} />;
    }

    const isOptimistic = isOptimisticPersonalDetail(accountID);

    return (
        <UserDetailsTooltip accountID={accountID}>
            {isOptimistic ? (
                <Text
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    style={[styles.textStrong]}
                >
                    <TNodeChildrenRenderer tnode={tnode} />
                </Text>
            ) : (
                <Text
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...defaultRendererProps}
                    style={[styles.textStrong]}
                    onPress={() => Navigation.navigate(ROUTES.PROFILE.getRoute(accountID, Navigation.getActiveRoute()))}
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
