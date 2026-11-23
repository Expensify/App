/**
 * A navigation icon with room for a StatusIndicator over its top right corner, as the tab bar, the flat nav bar and the
 * More menu draw it.
 */
import Icon from '@components/Icon';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

type IconWithStatusIndicatorProps = {
    src: IconAsset;
    fill: string;
    size: number;

    /** The StatusIndicator of the icon's destination, positioned against the icon */
    children?: ReactNode;
};

function IconWithStatusIndicator({src, fill, size, children}: IconWithStatusIndicatorProps) {
    return (
        <View>
            <Icon
                src={src}
                fill={fill}
                width={size}
                height={size}
            />
            {children}
        </View>
    );
}

export default IconWithStatusIndicator;
export type {IconWithStatusIndicatorProps};
