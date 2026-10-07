import {NumericFlipButton} from '@components/NumericButtons';
import type {NumericEditingRef} from '@components/NumericEditingController/types';
import NumericInput from '@components/NumericInput';
import type {NumericTextInputProps} from '@components/NumericInput/types';

import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import CONST from '@src/CONST';

import type {ReactNode, RefObject} from 'react';
import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {AdapterRootProps, AdapterTextInputProps, SymbolPosition} from './types';
import type {ParentOwnedSign} from './useParentOwnedSign';

import ParentOwnedMinusSign from './ParentOwnedMinusSign';
import ParentOwnedSignActions from './ParentOwnedSignActions';
import {getSizedAdornment} from './useParentOwnedSign';

const canUseTouchScreen = canUseTouchScreenUtil();

type FullScreenFormProps = {
    /** Props of the NumericInput root, already carrying the canonical signed value */
    root: AdapterRootProps;

    /** Ref of the NumericInput root */
    editingRef: RefObject<NumericEditingRef | null>;

    /** Props forwarded to `NumericInput.TextInput` */
    textInputProps: AdapterTextInputProps;

    /** Called when the text input is pressed */
    onPress?: NumericTextInputProps['onPress'];

    /** Symbol displayed beside the number, or an empty string for none */
    symbol: string;

    /** Position of the symbol relative to the input */
    symbolPosition: SymbolPosition;

    /** Style applied to the symbol text */
    symbolTextStyle?: StyleProp<TextStyle>;

    /** Whether to scale the font size down when the amount is long */
    shouldUseDynamicFontSize: boolean;

    /** Label of the currency button. The button renders only when it is set. */
    currencyButtonText?: string;

    /** Called when the currency button is pressed */
    onCurrencyButtonPress?: () => void;

    /** Accessibility label of the currency button */
    currencyButtonAccessibilityLabel?: string;

    /** Who owns the sign and which sign gestures the user may make */
    sign: ParentOwnedSign;

    /** Footer rendered at the bottom of the screen */
    footer?: ReactNode;
};

/**
 * Full-screen path of the legacy number form, rendered by the NumericInput root, which owns the screen layout: the error
 * placement, the actions row, the number pad and the footer. The adapter only maps the legacy props onto the root and its
 * amount row, and keeps a caller-owned sign beside the magnitude.
 */
function FullScreenForm({
    root,
    editingRef,
    textInputProps,
    onPress,
    symbol,
    symbolPosition,
    symbolTextStyle,
    shouldUseDynamicFontSize,
    currencyButtonText,
    onCurrencyButtonPress,
    currencyButtonAccessibilityLabel,
    sign,
    footer,
}: FullScreenFormProps) {
    const styles = useThemeStyles();
    const isSuffix = symbolPosition === CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX;

    const currencyButtonNode = currencyButtonText ? (
        <NumericInput.CurrencyButton
            currency={currencyButtonText}
            onPress={onCurrencyButtonPress}
            accessibilityLabel={currencyButtonAccessibilityLabel}
            isDisabled={false}
            style={styles.minWidth18}
        />
    ) : null;

    // A caller-owned sign flips through the caller, a sign kept inside the value through the root. Either one only on touch
    // screens, like the legacy form.
    let flipButtonNode = null;
    if (canUseTouchScreen && sign.flipParentSign) {
        flipButtonNode = (
            <NumericFlipButton
                onPress={sign.flipParentSign}
                style={styles.minWidth18}
            />
        );
    } else if (sign.shouldShowRootFlipButton) {
        flipButtonNode = <NumericInput.FlipButton style={styles.minWidth18} />;
    }

    const actionsNode =
        !!currencyButtonNode || !!flipButtonNode ? (
            <>
                {currencyButtonNode}
                {flipButtonNode}
            </>
        ) : undefined;

    const symbolNode = symbol ? <NumericInput.Symbol textStyle={symbolTextStyle}>{symbol}</NumericInput.Symbol> : null;

    // The legacy callers space their footer from the number pad themselves, while NumericInput already adds that gap, so the
    // adapter takes it back instead of doubling it
    const footerNode = footer ? <View style={[styles.w100, canUseTouchScreen && {marginTop: -styles.mt5.marginTop}]}>{footer}</View> : undefined;

    return (
        <NumericInput
            value={root.value}
            onInputChange={root.onInputChange}
            allowNegative={root.allowNegative}
            decimals={root.decimals}
            maxLength={root.maxLength}
            errorText={root.errorText}
            shouldUseDynamicFontSize={shouldUseDynamicFontSize}
            symbol={getSizedAdornment(symbol, sign)}
            ref={editingRef}
            actions={actionsNode}
            footer={footerNode}
        >
            {/* The root renders a sign kept inside the value; a caller-owned sign is rendered here, in the same place */}
            {sign.isSignOwnedByParent && <ParentOwnedMinusSign isNegative={sign.isParentNegative} />}
            {!isSuffix && symbolNode}
            <ParentOwnedSignActions setNumber={sign.setNumber}>
                <NumericInput.TextInput
                    {...textInputProps}
                    // The legacy form added no extra auto-grow space unless the caller asked for it
                    autoGrowExtraSpace={textInputProps.autoGrowExtraSpace ?? 0}
                    onPress={onPress}
                    onKeyPress={sign.handleKeyPress}
                />
            </ParentOwnedSignActions>
            {isSuffix && symbolNode}
        </NumericInput>
    );
}

export default FullScreenForm;
