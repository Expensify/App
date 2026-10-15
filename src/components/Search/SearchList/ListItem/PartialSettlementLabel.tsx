import Icon from '@components/Icon';
import Popover from '@components/Popover';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getClickedTargetLocation from '@libs/getClickedTargetLocation';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

/**
 * Marks a settlement whose total only counts the transactions the user may see, with an info button explaining why.
 * The explanation never states the hidden amount or count.
 */
function PartialSettlementLabel() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match Popover's dock decision (bottom-docked only when isSmallScreenWidth)
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Info']);
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: isSmallScreenWidth,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        style: [styles.p4, styles.pb4],
    });

    const [isVisible, setVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({top: 0, left: 0});
    const anchorRef = useRef(null);

    useEffect(() => {
        if (!anchorRef.current || !isVisible) {
            return;
        }

        const position = getClickedTargetLocation(anchorRef.current);
        const BOTTOM_MARGIN_OFFSET = 3;

        setAnchorPosition({
            top: position.top + position.height + BOTTOM_MARGIN_OFFSET,
            left: position.left,
        });
    }, [isVisible, windowWidth]);

    const label = translate('settlement.partialSettlement');

    return (
        <View
            ref={anchorRef}
            style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentEnd, styles.gap1]}
        >
            <Text style={[styles.textLabelSupporting, styles.lh16]}>{label}</Text>
            <PressableWithFeedback
                accessibilityLabel={label}
                accessibilityRole={CONST.ROLE.BUTTON}
                onPress={() => setVisible(true)}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.PARTIAL_SETTLEMENT_INFO_BUTTON}
            >
                <Icon
                    src={icons.Info}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                    fill={theme.icon}
                />
            </PressableWithFeedback>
            <Popover
                onClose={() => setVisible(false)}
                isVisible={isVisible}
                outerStyle={!shouldUseNarrowLayout ? styles.pr5 : undefined}
                innerContainerStyle={!shouldUseNarrowLayout ? styles.cardLabelTooltipContainer : undefined}
                anchorRef={anchorRef}
                anchorPosition={anchorPosition}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <View style={bottomSafeAreaPaddingStyle}>
                    <Text
                        numberOfLines={1}
                        style={[styles.optionDisplayName, styles.textStrong, styles.mb2]}
                    >
                        {label}
                    </Text>
                    <Text style={[styles.textLabelSupporting, styles.lh16]}>{translate('settlement.partialSettlementDescription')}</Text>
                </View>
            </Popover>
        </View>
    );
}

PartialSettlementLabel.displayName = 'PartialSettlementLabel';

export default PartialSettlementLabel;
