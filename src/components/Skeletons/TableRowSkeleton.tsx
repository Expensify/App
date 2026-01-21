import React from 'react';
import {Circle, Rect} from 'react-native-svg';
import useThemeStyles from '@hooks/useThemeStyles';
import useSkeletonSpan from '@libs/telemetry/useSkeletonSpan';
import ItemListSkeletonView from './ItemListSkeletonView';

type TableListItemSkeletonProps = {
    shouldAnimate?: boolean;
    fixedNumItems?: number;
    gradientOpacityEnabled?: boolean;
    useCompanyCardsLayout?: boolean;
};

const barHeight = '8';
const shortBarWidth = '60';
const longBarWidth = '124';

function TableListItemSkeleton({shouldAnimate = true, fixedNumItems, gradientOpacityEnabled = false, useCompanyCardsLayout = false}: TableListItemSkeletonProps) {
    const styles = useThemeStyles();
    useSkeletonSpan('TableRowSkeleton');

    const circleX = useCompanyCardsLayout ? 36 : 40;
    const circleY = useCompanyCardsLayout ? 36 : 32;
    const rectX = useCompanyCardsLayout ? 68 : 80;
    const rectY1 = useCompanyCardsLayout ? 24 : 20;
    const rectY2 = useCompanyCardsLayout ? 40 : 36;

    return (
        <ItemListSkeletonView
            shouldAnimate={shouldAnimate}
            fixedNumItems={fixedNumItems}
            gradientOpacityEnabled={gradientOpacityEnabled}
            itemViewStyle={useCompanyCardsLayout ? [styles.highlightBG, styles.mb2, styles.br3] : [styles.highlightBG, styles.mb2, styles.br3, styles.ml5]}
            renderSkeletonItem={() => (
                <>
                    <Circle
                        cx={circleX}
                        cy={circleY}
                        r="20"
                    />
                    <Rect
                        transform={[{translateX: rectX}, {translateY: rectY1}]}
                        width={longBarWidth}
                        height={barHeight}
                    />
                    <Rect
                        transform={[{translateX: rectX}, {translateY: rectY2}]}
                        width={shortBarWidth}
                        height={barHeight}
                    />
                </>
            )}
        />
    );
}

export default TableListItemSkeleton;
