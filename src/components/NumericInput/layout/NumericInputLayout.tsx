import ScrollView from '@components/ScrollView';

import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';
import isHTMLElement from '@libs/isHTMLElement';

import type {MouseEvent, ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import NumericInputFooter from './NumericInputFooter';
import NumericInputMain from './NumericInputMain';
import NumericInputPad from './NumericInputPad';

const canUseTouchScreen = canUseTouchScreenUtil();

/** Elements that keep their default mouse down behavior, so pressing them never steals or forces the input focus. */
const INTERACTIVE_ELEMENT_SELECTOR = 'input, textarea, button, a, [role="button"], [role="link"], [contenteditable="true"]';

type NumericInputLayoutProps = {
    /** The amount row. */
    children: ReactNode;

    /** Actions placed under the amount. */
    actions?: ReactNode;

    /** Footer below the amount and the number pad. */
    footer?: ReactNode;

    /** Test identifier of the layout root, suffixed for its parts. */
    testID?: string;

    /** Called when an empty area of the layout is pressed on web, to keep the input focused. */
    onEmptyAreaPress: () => void;
};

const getPartTestID = (testID: string | undefined, part: string) => (testID ? `${testID}-${part}` : undefined);

/**
 * Full-screen layout of NumericInput. Phones in landscape get two columns (amount on the left, number pad on the right) with
 * the footer pinned below them. Everything else (portrait, tablets, desktop) gets a single scrollable column.
 * On web, pressing any non-interactive area keeps the numeric input focused instead of letting the browser blur it.
 */
function NumericInputLayout({children, actions, footer, testID, onEmptyAreaPress}: NumericInputLayoutProps) {
    const styles = useThemeStyles();
    const isTwoColumn = useIsInLandscapeMode();

    const handleMouseDown = (event: MouseEvent<Element>) => {
        const target = event.nativeEvent?.target;

        // Controls that keep the caret themselves (such as the flip button) already prevented the default
        if (event.isDefaultPrevented() || !isHTMLElement(target) || target.closest(INTERACTIVE_ELEMENT_SELECTOR)) {
            return;
        }

        event.preventDefault();
        onEmptyAreaPress();
    };

    const main = (
        <NumericInputMain
            actions={actions}
            amountTestID={getPartTestID(testID, 'amount')}
            isTwoColumn={isTwoColumn}
            testID={getPartTestID(testID, 'main')}
        >
            {children}
        </NumericInputMain>
    );
    const pad = (
        <NumericInputPad
            isTwoColumn={isTwoColumn}
            testID={getPartTestID(testID, 'pad')}
        />
    );
    const footerNode = footer ? (
        <NumericInputFooter
            isTwoColumn={isTwoColumn}
            testID={getPartTestID(testID, 'footer')}
        >
            {footer}
        </NumericInputFooter>
    ) : null;

    if (isTwoColumn) {
        // The body scrolls on its own, so the footer stays visible below the two columns
        return (
            <View
                testID={testID}
                onMouseDown={handleMouseDown}
                style={styles.flex1}
            >
                <ScrollView
                    testID={getPartTestID(testID, 'body')}
                    contentContainerStyle={[styles.flexGrow1, styles.flexRow]}
                    style={[styles.flex1, styles.ph5]}
                >
                    {main}
                    {pad}
                </ScrollView>
                {footerNode}
            </View>
        );
    }

    return (
        <ScrollView
            testID={testID}
            onMouseDown={handleMouseDown}
            // On touch screens the pad ends the body, so the bottom spacing belongs to the screen edge rather than to the pad or the
            // footer, and stays the same whether a footer follows the pad or not. Without a touch screen the footer owns it.
            contentContainerStyle={[styles.flexGrow1, canUseTouchScreen && styles.pb5]}
            style={[styles.flex1, styles.cursorAuto]}
            addBottomSafeAreaPadding
        >
            {/* The body only grows (`flexGrow1`, not `flex1`): its basis stays its content height and it never shrinks, so when the
                screen is shorter than the amount plus the pad, the content overflows and the scroll view scrolls instead of
                squeezing the amount under the pad */}
            <View
                testID={getPartTestID(testID, 'body')}
                style={styles.flexGrow1}
            >
                {main}
                {pad}
            </View>
            {footerNode}
        </ScrollView>
    );
}

export default NumericInputLayout;
