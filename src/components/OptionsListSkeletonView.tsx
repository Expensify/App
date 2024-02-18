import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import {Circle, Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import SkeletonViewContentLoader from './SkeletonViewContentLoader';

type OptionsListSkeletonViewProps = {
    shouldAnimate?: boolean;
};

function OptionsListSkeletonView({shouldAnimate = true}: OptionsListSkeletonViewProps) {
    const theme = useTheme();
    const themeStyles = useThemeStyles();

    const [numItems, setNumItems] = useState(0);
    const skeletonViewItems = useMemo(() => {
        const items = [];
        for (let i = 0; i < numItems; i++) {
            const step = i % 3;
            let lineWidth;
            switch (step) {
                case 0:
                    lineWidth = '100%';
                    break;
                case 1:
                    lineWidth = '50%';
                    break;
                default:
                    lineWidth = '25%';
            }
            items.push(
                <SkeletonViewContentLoader
                    key={`skeletonViewItems${i}`}
                    animate={shouldAnimate}
                    height={CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT}
                    backgroundColor={theme.skeletonLHNIn}
                    foregroundColor={theme.skeletonLHNOut}
                    style={themeStyles.mr5}
                >
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
                </SkeletonViewContentLoader>,
            );
        }
        return items;
    }, [numItems, shouldAnimate, theme, themeStyles]);

    return (
        <View
            style={[themeStyles.flex1, themeStyles.overflowHidden]}
            onLayout={(event) => {
                const newNumItems = Math.ceil(event.nativeEvent.layout.height / CONST.LHN_SKELETON_VIEW_ITEM_HEIGHT);
                if (newNumItems === numItems) {
                    return;
                }
                setNumItems(newNumItems);
            }}
        >
            <View>{skeletonViewItems}</View>
        </View>
    );
}

OptionsListSkeletonView.displayName = 'OptionsListSkeletonView';

export default OptionsListSkeletonView;
