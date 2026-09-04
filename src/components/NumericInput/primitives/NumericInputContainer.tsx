import {useNumericInputActions} from '@components/NumericInput/context';
import type {NumericInputContainerProps} from '@components/NumericInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import isHTMLElement from '@libs/isHTMLElement';

import type {MouseEvent} from 'react';

import {useId} from 'react';
import {View} from 'react-native';

/**
 * Renders the centered, full-size amount layout used by the legacy number form.
 * Clicking its empty web area keeps the numeric input focused instead of letting the browser blur it.
 */
function NumericInputContainer({children, style, testID}: NumericInputContainerProps) {
    const styles = useThemeStyles();
    const {clearSelection, focusInput} = useNumericInputActions();
    const numberViewId = useId();

    const handleMouseDown = (event: MouseEvent<Element>) => {
        const targetId = isHTMLElement(event.nativeEvent?.target) ? event.nativeEvent.target.id : undefined;
        if (targetId !== numberViewId) {
            return;
        }

        event.preventDefault();
        clearSelection();
        focusInput();
    };

    return (
        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter, style]}>
            <View
                id={numberViewId}
                onMouseDown={handleMouseDown}
                style={[styles.flex1, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}
                testID={testID}
            >
                <View style={[styles.flexRow, styles.moneyRequestAmountContainer, styles.alignItemsCenter, styles.justifyContentCenter]}>{children}</View>
            </View>
        </View>
    );
}

export default NumericInputContainer;
