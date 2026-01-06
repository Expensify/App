import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type FloatingMessageCounterProps = {
    /** Whether the New Messages indicator is active */
    isActive?: boolean;

    /** Whether there are new messages */
    hasNewMessages: boolean;

    /** Callback to be called when user clicks the New Messages indicator */
    onClick?: () => void;
};

const MARKER_INACTIVE_TRANSLATE_Y = -40;
const MARKER_ACTIVE_TRANSLATE_Y = 10;

function FloatingMessageCounter({isActive = false, onClick = () => {}, hasNewMessages}: FloatingMessageCounterProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const translateY = useSharedValue(MARKER_INACTIVE_TRANSLATE_Y);

    const show = useCallback(() => {
        'worklet';

        translateY.set(withSpring(MARKER_ACTIVE_TRANSLATE_Y));
    }, [translateY]);

    const hide = useCallback(() => {
        'worklet';

        translateY.set(withSpring(MARKER_INACTIVE_TRANSLATE_Y));
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
        transform: [{translateY: translateY.get()}],
    }));

    return (
        <Animated.View
            accessibilityHint={translate('accessibilityHints.scrollToNewestMessages')}
            style={wrapperStyle}
        >
            <View style={styles.floatingMessageCounter}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Button
                        success={hasNewMessages}
                        small
                        onPress={onClick}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.FLOATING_MESSAGE_COUNTER}
                    >
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <Icon
                                small
                                src={icons.DownArrow}
                                fill={hasNewMessages ? theme.textLight : theme.icon}
                            />

                            <Text
                                style={[styles.ml2, styles.buttonSmallText, hasNewMessages && styles.textWhite, styles.userSelectNone]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                            >
                                {hasNewMessages ? translate('newMessages') : translate('latestMessages')}
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
