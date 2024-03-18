import React, {useCallback, useEffect, useMemo} from 'react';
import {Animated, View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useNativeDriver from '@libs/useNativeDriver';
import CONST from '@src/CONST';
import FloatingMessageCounterContainer from './FloatingMessageCounterContainer';

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
    const translateY = useMemo(() => new Animated.Value(MARKER_INACTIVE_TRANSLATE_Y), []);

    const show = useCallback(() => {
        Animated.spring(translateY, {
            toValue: MARKER_ACTIVE_TRANSLATE_Y,
            useNativeDriver,
        }).start();
    }, [translateY]);

    const hide = useCallback(() => {
        Animated.spring(translateY, {
            toValue: MARKER_INACTIVE_TRANSLATE_Y,
            useNativeDriver,
        }).start();
    }, [translateY]);

    useEffect(() => {
        if (isActive) {
            show();
        } else {
            hide();
        }
    }, [isActive, show, hide]);

    return (
        <FloatingMessageCounterContainer
            accessibilityHint={translate('accessibilityHints.scrollToNewestMessages')}
            containerStyles={styles.floatingMessageCounterTransformation(translateY)}
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
        </FloatingMessageCounterContainer>
    );
}

FloatingMessageCounter.displayName = 'FloatingMessageCounter';

export default React.memo(FloatingMessageCounter);
