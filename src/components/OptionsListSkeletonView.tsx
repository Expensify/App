import useThemeStyles from '@hooks/useThemeStyles';

import type {LayoutChangeEvent} from 'react-native';

import React from 'react';

import {SkeletonViewRect as SkeletonRect} from './SkeletonRect';
import ItemListSkeletonView from './Skeletons/ItemListSkeletonView';

function getLinedWidth(index: number): `${number}%` {
    const step = index % 3;
    if (step === 0) {
        return '100%';
    }

    if (step === 1) {
        return '50%';
    }

    return '25%';
}

type OptionsListSkeletonViewProps = {
    shouldAnimate?: boolean;
    gradientOpacityEnabled?: boolean;
    shouldStyleAsTable?: boolean;
    fixedNumItems?: number;
    speed?: number;
    onLayout?: (event: LayoutChangeEvent) => void;
};

function OptionsListSkeletonView({shouldAnimate = true, shouldStyleAsTable = false, gradientOpacityEnabled = false, fixedNumItems, speed, onLayout}: OptionsListSkeletonViewProps) {
    const styles = useThemeStyles();

    return (
        <ItemListSkeletonView
            fixedNumItems={fixedNumItems}
            speed={speed}
            shouldAnimate={shouldAnimate}
            onLayout={onLayout}
            style={[styles.overflowHidden]}
            itemViewStyle={shouldStyleAsTable && [styles.highlightBG, styles.mb2, styles.ml5, styles.br2]}
            gradientOpacityEnabled={gradientOpacityEnabled}
            renderSkeletonItem={({itemIndex}) => {
                const lineWidth = getLinedWidth(itemIndex);
                const textStartX = shouldStyleAsTable ? 68 : 72;

                return (
                    <>
                        <SkeletonRect
                            x={shouldStyleAsTable ? 16 : 20}
                            y={12}
                            width={40}
                            height={40}
                            borderRadius={20}
                        />
                        <SkeletonRect
                            x={textStartX}
                            y={18}
                            width="20%"
                            height="8"
                        />
                        <SkeletonRect
                            x={textStartX}
                            y={38}
                            width={shouldStyleAsTable ? '10%' : lineWidth}
                            height="8"
                        />
                    </>
                );
            }}
        />
    );
}

export default OptionsListSkeletonView;
