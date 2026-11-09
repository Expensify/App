/** The green button behind both of the flat navigation bar's Create buttons, which opens the create menu. */
import Button from '@components/Button';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import type {ComponentRef, ReactNode, RefObject} from 'react';
import type {StyleProp, View, ViewStyle} from 'react-native';

import React from 'react';

type FlatNavCreateMenuButtonProps = {
    /** What the button draws: the "+" icon, with or without the "Create" label */
    children: ReactNode;

    ref: RefObject<ComponentRef<typeof View> | null>;

    /** Whether the create menu this button opens is open */
    isExpanded: boolean;

    onPress: () => void;

    testID: string;

    /** Styles the button's outer wrapper, which sizes it within the bar */
    style?: StyleProp<ViewStyle>;

    /** Styles the pressable surface itself: its height and shape */
    innerStyles: StyleProp<ViewStyle>;
};

function FlatNavCreateMenuButton({children, ref, isExpanded, onPress, testID, style, innerStyles}: FlatNavCreateMenuButtonProps) {
    const {translate} = useLocalize();

    return (
        <Button
            ref={ref}
            testID={testID}
            accessibilityLabel={translate('common.create')}
            accessibilityHasPopup="menu"
            accessibilityState={{expanded: isExpanded}}
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.SMALL}
            style={style}
            innerStyles={innerStyles}
            onPress={onPress}
            // Same action as the floating action button it replaces, so it keeps that button's Sentry and FullStory identifier.
            sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
        >
            {children}
        </Button>
    );
}

export default FlatNavCreateMenuButton;
