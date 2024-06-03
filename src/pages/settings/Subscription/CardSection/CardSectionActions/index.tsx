import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';

function CardSectionActions() {
    const {isSmallScreenWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const threeDotsMenuContainerRef = useRef<View>(null);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.CreditCard,
                text: translate('subscription.cardSection.changeCard'),
                onSelected: () => {}, // TODO: update with navigation to add card screen
            },
            {
                icon: Expensicons.MoneyCircle,
                text: translate('subscription.cardSection.changeCurrency'),
                onSelected: () => {}, // TODO: update with navigation to change currency screen
            },
        ],
        [translate],
    );

    const handleIconPress = useCallback(() => {
        if (isSmallScreenWidth) {
            return;
        }
        threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
            setThreeDotsMenuPosition({
                horizontal: x + width,
                vertical: y + height,
            });
        });
    }, [isSmallScreenWidth]);

    const anchorAlignment = useMemo(
        () => ({
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }),
        [],
    );

    return (
        <View ref={threeDotsMenuContainerRef}>
            <ThreeDotsMenu
                onIconPress={handleIconPress}
                menuItems={overflowMenu}
                anchorPosition={threeDotsMenuPosition}
                anchorAlignment={anchorAlignment}
                shouldOverlay
            />
        </View>
    );
}

CardSectionActions.displayName = 'CardSectionActions';

export default CardSectionActions;
