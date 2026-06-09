import React, {useEffect, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
// We import these types directly from react-native because they are not re-exported by the project's
// preferred wrappers.
// eslint-disable-next-line no-restricted-imports
import type {LayoutChangeEvent, FlatList as RNFlatList, StyleProp, TextStyle, ViewabilityConfig, ViewStyle, ViewToken} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import FeatureTrainingModalContent from './FeatureTrainingModalContent';
import FeatureTrainingModalIllustration from './FeatureTrainingModalIllustration';
import type {BaseFeatureTrainingModalProps, FeatureTrainingModalPageProps} from './index';

// A page is considered "viewable" — and `currentPage` updates — only once it occupies at least
// 95% of the viewport. The viewability event fires for both user swipes and programmatic
// scrollToIndex once the scroll has practically settled on a new page.
const CAROUSEL_VIEWABILITY_CONFIG: ViewabilityConfig = {itemVisiblePercentThreshold: 95};

const CAROUSEL_DOT_SIZE = 6;

type FeatureTrainingModalCarouselBodyProps = Pick<
    BaseFeatureTrainingModalProps,
    | 'illustrationAspectRatio'
    | 'illustrationInnerContainerStyle'
    | 'illustrationOuterContainerStyle'
    | 'shouldRenderSVG'
    | 'shouldRenderHTMLDescription'
    | 'shouldShowDismissModalOption'
    | 'helpText'
    | 'onHelp'
    | 'shouldCallOnHelpWhenModalHidden'
    | 'helpSentryLabel'
    | 'confirmSentryLabel'
    | 'shouldShowConfirmationLoader'
    | 'canConfirmWhileOffline'
    | 'contentInnerContainerStyles'
    | 'contentOuterContainerStyles'
    | 'width'
> & {
    /** The carousel pages */
    pages: FeatureTrainingModalPageProps[];

    /** Padding for the modal */
    modalPadding: number;

    /** Style for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Whether the modal should be shown again */
    willShowAgain: boolean;

    /** Callback when the "Don't show me this again" option is toggled */
    toggleWillShowAgain: () => void;

    /** Callback to close the modal */
    closeModal: (didPressHelpButton?: boolean) => void;

    /** Callback fired when the user presses the confirm button on the LAST page */
    onConfirm: () => void;

    /** Called when the user swipes to a different page */
    onPageChange?: (index: number) => void;
};

function FeatureTrainingModalCarouselBody({
    pages,
    modalPadding,
    width = variables.featureTrainingModalWidth,
    titleStyles,
    illustrationAspectRatio,
    illustrationInnerContainerStyle,
    illustrationOuterContainerStyle,
    shouldRenderSVG = true,
    shouldRenderHTMLDescription = false,
    shouldShowDismissModalOption = false,
    helpText = '',
    onHelp = () => {},
    shouldCallOnHelpWhenModalHidden = false,
    helpSentryLabel,
    confirmSentryLabel,
    shouldShowConfirmationLoader = false,
    canConfirmWhileOffline = true,
    contentInnerContainerStyles,
    contentOuterContainerStyles,
    willShowAgain,
    toggleWillShowAgain,
    closeModal,
    onConfirm,
    onPageChange,
}: FeatureTrainingModalCarouselBodyProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Close']);
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowHeight, windowWidth} = useWindowDimensions();
    const isInLandscapeMode = isInLandscapeModeUtil(windowWidth, windowHeight);

    const [currentPage, setCurrentPage] = useState(0);
    const [carouselViewportWidth, setCarouselViewportWidth] = useState(0);
    const horizontalListRef = useRef<RNFlatList<FeatureTrainingModalPageProps>>(null);
    const lastReportedPage = useRef(0);

    // FlatList's `onViewableItemsChanged` must keep a stable identity (it errors otherwise).
    // The handler reads the latest `onPageChange` via a ref so the callback identity never changes.
    const onPageChangeRef = useRef(onPageChange);
    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);

    const onViewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken[]}) => {
        const entry = viewableItems.at(0);
        if (entry?.index == null || entry.index === lastReportedPage.current) {
            return;
        }
        lastReportedPage.current = entry.index;
        setCurrentPage(entry.index);
        onPageChangeRef.current?.(entry.index);
    };

    const advanceCarousel = () => {
        horizontalListRef.current?.scrollToIndex({index: Math.min(currentPage + 1, pages.length - 1), animated: true});
    };

    const goBack = () => {
        if (currentPage <= 0) {
            return;
        }
        horizontalListRef.current?.scrollToIndex({index: Math.max(currentPage - 1, 0), animated: true});
    };

    const handleConfirmPress = () => {
        if (currentPage < pages.length - 1) {
            advanceCarousel();
            return;
        }
        onConfirm();
    };

    const carouselPaginationDots = pages.map((_page, index) => (
        <View
            // The array is static for the modal's lifetime, so the index is a stable key.
            // eslint-disable-next-line react/no-array-index-key
            key={`carousel-dot-${index}`}
            style={StyleUtils.getFeatureTrainingCarouselDotStyle(CAROUSEL_DOT_SIZE, theme.buttonSuccessText, index === currentPage)}
        />
    ));

    const currentPageData = pages.at(currentPage);

    return (
        <View
            style={[
                styles.flex1,
                onboardingIsMediumOrLargerScreenWidth && StyleUtils.getWidthStyle(width),
                isInLandscapeMode ? {maxHeight: windowHeight * CONST.MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE} : styles.mh100,
            ]}
            onLayout={(e: LayoutChangeEvent) => {
                const newWidth = e.nativeEvent.layout.width;
                if (newWidth === carouselViewportWidth || newWidth <= 0) {
                    return;
                }
                setCarouselViewportWidth(newWidth);
            }}
        >
            {carouselViewportWidth > 0 && (
                <>
                    <FlatList
                        ref={horizontalListRef}
                        data={pages}
                        keyExtractor={(_page, index) => `FeatureTrainingModalIllustration-${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        viewabilityConfig={CAROUSEL_VIEWABILITY_CONFIG}
                        onViewableItemsChanged={onViewableItemsChanged}
                        getItemLayout={(_data, index) => ({length: carouselViewportWidth, offset: index * carouselViewportWidth, index})}
                        renderItem={({item: page}) => (
                            <View style={{width: carouselViewportWidth}}>
                                <FeatureTrainingModalIllustration
                                    animation={page.animation}
                                    animationStyle={page.animationStyle}
                                    videoURL={page.videoURL}
                                    image={page.image}
                                    contentFitImage={page.contentFitImage}
                                    imageWidth={page.imageWidth}
                                    imageHeight={page.imageHeight}
                                    illustrationAspectRatio={illustrationAspectRatio}
                                    illustrationInnerContainerStyle={illustrationInnerContainerStyle}
                                    illustrationOuterContainerStyle={illustrationOuterContainerStyle}
                                    shouldRenderSVG={shouldRenderSVG}
                                    modalPadding={modalPadding}
                                    paginationDots={carouselPaginationDots}
                                />
                            </View>
                        )}
                    />
                    <FeatureTrainingModalContent
                        title={currentPageData?.title}
                        subtitle={currentPageData?.subtitle}
                        description={currentPageData?.description}
                        secondaryDescription={currentPageData?.secondaryDescription}
                        confirmText={currentPageData?.confirmText ?? ''}
                        helpText={helpText}
                        onHelp={onHelp}
                        shouldCallOnHelpWhenModalHidden={shouldCallOnHelpWhenModalHidden}
                        helpSentryLabel={helpSentryLabel}
                        confirmSentryLabel={confirmSentryLabel}
                        shouldShowDismissModalOption={shouldShowDismissModalOption}
                        willShowAgain={willShowAgain}
                        toggleWillShowAgain={toggleWillShowAgain}
                        closeModal={closeModal}
                        confirmModal={handleConfirmPress}
                        shouldShowBackButton={currentPage > 0}
                        onBack={goBack}
                        shouldShowConfirmationLoader={shouldShowConfirmationLoader}
                        canConfirmWhileOffline={canConfirmWhileOffline}
                        titleStyles={titleStyles}
                        contentInnerContainerStyles={contentInnerContainerStyles}
                        contentOuterContainerStyles={contentOuterContainerStyles}
                        shouldRenderHTMLDescription={shouldRenderHTMLDescription}
                    />
                    <View style={[styles.pAbsolute, {top: modalPadding, right: modalPadding, zIndex: 1}]}>
                        <Tooltip text={translate('common.close')}>
                            <PressableWithFeedback
                                onPress={() => closeModal()}
                                role={CONST.ROLE.BUTTON}
                                accessibilityLabel={translate('common.close')}
                                sentryLabel="FeatureTrainingModal-Carousel-Close"
                                style={[styles.p2, styles.opacitySemiTransparent]}
                            >
                                <Icon
                                    src={expensifyIcons.Close}
                                    fill={theme.buttonSuccessText}
                                />
                            </PressableWithFeedback>
                        </Tooltip>
                    </View>
                </>
            )}
        </View>
    );
}

export default FeatureTrainingModalCarouselBody;
export type {FeatureTrainingModalCarouselBodyProps};
