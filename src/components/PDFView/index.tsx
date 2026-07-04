import {useAttachmentCarouselPagerActions, useAttachmentCarouselPagerState} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import LoadingIndicator from '@components/LoadingIndicator';
import MultiGestureCanvas from '@components/MultiGestureCanvas';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {isMobile} from '@libs/Browser';

import variables from '@styles/variables';

import {retrieveMaxCanvasArea, retrieveMaxCanvasHeight, retrieveMaxCanvasWidth} from '@userActions/CanvasSize';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Dimensions} from '@src/types/utils/Layout';

// eslint-disable-next-line no-restricted-imports
import type {CSSProperties, ReactNode} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {PDFPreviewer} from 'react-fast-pdf';
import {View} from 'react-native';
import {useAnimatedReaction, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type {PDFViewProps} from './types';

import PDFPasswordForm from './PDFPasswordForm';

const LOADING_THUMBNAIL_HEIGHT = 250;
const LOADING_THUMBNAIL_WIDTH = 250;
const PDF_MIN_SCALE = 1;
const PDF_SCROLL_DISABLED_SCALE = 2;
const PDF_ZOOM_RANGE = {max: 5};

type MobilePDFGestureCanvasProps = {
    children: (shouldDisablePDFScroll: boolean) => ReactNode;
    onScaleChanged?: (scale: number) => void;
};

function MobilePDFGestureCanvas({children, onScaleChanged}: MobilePDFGestureCanvasProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [canvasSize, setCanvasSize] = useState<Dimensions>();
    const isPagerScrollingFallback = useSharedValue(false);
    const isScrollEnabledFallback = useSharedValue(true);
    const isTransformGestureActive = useSharedValue(false);
    const state = useAttachmentCarouselPagerState();
    const actions = useAttachmentCarouselPagerActions();
    const [shouldDisablePDFScroll, setShouldDisablePDFScroll] = useState(false);
    const shouldDisablePDFScrollRef = useRef(false);
    const scaleRef = useRef(PDF_MIN_SCALE);
    const isTransformingRef = useRef(false);
    const lastScaleChangeSignalRef = useRef(PDF_MIN_SCALE);

    const updateShouldDisablePDFScroll = (shouldBlockScroll: boolean) => {
        if (shouldDisablePDFScrollRef.current === shouldBlockScroll) {
            return;
        }

        shouldDisablePDFScrollRef.current = shouldBlockScroll;
        setShouldDisablePDFScroll(shouldBlockScroll);
    };

    const notifyScaleChanged = (scale: number) => {
        if (lastScaleChangeSignalRef.current === scale) {
            return;
        }

        lastScaleChangeSignalRef.current = scale;
        onScaleChanged?.(scale);
        actions?.onScaleChanged?.(scale);
    };

    const updatePDFGestureState = () => {
        const shouldBlockScroll = isTransformingRef.current || scaleRef.current > PDF_MIN_SCALE;

        updateShouldDisablePDFScroll(shouldBlockScroll);
        notifyScaleChanged(shouldBlockScroll ? PDF_SCROLL_DISABLED_SCALE : PDF_MIN_SCALE);
    };

    const updateCanvasSize = ({
        nativeEvent: {
            layout: {width, height},
        },
    }: LayoutChangeEvent) => {
        if (!width || !height) {
            return;
        }

        setCanvasSize((prevCanvasSize) => {
            if (prevCanvasSize?.width === width && prevCanvasSize.height === height) {
                return prevCanvasSize;
            }

            return {width, height};
        });
    };

    const scaleChange = (scale: number) => {
        scaleRef.current = scale;
        updatePDFGestureState();
    };

    const transformGestureStateChange = (isTransforming: boolean) => {
        isTransformingRef.current = isTransforming;
        updatePDFGestureState();
    };

    useAnimatedReaction(
        () => isTransformGestureActive.get(),
        (isTransforming) => {
            scheduleOnRN(transformGestureStateChange, isTransforming);
        },
    );

    return (
        <View
            style={[styles.flex1, styles.w100, styles.h100]}
            onLayout={updateCanvasSize}
        >
            {!!canvasSize && (
                <MultiGestureCanvas
                    canvasSize={canvasSize}
                    contentSize={canvasSize}
                    zoomRange={PDF_ZOOM_RANGE}
                    pagerRef={state?.pagerRef}
                    isUsedInCarousel={!!state?.pagerRef}
                    shouldDisableTransformationGestures={state?.isPagerScrolling ?? isPagerScrollingFallback}
                    isTransformGestureActive={isTransformGestureActive}
                    isPagerScrollEnabled={state?.isScrollEnabled ?? isScrollEnabledFallback}
                    onTap={actions?.onTap}
                    onScaleChanged={scaleChange}
                    shouldDisableSwipeDownToClose
                    shouldPreventTouchEndDefault={false}
                    externalGestureHandler={state?.externalGestureHandler}
                >
                    <View style={StyleUtils.getWidthAndHeightStyle(canvasSize.width, canvasSize.height)}>{children(shouldDisablePDFScroll)}</View>
                </MultiGestureCanvas>
            )}
        </View>
    );
}

function PDFView({onToggleKeyboard, fileName, onPress, isFocused, onScaleChanged, sourceURL, style, isUsedInAttachmentModal, isUsedAsChatAttachment, onLoadError, rotation}: PDFViewProps) {
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const prevWindowHeight = usePrevious(windowHeight);
    const {translate} = useLocalize();

    const [maxCanvasArea] = useOnyx(ONYXKEYS.MAX_CANVAS_AREA);
    const [maxCanvasHeight] = useOnyx(ONYXKEYS.MAX_CANVAS_HEIGHT);
    const [maxCanvasWidth] = useOnyx(ONYXKEYS.MAX_CANVAS_WIDTH);
    const shouldUsePDFGestureZoom = isMobile() && !!isUsedInAttachmentModal && !isUsedAsChatAttachment;

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

        const renderPDFPreviewer = (shouldDisablePDFScroll = false) => {
            const contentContainerStyle = {
                ...(style as CSSProperties),
                ...(shouldDisablePDFScroll ? {touchAction: 'none'} : {}),
            };

            return (
                <PDFPreviewer
                    contentContainerStyle={contentContainerStyle}
                    file={sourceURL}
                    pageMaxWidth={variables.pdfPageMaxWidth}
                    isSmallScreen={shouldUseNarrowLayout}
                    maxCanvasWidth={maxCanvasWidth}
                    maxCanvasHeight={maxCanvasHeight}
                    maxCanvasArea={maxCanvasArea}
                    LoadingComponent={
                        <LoadingIndicator
                            style={
                                isUsedAsChatAttachment && [
                                    styles.chatItemPDFAttachmentLoading,
                                    StyleUtils.getWidthAndHeightStyle(LOADING_THUMBNAIL_WIDTH, LOADING_THUMBNAIL_HEIGHT),
                                    styles.pRelative,
                                ]
                            }
                        />
                    }
                    shouldShowErrorComponent={false}
                    onLoadError={onLoadError}
                    rotation={rotation}
                    renderPasswordForm={({isPasswordInvalid, onSubmit, onPasswordChange}) => (
                        <PDFPasswordForm
                            isFocused={!!isFocused}
                            isPasswordInvalid={isPasswordInvalid}
                            onSubmit={onSubmit}
                            onPasswordUpdated={onPasswordChange}
                        />
                    )}
                />
            );
        };

        const pdfPreviewer = renderPDFPreviewer();

        const mobilePDFGestureCanvas = (
            <MobilePDFGestureCanvas onScaleChanged={onScaleChanged}>{(shouldDisablePDFScroll) => renderPDFPreviewer(shouldDisablePDFScroll)}</MobilePDFGestureCanvas>
        );

        return (
            <View
                style={outerContainerStyle}
                tabIndex={0}
            >
                {shouldUsePDFGestureZoom ? mobilePDFGestureCanvas : pdfPreviewer}
            </View>
        );
    };

    if (shouldUsePDFGestureZoom) {
        return renderPDFView();
    }

    return onPress ? (
        <PressableWithoutFeedback
            onPress={() => onPress()}
            style={[styles.flex1, styles.flexRow, styles.alignSelfStretch]}
            accessibilityRole={CONST.ROLE.BUTTON}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            accessibilityLabel={fileName || translate('attachmentView.unknownFilename')}
            sentryLabel={CONST.SENTRY_LABEL.PDF_VIEW.DOCUMENT}
        >
            {renderPDFView()}
        </PressableWithoutFeedback>
    ) : (
        renderPDFView()
    );
}

export default memo(PDFView);
