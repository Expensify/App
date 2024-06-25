import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SkeletonViewProps} from './SelectionList/types';
import ItemListSkeletonView from './Skeletons/ItemListSkeletonView';

function UserListSkeletonView({shouldAnimate = true}: SkeletonViewProps) {
    const styles = useThemeStyles();
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

UserListSkeletonView.displayName = 'UserListSkeletonView';

export default UserListSkeletonView;
