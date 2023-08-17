import _ from 'underscore';
import React, {forwardRef, useCallback, useEffect, useRef} from 'react';
import styles from '../../styles/styles';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import * as StyleUtils from '../../styles/StyleUtils';
import PressableWithFeedback from '../Pressable/PressableWithFeedback';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked.
 */

function PressableWithSecondaryInteraction(props) {
    const {
        children,
        inline,
        style,
        enableLongPressWithHover,
        withoutFocusOnSecondaryInteraction,
        preventDefaultContextMenu,
        onSecondaryInteraction,
        onPressIn,
        onPress,
        onPressOut,
        activeOpacity,
        innerRef,
        ...rest
    } = props;

    const pressableRef = useRef(null);

    /**
     * @param {Event} e - the secondary interaction event
     */
    const executeSecondaryInteraction = (e) => {
        if (DeviceCapabilities.hasHoverSupport() && !enableLongPressWithHover) {
            return;
        }
        if (withoutFocusOnSecondaryInteraction && pressableRef && pressableRef.current) {
            pressableRef.current.blur();
        }
        onSecondaryInteraction(e);
    };

    /**
     * @param {contextmenu} e - A right-click MouseEvent.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    const executeSecondaryInteractionOnContextMenu = useCallback(
        (e) => {
            if (!onSecondaryInteraction) {
                return;
            }

            e.stopPropagation();
            if (preventDefaultContextMenu) {
                e.preventDefault();
            }

            onSecondaryInteraction(e);

            /**
             * This component prevents the tapped element from capturing focus.
             * We need to blur this element when clicked as it opens modal that implements focus-trapping.
             * When the modal is closed it focuses back to the last active element.
             * Therefore it shifts the element to bring it back to focus.
             * https://github.com/Expensify/App/issues/14148
             */
            if (withoutFocusOnSecondaryInteraction && pressableRef && pressableRef.current) {
                pressableRef.current.blur();
            }
        },
        [onSecondaryInteraction, preventDefaultContextMenu, pressableRef, withoutFocusOnSecondaryInteraction],
    );

    useEffect(() => {
        if (!pressableRef || !pressableRef.current) {
            return;
        }

        if (innerRef) {
            if (_.isFunction(innerRef)) {
                innerRef(pressableRef);
            } else if (_.isObject(innerRef)) {
                innerRef.current = pressableRef.current;
            }
        }

        const element = pressableRef.current;
        element.addEventListener('contextmenu', executeSecondaryInteractionOnContextMenu);

        return () => {
            element.removeEventListener('contextmenu', executeSecondaryInteractionOnContextMenu);
        };
    }, [executeSecondaryInteractionOnContextMenu, innerRef, pressableRef]);

    const defaultPressableProps = _.omit(rest, ['onLongPress']);
    const inlineStyle = inline ? styles.dInline : {};

    return (
        <PressableWithFeedback
            wrapperStyle={StyleUtils.combineStyles(DeviceCapabilities.canUseTouchScreen() ? [styles.userSelectNone, styles.noSelect] : [], inlineStyle)}
            onPressIn={onPressIn}
            onLongPress={onSecondaryInteraction ? executeSecondaryInteraction : undefined}
            pressDimmingValue={activeOpacity}
            onPressOut={onPressOut}
            onPress={onPress}
            ref={pressableRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...defaultPressableProps}
            style={(state) => [StyleUtils.parseStyleFromFunction(style, state), inlineStyle]}
        >
            {children}
        </PressableWithFeedback>
    );
}

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
PressableWithSecondaryInteraction.displayName = 'PressableWithSecondaryInteraction';

export default forwardRef((props, ref) => (
    <PressableWithSecondaryInteraction
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
