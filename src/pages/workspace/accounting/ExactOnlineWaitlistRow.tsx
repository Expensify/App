/** Shared Exact Online identity and signup state for Accounting and Connections. */
import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import {clearExactOnlineWaitlistError} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import ExactOnlineWaitlistButton from './ExactOnlineWaitlistButton';

type ExactOnlineWaitlistRowProps = {
    policy: OnyxEntry<Policy>;
    style?: StyleProp<ViewStyle>;
    titleWrapperStyle?: StyleProp<ViewStyle>;
    isBadgeCondensed?: boolean;
};

function ExactOnlineWaitlistRow({policy, style, titleWrapperStyle, isBadgeCondensed}: ExactOnlineWaitlistRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ExactOnlineSquare']);
    const [signupTimestamp] = useOnyx(ONYXKEYS.NVP_EXACT_ONLINE_WAITLIST);
    const [errors] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.errorFields?.exactOnlineWaitlist});
    const [pendingAction] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.pendingFields?.exactOnlineWaitlist});
    const title = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.exactOnline;
    const comingSoon = translate('workspace.accounting.exactOnline.comingSoon');
    const isOnWaitlist = !!signupTimestamp && !pendingAction;
    const accessibilityLabel = [title, comingSoon, isOnWaitlist && translate('workspace.accounting.exactOnline.onWaitlist')].filter(Boolean).join(', ');

    return (
        <OfflineWithFeedback
            errors={errors}
            pendingAction={pendingAction}
            onClose={clearExactOnlineWaitlistError}
            errorRowStyles={[style, styles.pb3]}
        >
            <MenuItem.Root
                accessibilityLabel={accessibilityLabel}
                // On iOS, disable row grouping so VoiceOver can focus the nested waitlist button.
                shouldBeAccessible={getPlatform() !== CONST.PLATFORM.IOS}
                style={style}
            >
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <UserAvatar
                            source={icons.ExactOnlineSquare}
                            accountID={CONST.DEFAULT_NUMBER_ID}
                        />
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <View style={[styles.gap1, titleWrapperStyle]}>
                            <MenuItem.Title>{title}</MenuItem.Title>
                            <Badge
                                text={comingSoon}
                                isCondensed={isBadgeCondensed}
                                badgeStyles={[styles.alignSelfStart, styles.ml0, styles.mw100]}
                            />
                        </View>
                    </MenuItem.Content>
                    <View style={[isOnWaitlist && styles.flex1, styles.justifyContentCenter]}>
                        <MenuItem.Trailing>
                            <ExactOnlineWaitlistButton policy={policy} />
                        </MenuItem.Trailing>
                    </View>
                </MenuItem.Row>
            </MenuItem.Root>
        </OfflineWithFeedback>
    );
}

export default ExactOnlineWaitlistRow;
