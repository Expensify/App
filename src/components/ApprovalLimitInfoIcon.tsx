import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';

import {hasHoverSupport} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import {PressableWithoutFeedback} from './Pressable';
import Tooltip from './Tooltip';
import EducationalTooltip from './Tooltip/EducationalTooltip';

type ApprovalLimitInfoIconProps = {
    /** Explains the approver's limit, shown in the tooltip */
    description: string;
};

/**
 * An info icon whose tooltip explains an approver's limit. It shows on hover, and on touch devices, which have no
 * hover, on tap instead.
 */
function ApprovalLimitInfoIcon({description}: ApprovalLimitInfoIconProps) {
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const icon = (
        <Icon
            src={icons.Info}
            width={variables.iconSizeExtraSmall}
            height={variables.iconSizeExtraSmall}
            fill={theme.icon}
        />
    );

    if (hasHoverSupport()) {
        return (
            <Tooltip text={description}>
                <View
                    accessible
                    accessibilityLabel={description}
                >
                    {icon}
                </View>
            </Tooltip>
        );
    }

    return (
        <EducationalTooltip
            shouldRender={isTooltipVisible}
            text={description}
            onTooltipPress={() => setIsTooltipVisible(false)}
            shouldHideOnScroll
        >
            <PressableWithoutFeedback
                accessibilityLabel={description}
                role={CONST.ROLE.BUTTON}
                onPress={() => setIsTooltipVisible((isVisible) => !isVisible)}
                shouldUseAutoHitSlop
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_SECTION_APPROVAL_LIMIT_INFO}
            >
                {icon}
            </PressableWithoutFeedback>
        </EducationalTooltip>
    );
}

export default ApprovalLimitInfoIcon;
