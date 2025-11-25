import 'core-js/features/array/at';
// eslint-disable-next-line no-restricted-imports
import type {CSSProperties} from 'react';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {PDFPreviewer} from 'react-fast-pdf';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import {retrieveMaxCanvasArea, retrieveMaxCanvasHeight, retrieveMaxCanvasWidth} from '@userActions/CanvasSize';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import PDFPasswordForm from './PDFPasswordForm';
import type {PDFViewProps} from './types';

const LOADING_THUMBNAIL_HEIGHT = 250;
const LOADING_THUMBNAIL_WIDTH = 250;

function PDFView({onToggleKeyboard, fileName, onPress, isFocused, sourceURL, style, isUsedAsChatAttachment, onLoadError}: PDFViewProps) {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const prevWindowHeight = usePrevious(windowHeight);
    const {translate} = useLocalize();

    const [maxCanvasArea] = useOnyx(ONYXKEYS.MAX_CANVAS_AREA, {canBeMissing: true});
    const [maxCanvasHeight] = useOnyx(ONYXKEYS.MAX_CANVAS_HEIGHT, {canBeMissing: true});
    const [maxCanvasWidth] = useOnyx(ONYXKEYS.MAX_CANVAS_WIDTH, {canBeMissing: true});

    /**
     * On small screens notify parent that the keyboard has opened or closed.
     *
     * @param isKBOpen True if keyboard is open
     */
    const toggleKeyboardOnSmallScreens = useCallback(
        (isKBOpen: boolean) => {
            if (!shouldUseNarrowLayout) {
                return;
            }
            setIsKeyboardOpen(isKBOpen);
            onToggleKeyboard?.(isKBOpen);
        },
        [shouldUseNarrowLayout, onToggleKeyboard],
    );

    /**
     * Verify that the canvas limits have been calculated already, if not calculate them and put them in Onyx
     */
    const retrieveCanvasLimits = () => {
        if (!maxCanvasArea) {
            retrieveMaxCanvasArea();
        }

        if (!maxCanvasHeight) {
            retrieveMaxCanvasHeight();
        }

        if (!maxCanvasWidth) {
            retrieveMaxCanvasWidth();
        }
    };

    useEffect(() => {
        retrieveCanvasLimits();
        // This rule needs to be applied so that this effect is executed only when the component is mounted
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
                    isSmallScreen={shouldUseNarrowLayout}
                    maxCanvasWidth={maxCanvasWidth}
                    maxCanvasHeight={maxCanvasHeight}
                    maxCanvasArea={maxCanvasArea}
                    LoadingComponent={
                        <View
                            style={
                                isUsedAsChatAttachment && [
                                    styles.chatItemPDFAttachmentLoading,
                                    StyleUtils.getWidthAndHeightStyle(LOADING_THUMBNAIL_WIDTH, LOADING_THUMBNAIL_HEIGHT),
                                    styles.pRelative,
                                ]
                            }
                        >
                            <ActivityIndicator size="large" />
                        </View>
                    }
                    shouldShowErrorComponent={false}
                    onLoadError={onLoadError}
                    renderPasswordForm={({isPasswordInvalid, onSubmit, onPasswordChange}) => (
                        <PDFPasswordForm
                            isFocused={!!isFocused}
                            isPasswordInvalid={isPasswordInvalid}
                            onSubmit={onSubmit}
                            onPasswordUpdated={onPasswordChange}
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
            accessibilityRole={CONST.ROLE.BUTTON}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}

export default memo(PDFView);
