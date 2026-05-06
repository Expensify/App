import React from 'react';
import type {TextInput} from 'react-native';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';

type DistanceManualTabContentProps = {
    currentDistance: number | undefined;
    distanceUnit: Unit;
    onSubmit: () => void;
    manualFormError: string;
    onInputChange: () => void;
    manualTextInputRef: React.RefObject<BaseTextInputRef | null>;
    manualNumberFormRef: React.RefObject<NumberWithSymbolFormRef | null>;
};

function DistanceManualTabContent({currentDistance, distanceUnit, onSubmit, manualFormError, onInputChange, manualTextInputRef, manualNumberFormRef}: DistanceManualTabContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenHeight} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();

    const setInputRef = (ref: BaseTextInputRef | null) => {
        // eslint-disable-next-line no-param-reassign
        manualTextInputRef.current = ref;
        inputCallbackRef(ref as unknown as TextInput | null);
    };

    return (
        <NumberWithSymbolForm
            ref={setInputRef}
            numberFormRef={manualNumberFormRef}
            value={currentDistance?.toString()}
            shouldUseDynamicFontSize
            onInputChange={onInputChange}
            decimals={CONST.DISTANCE_DECIMAL_PLACES}
            symbol={distanceUnit}
            symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
            isSymbolPressable={false}
            symbolTextStyle={styles.textSupporting}
            style={styles.iouAmountTextInput}
            containerStyle={styles.iouAmountTextInputContainer}
            autoGrowExtraSpace={variables.w80}
            touchableInputWrapperStyle={styles.heightUndefined}
            errorText={manualFormError}
            accessibilityLabel={`${translate('common.distance')} (${translate(`common.${distanceUnit}`)})`}
            footer={
                <Button
                    success
                    allowBubble={false}
                    pressOnEnter
                    medium={isExtraSmallScreenHeight}
                    large={!isExtraSmallScreenHeight}
                    style={[styles.w100, canUseTouchScreen() ? styles.mt5 : styles.mt0]}
                    onPress={onSubmit}
                    text={translate('common.save')}
                    testID="next-button"
                    sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.DISTANCE_MANUAL_NEXT_BUTTON}
                />
            }
        />
    );
}

DistanceManualTabContent.displayName = 'DistanceManualTabContent';

export default DistanceManualTabContent;
