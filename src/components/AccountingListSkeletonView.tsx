import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import ItemListSkeletonView from './Skeletons/ItemListSkeletonView';

type AccountingListSkeletonViewProps = {
    shouldAnimate?: boolean;
    gradientOpacityEnabled?: boolean;
};

function AccountingListSkeletonView({shouldAnimate = true, gradientOpacityEnabled = false}: AccountingListSkeletonViewProps) {
    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            gradientOpacityEnabled={gradientOpacityEnabled}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx="20"
                        cy="32"
                        r="20"
                    />
                    <Rect
                        x="54"
                        y="28"
                        width="40%"
                        height="8"
                    />
                </>
            )}
        />
    );
}

AccountingListSkeletonView.displayName = 'AccountingListSkeletonView';

export default AccountingListSkeletonView;
