import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo} from 'react';
import {Animated, View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNativeDriver from '@libs/useNativeDriver';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import FloatingMessageCounterContainer from './FloatingMessageCounterContainer';

const propTypes = {
    /** Whether the New Messages indicator is active */
    isActive: PropTypes.bool,

    /** Callback to be called when user clicks the New Messages indicator */
    onClick: PropTypes.func,
};

const defaultProps = {
    isActive: false,
    onClick: () => {},
};

const MARKER_INACTIVE_TRANSLATE_Y = -40;
const MARKER_ACTIVE_TRANSLATE_Y = 10;

function FloatingMessageCounter(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const translateY = useMemo(() => new Animated.Value(MARKER_INACTIVE_TRANSLATE_Y), []);

    const show = useCallback(() => {
        Animated.spring(translateY, {
            toValue: MARKER_ACTIVE_TRANSLATE_Y,
            duration: 80,
            useNativeDriver,
        }).start();
    }, [translateY]);

    const hide = useCallback(() => {
        Animated.spring(translateY, {
            toValue: MARKER_INACTIVE_TRANSLATE_Y,
            duration: 80,
            useNativeDriver,
        }).start();
    }, [translateY]);

    useEffect(() => {
        if (props.isActive) {
            show();
        } else {
            hide();
        }
    }, [props.isActive, show, hide]);

    return (
        <FloatingMessageCounterContainer
            accessibilityHint={translate('accessibilityHints.scrollToNewestMessages')}
            containerStyles={[styles.floatingMessageCounterTransformation(translateY)]}
        >
            <View style={styles.floatingMessageCounter}>
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Button
                        success
                        small
                        onPress={props.onClick}
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

FloatingMessageCounter.propTypes = propTypes;
FloatingMessageCounter.defaultProps = defaultProps;
FloatingMessageCounter.displayName = 'FloatingMessageCounter';
export default React.memo(FloatingMessageCounter);
