/** Exact Online's coming-soon card keeps account signup separate from live connector setup. */
import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import ExactOnlineWaitlistButton from '@pages/workspace/accounting/ExactOnlineWaitlistButton';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type ExactOnlineWaitlistCardProps = {
    policyID?: string;
};

function ExactOnlineWaitlistCard({policyID}: ExactOnlineWaitlistCardProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['ExactOnlineSquare']);
    const title = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.exactOnline;
    const comingSoon = translate('workspace.accounting.exactOnline.comingSoon');

    return (
        <View
            style={[
                styles.workspaceSectionMoreFeaturesItem,
                styles.p0,
                styles.overflowHidden,
                shouldUseNarrowLayout || isMediumScreenWidth ? [styles.flexBasis100, StyleUtils.getMinimumWidth(0)] : styles.connectionCard,
            ]}
        >
            <MenuItem.Root
                accessibilityLabel={`${title}, ${comingSoon}`}
                // On iOS, disable row grouping so VoiceOver can focus the nested waitlist button.
                shouldBeAccessible={getPlatform() !== CONST.PLATFORM.IOS}
                style={[styles.pv4, styles.ph4]}
            >
                <MenuItem.Row>
                    <MenuItem.Leading>
                        <UserAvatar
                            source={icons.ExactOnlineSquare}
                            accountID={CONST.DEFAULT_NUMBER_ID}
                        />
                    </MenuItem.Leading>
                    <MenuItem.Content>
                        <MenuItem.Title>{title}</MenuItem.Title>
                        <Badge
                            text={comingSoon}
                            isCondensed
                            badgeStyles={[styles.ml0, styles.alignSelfStart]}
                        />
                    </MenuItem.Content>
                    <MenuItem.Trailing>
                        <ExactOnlineWaitlistButton policy={policy} />
                    </MenuItem.Trailing>
                </MenuItem.Row>
            </MenuItem.Root>
        </View>
    );
}

export default ExactOnlineWaitlistCard;
