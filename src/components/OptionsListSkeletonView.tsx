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
    isUserList?: boolean;
};

function OptionsListSkeletonView({shouldAnimate = true, isUserList = false}: OptionsListSkeletonViewProps) {
    const styles = useThemeStyles();
    if (isUserList) {
        return (
            <ItemListSkeletonView
                shouldAnimate={shouldAnimate}
                itemViewStyle={[styles.highlightBG, styles.mb3, styles.mh5, styles.br2]}
                renderSkeletonItem={() => (
                    <>
                        <Circle
                            cx="40"
                            cy="32"
                            r="20"
                        />
                        <Rect
                            x="72"
                            y="18"
                            width="20%"
                            height="8"
                        />
                        <Rect
                            x="72"
                            y="38"
                            width="10%"
                            height="8"
                        />
                    </>
                )}
            />
        );
    }
    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            renderSkeletonItem={({itemIndex}) => {
                const lineWidth = getLinedWidth(itemIndex);

                return (
                    <>
                        <Circle
                            cx="40"
                            cy="32"
                            r="20"
                        />
                        <Rect
                            x="72"
                            y="18"
                            width="20%"
                            height="8"
                        />
                        <Rect
                            x="72"
                            y="38"
                            width={lineWidth}
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
