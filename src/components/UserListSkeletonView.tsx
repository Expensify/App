import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useTheme from '@hooks/useTheme';
import type {SkeletonViewProps} from './SelectionList/types';
import ItemListSkeletonView from './Skeletons/ItemListSkeletonView';

function UserListSkeletonView({shouldAnimate = true}: SkeletonViewProps) {
    const theme = useTheme();

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            itemContainerStyle={{backgroundColor: theme.highlightBG, marginBottom: 12, marginHorizontal: 20, borderRadius: 8}}
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

UserListSkeletonView.displayName = 'UserListSkeletonView';

export default UserListSkeletonView;
