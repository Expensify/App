import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
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
};

function OptionsListSkeletonView({shouldAnimate = true, shouldStyleAsTable = false, gradientOpacityEnabled = false}: OptionsListSkeletonViewProps) {
    const styles = useThemeStyles();

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            itemViewStyle={shouldStyleAsTable && [styles.highlightBG, styles.mb3, styles.mh5, styles.br2]}
            gradientOpacityEnabled={gradientOpacityEnabled}
            renderSkeletonItem={({itemIndex}) => {
                const lineWidth = getLinedWidth(itemIndex);

                return (
                    <>
                        <Circle
                            cx={shouldStyleAsTable ? '36' : '40'}
                            cy="32"
                            r="20"
                        />
                        <Rect
                            x={shouldStyleAsTable ? '68' : '72'}
                            y="18"
                            width="20%"
                            height="8"
                        />
                        <Rect
                            x={shouldStyleAsTable ? '68' : '72'}
                            y="38"
                            width={shouldStyleAsTable ? '10%' : lineWidth}
                            height="8"
                        />
                    </>
                );
            }}
        />
    );
}

OptionsListSkeletonView.displayName = 'OptionsListSkeletonView';

export default OptionsListSkeletonView;
