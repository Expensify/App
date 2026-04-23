import React from 'react';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import Text from '@components/Text';
import UserDetailsTooltip from '@components/UserDetailsTooltip';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isOptimisticPersonalDetail} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {personalDetailsSelector} from '@src/selectors/PersonalDetails';

type UserDetailsRendererProps = CustomRendererProps<TText | TPhrasing>;

function UserDetailsRenderer({tnode, ...defaultRendererProps}: UserDetailsRendererProps) {
    const styles = useThemeStyles();
    const accountID = tnode.attributes.accountid ? parseInt(tnode.attributes.accountid, 10) : CONST.DEFAULT_NUMBER_ID;
    const [personalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsSelector(accountID)});
    const isOptimistic = isOptimisticPersonalDetail(accountID, personalDetail);

    if (!accountID) {
        return <TNodeChildrenRenderer tnode={tnode} />;
    }

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
