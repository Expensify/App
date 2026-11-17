import Icon from '@components/Icon';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasHoverSupport} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import type GlobalReimbursementsEnabledIconProps from './types';

import LongPressGlobalReimbursementsEnabledIcon from './LongPressGlobalReimbursementsEnabledIcon';

/** Globe next to the bank account name that says global reimbursements are enabled, on hover */
function GlobalReimbursementsEnabledIcon({onPress}: GlobalReimbursementsEnabledIconProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe']);
    const label = translate('walletPage.globalReimbursementsEnabled');

    // The shared Tooltip renders nothing on touch-only web, so fall back to the long-press tooltip native uses
    if (!hasHoverSupport()) {
        return <LongPressGlobalReimbursementsEnabledIcon onPress={onPress} />;
    }

    // The row handles clicks here, since a click on the icon bubbles up to it
    return (
        <Tooltip text={label}>
            <View
                style={styles.ml1}
                role={CONST.ROLE.IMG}
                accessibilityLabel={label}
            >
                <Icon
                    src={icons.Globe}
                    width={variables.iconSizeSemiSmall}
                    height={variables.iconSizeSemiSmall}
                    fill={theme.icon}
                />
            </View>
        </Tooltip>
    );
}

export default GlobalReimbursementsEnabledIcon;
