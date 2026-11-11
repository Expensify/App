/** Shared identity and signup state of a coming-soon integration for Accounting and Connections. */
import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';
import type {WaitlistIntegration} from '@libs/IntegrationWaitlistUtils';

import {clearIntegrationWaitlistError} from '@userActions/User';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

import IntegrationWaitlistButton from './IntegrationWaitlistButton';
import useIntegrationWaitlist from './useIntegrationWaitlist';

const ICON_NAMES = {
    [CONST.POLICY.CONNECTIONS.NAME.EXACT_ONLINE]: 'ExactOnlineSquare',
    [CONST.POLICY.CONNECTIONS.NAME.ODOO]: 'OdooSquare',
} as const satisfies Record<WaitlistIntegration, string>;

type IntegrationWaitlistRowProps = {
    integration: WaitlistIntegration;
    policy: OnyxEntry<Policy>;
    style?: StyleProp<ViewStyle>;
    titleWrapperStyle?: StyleProp<ViewStyle>;
    isBadgeCondensed?: boolean;
};

function IntegrationWaitlistRow({integration, policy, style, titleWrapperStyle, isBadgeCondensed}: IntegrationWaitlistRowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const iconName = ICON_NAMES[integration];
    const icons = useMemoizedLazyExpensifyIcons([iconName]);
    const {signupTimestamp, pendingAction, errors} = useIntegrationWaitlist(integration);
    const title = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[integration];
    const comingSoon = translate('workspace.accounting.integrationWaitlist.comingSoon');
    const isOnWaitlist = !!signupTimestamp && !pendingAction;
    const accessibilityLabel = [title, comingSoon, isOnWaitlist && translate('workspace.accounting.integrationWaitlist.onWaitlist')].filter(Boolean).join(', ');

    return (
        <OfflineWithFeedback
            errors={errors}
            pendingAction={pendingAction}
            onClose={() => clearIntegrationWaitlistError(integration)}
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
                            source={icons[iconName]}
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
                            <IntegrationWaitlistButton
                                integration={integration}
                                policy={policy}
                            />
                        </MenuItem.Trailing>
                    </View>
                </MenuItem.Row>
            </MenuItem.Root>
        </OfflineWithFeedback>
    );
}

export default IntegrationWaitlistRow;
