import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {getTooltipCoordinates} from '@components/Tooltip/EducationalTooltip/measureTooltipCoordinate';
import GenericTooltip from '@components/Tooltip/GenericTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {useRef} from 'react';

import type GlobalReimbursementsEnabledIconProps from './types';

/** Globe next to the bank account name that says global reimbursements are enabled, on long-press. The shared Tooltip renders nothing on native, so this drives GenericTooltip itself */
function GlobalReimbursementsEnabledIcon({onPress}: GlobalReimbursementsEnabledIconProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Globe']);
    const iconRef = useRef<View>(null);
    const label = translate('walletPage.globalReimbursementsEnabled');

    return (
        <GenericTooltip
            text={label}
            // A tap anywhere outside the tooltip closes it
            shouldUseOverlay
        >
            {({showTooltip, updateTargetBounds}) => (
                <PressableWithoutFeedback
                    ref={iconRef}
                    style={styles.ml1}
                    onPress={onPress}
                    onLongPress={() => {
                        if (!iconRef.current) {
                            return;
                        }
                        getTooltipCoordinates(iconRef.current, (bounds) => {
                            updateTargetBounds(bounds);
                            showTooltip();
                        });
                    }}
                    accessibilityLabel={label}
                    role={CONST.ROLE.IMG}
                    sentryLabel={CONST.SENTRY_LABEL.PAYMENT_METHOD_LIST_ITEM.GLOBAL_REIMBURSEMENTS_ENABLED}
                >
                    <Icon
                        src={icons.Globe}
                        width={variables.iconSizeSemiSmall}
                        height={variables.iconSizeSemiSmall}
                        fill={theme.icon}
                    />
                </PressableWithoutFeedback>
            )}
        </GenericTooltip>
    );
}

export default GlobalReimbursementsEnabledIcon;
