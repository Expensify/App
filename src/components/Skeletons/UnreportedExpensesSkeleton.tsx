import React from 'react';
import {View} from 'react-native';
import {Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import ItemListSkeletonView from './ItemListSkeletonView';

function UnreportedExpensesSkeleton({fixedNumberOfItems}: {fixedNumberOfItems?: number}) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.pt3]}>
            <ItemListSkeletonView
                itemViewHeight={64}
                itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml3, styles.mr3]}
                shouldAnimate
                fixedNumItems={fixedNumberOfItems}
                renderSkeletonItem={() => (
                    <>
                        <Rect
                            x={16}
                            y={22}
                            width={20}
                            height={20}
                            rx={4}
                            ry={4}
                        />
                        <Rect
                            x={48}
                            y={12}
                            width={36}
                            height={40}
                            rx={4}
                            ry={4}
                        />
                        <Rect
                            x={96}
                            y={26}
                            width={200}
                            height={12}
                        />
                    </>
                )}
            />
        </View>
    );
}

UnreportedExpensesSkeleton.displayName = 'UnreportedExpensesSkeleton';

export default UnreportedExpensesSkeleton;
