import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import ItemListSkeletonView from './Skeletons/ItemListSkeletonView';

function getLinedWidth(index: number): string {
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
};

function OptionsListSkeletonView({shouldAnimate = true, shouldStyleAsTable = false, gradientOpacityEnabled = false, fixedNumItems, speed}: OptionsListSkeletonViewProps) {
    const styles = useThemeStyles();
    useSkeletonSpan('OptionsListSkeletonView');

    return (
        <ItemListSkeletonView
            fixedNumItems={fixedNumItems}
            speed={speed}
            shouldAnimate={shouldAnimate}
            style={[styles.overflowHidden]}
            itemViewStyle={shouldStyleAsTable && [styles.highlightBG, styles.mb2, styles.ml5, styles.br2]}
            gradientOpacityEnabled={gradientOpacityEnabled}
            renderSkeletonItem={({itemIndex}) => {
                const lineWidth = getLinedWidth(itemIndex);
                const textStartX = shouldStyleAsTable ? 68 : 72;

                return (
                    <>
                        <Circle
                            cx={shouldStyleAsTable ? '36' : '40'}
                            cy="32"
                            r="20"
                        />
                        <Rect
                            transform={[{translateX: textStartX}, {translateY: 18}]}
                            width="20%"
                            height="8"
                        />
                        <Rect
                            transform={[{translateX: textStartX}, {translateY: 38}]}
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
