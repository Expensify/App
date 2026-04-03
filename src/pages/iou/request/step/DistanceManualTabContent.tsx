import React from 'react';
import Button from '@components/Button';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormRef} from '@components/NumberWithSymbolForm';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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

    return (
        <NumberWithSymbolForm
            ref={manualTextInputRef}
            numberFormRef={manualNumberFormRef}
            value={currentDistance?.toString()}
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
                    large
                    style={[styles.w100, styles.mt5]}
                    onPress={onSubmit}
                    text={translate('common.save')}
                    sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.DISTANCE_NEXT_BUTTON}
                />
            }
        />
    );
}

DistanceManualTabContent.displayName = 'DistanceManualTabContent';

export default DistanceManualTabContent;
