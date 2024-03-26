import 'core-js/features/array/at';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {PDFPreviewer} from 'react-fast-pdf';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
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
    const prevWindowHeight = useRef(windowHeight);
    const {translate} = useLocalize();

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param {Boolean} isKeyboardOpen True if keyboard is open
     */
    const toggleKeyboardOnSmallScreens = useCallback(
        (isKBOpen: boolean) => {
            if (!isSmallScreenWidth) {
                return;
            }
            setIsKeyboardOpen(isKBOpen);
            onToggleKeyboard?.(isKeyboardOpen);
        },
        [isKeyboardOpen, isSmallScreenWidth, onToggleKeyboard],
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // shouldComponentUpdate(nextProps, nextState) {
    //     return !_.isEqual(state, nextState) || !_.isEqual(props, nextProps);
    // }

    useEffect(() => {
        if (!isKeyboardOpen && windowHeight < prevWindowHeight.current - 100) {
            toggleKeyboardOnSmallScreens(true);
        } else if (isKeyboardOpen && windowHeight > prevWindowHeight.current) {
            toggleKeyboardOnSmallScreens(false);
        }
    }, [isKeyboardOpen, toggleKeyboardOnSmallScreens, windowHeight]);

    const renderPDFView = () => {
        const outerContainerStyle = [styles.w100, styles.h100, styles.justifyContentCenter, styles.alignItemsCenter];

        return (
            <View
                style={outerContainerStyle}
                tabIndex={0}
            >
                <PDFPreviewer
                    contentContainerStyle={style}
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
