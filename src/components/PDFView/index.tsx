import 'core-js/features/array/at';
// eslint-disable-next-line no-restricted-imports
import type {CSSProperties} from 'react';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {PDFPreviewer} from 'react-fast-pdf';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import * as CanvasSize from '@userActions/CanvasSize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFPasswordForm from './PDFPasswordForm';
import type {PDFViewOnyxProps, PDFViewProps} from './types';

function PDFView({onToggleKeyboard, fileName, onPress, isFocused, sourceURL, errorLabelStyles, maxCanvasArea, maxCanvasHeight, maxCanvasWidth, style}: PDFViewProps) {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const styles = useThemeStyles();
    const {windowHeight, isSmallScreenWidth} = useWindowDimensions();
    const prevWindowHeight = usePrevious(windowHeight);
    const {translate} = useLocalize();

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param isKBOpen True if keyboard is open
     */
    const toggleKeyboardOnSmallScreens = useCallback(
        (isKBOpen: boolean) => {
            if (!isSmallScreenWidth) {
                return;
            }
            setIsKeyboardOpen(isKBOpen);
            onToggleKeyboard?.(isKBOpen);
        },
        [isSmallScreenWidth, onToggleKeyboard],
    );

    /**
     * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
     */
    const retrieveCanvasLimits = () => {
        if (!maxCanvasArea) {
            CanvasSize.retrieveMaxCanvasArea();
        }

        if (!maxCanvasHeight) {
            CanvasSize.retrieveMaxCanvasHeight();
        }

        if (!maxCanvasWidth) {
            CanvasSize.retrieveMaxCanvasWidth();
        }
    };

    useEffect(() => {
        retrieveCanvasLimits();
        // This rule needs to be applied so that this effect is executed only when the component is mounted
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Use window height changes to toggle the keyboard. To maintain keyboard state
        // on all platforms we also use focus/blur events. So we need to make sure here
        // that we avoid redundant keyboard toggling.
        // Minus 100px is needed to make sure that when the internet connection is
        // disabled in android chrome and a small 'No internet connection' text box appears,
        // we do not take it as a sign to open the keyboard
        if (!isKeyboardOpen && windowHeight < prevWindowHeight - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isKeyboardOpen && windowHeight > prevWindowHeight) {
            toggleKeyboardOnSmallScreens(false);
        }
    }, [isKeyboardOpen, prevWindowHeight, toggleKeyboardOnSmallScreens, windowHeight]);

    const renderPDFView = () => {
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        return (
            <View
                style={outerContainerStyle}
                tabIndex={0}
            >
                <PDFPreviewer
                    contentContainerStyle={style as CSSProperties}
                    file={sourceURL}
                    pageMaxWidth={variables.pdfPageMaxWidth}
                    isSmallScreen={isSmallScreenWidth}
                    maxCanvasWidth={maxCanvasWidth}
                    maxCanvasHeight={maxCanvasHeight}
                    maxCanvasArea={maxCanvasArea}
                    LoadingComponent={<FullScreenLoadingIndicator />}
                    ErrorComponent={<Text style={errorLabelStyles}>{translate('attachmentView.failedToLoadPDF')}</Text>}
                    renderPasswordForm={({isPasswordInvalid, onSubmit, onPasswordChange}) => (
                        <PDFPasswordForm
                            isFocused={!!isFocused}
                            isPasswordInvalid={isPasswordInvalid}
                            onSubmit={onSubmit}
                            onPasswordUpdated={onPasswordChange}
                            onPasswordFieldFocused={toggleKeyboardOnSmallScreens}
                        />
                    )}
                />
            </View>
        );
    };

    return onPress ? (
        <PressableWithoutFeedback
            onPress={onPress}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}

export default withOnyx<PDFViewProps, PDFViewOnyxProps>({
    maxCanvasArea: {
        key: ONYXKEYS.MAX_CANVAS_AREA,
    },
    maxCanvasHeight: {
        key: ONYXKEYS.MAX_CANVAS_HEIGHT,
    },
    maxCanvasWidth: {
        key: ONYXKEYS.MAX_CANVAS_WIDTH,
    },
})(memo(PDFView));
