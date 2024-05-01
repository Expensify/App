import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type FloatingMessageCounterProps = {
    /** Whether the New Messages indicator is active */
    isActive?: boolean;

    /** Callback to be called when user clicks the New Messages indicator */
    onClick?: () => void;
};

const MARKER_INACTIVE_TRANSLATE_Y = -40;
const MARKER_ACTIVE_TRANSLATE_Y = 10;

function FloatingMessageCounter({isActive = false, onClick = () => {}}: FloatingMessageCounterProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const translateY = useSharedValue(MARKER_INACTIVE_TRANSLATE_Y);

    const show = useCallback(() => {
        'worklet';

        translateY.value = withSpring(MARKER_ACTIVE_TRANSLATE_Y);
    }, [translateY]);

    const hide = useCallback(() => {
        'worklet';

        translateY.value = withSpring(MARKER_INACTIVE_TRANSLATE_Y);
    }, [translateY]);

    useEffect(() => {
        if (isActive) {
            show();
        } else {
            hide();
        }
    }, [isActive, show, hide]);

    const wrapperStyle = useAnimatedStyle(() => ({
        ...styles.floatingMessageCounterWrapper,
        transform: [{translateY: translateY.value}],
    }));

    return (
        <Animated.View
            accessibilityHint={translate('accessibilityHints.scrollToNewestMessages')}
            style={wrapperStyle}
        >
            <View style={styles.floatingMessageCounter}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Button
                        success
                        small
                        onPress={onClick}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Icon
                                small
                                src={Expensicons.DownArrow}
                                fill={theme.textLight}
                            />

                            <Text
                                style={[styles.ml2, styles.buttonSmallText, styles.textWhite, styles.userSelectNone]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >
                                {translate('newMessages')}
                            </Text>
                        </View>
                    </Button>
                </View>
            </View>
        </Animated.View>
    );
}

FloatingMessageCounter.displayName = 'FloatingMessageCounter';

export default React.memo(FloatingMessageCounter);
