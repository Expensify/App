import React from 'react';
import {Circle} from 'react-native-svg';
import SkeletonRect from '@components/SkeletonRect';

export default function WorkspaceCompanyCardsTableSkeleton() {
    return (
        <>
            <Circle
                cx={20}
                cy={14}
                r="14"
            />
            <SkeletonRect
                transform={[{translateX: 50}, {translateY: 4}]}
                width={124}
                height={8}
            />
            <SkeletonRect
                transform={[{translateX: 50}, {translateY: 20}]}
                width={60}
                height={8}
            />
        </>
    );
}
