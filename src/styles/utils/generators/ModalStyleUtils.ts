import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';

import {isMobile} from '@libs/Browser';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type ModalType from '@src/types/utils/ModalType';

import type {ViewStyle} from 'react-native';

import type StyleUtilGenerator from './types';

function getCenteredModalStyles(styles: ThemeStyles, windowWidth: number, isSmallScreenWidth: boolean, isFullScreenWhenSmall = false): ViewStyle {
    const modalStyles = styles.centeredModalStyles(isSmallScreenWidth, isFullScreenWhenSmall);

    return {
        borderWidth: modalStyles.borderWidth,
        width: isSmallScreenWidth ? '100%' : windowWidth - modalStyles.marginHorizontal * 2,
    };
}

type WindowDimensions = {
    windowWidth: number;
    windowHeight: number;
    isSmallScreenWidth: boolean;
    shouldUseNarrowLayout?: boolean;
};

type GetModalStyles = {
    modalStyle: ViewStyle;
    modalContainerStyle: ViewStyle;
    swipeDirection: ReanimatedModalProps['swipeDirection'];
    animationIn: ReanimatedModalProps['animationIn'];
    animationOut: ReanimatedModalProps['animationOut'];
    hideBackdrop: boolean;
    shouldAddTopSafeAreaMargin: boolean;
    shouldAddBottomSafeAreaMargin: boolean;
    shouldAddBottomSafeAreaPadding: boolean;
    shouldAddTopSafeAreaPadding: boolean;
};

type GetModalStylesOptions = {
    type: ModalType | undefined;
    windowDimensions: WindowDimensions;
    popoverAnchorPosition?: ViewStyle;
    innerContainerStyle?: ViewStyle;
    outerStyle?: ViewStyle;
    shouldUseModalPaddingStyle?: boolean;
    safeAreaOptions?: {
        shouldDisableBottomSafeAreaPadding?: boolean;
        modalOverlapsWithTopSafeArea?: boolean;
    };
    enableEdgeToEdgeBottomSafeAreaPadding?: boolean;
    shouldDisplayBelowModals?: boolean;
};

type GetModalStylesStyleUtil = {
    getModalStyles: (options: GetModalStylesOptions) => GetModalStyles;
};

const createModalStyleUtils: StyleUtilGenerator<GetModalStylesStyleUtil> = ({theme, styles}) => ({
    getModalStyles: ({
        type,
        windowDimensions,
        popoverAnchorPosition = {},
        innerContainerStyle = {},
        outerStyle = {},
        safeAreaOptions = {modalOverlapsWithTopSafeArea: false, shouldDisableBottomSafeAreaPadding: false},
        enableEdgeToEdgeBottomSafeAreaPadding = false,
        shouldDisplayBelowModals = false,
    }): GetModalStyles => {
        const {windowWidth, isSmallScreenWidth} = windowDimensions;

        // Wide layout: a 1px theme.border stroke around centered alert modals, matching the floating RHP cards.
        const centeredModalBorder = !isSmallScreenWidth ? {borderWidth: 1, borderColor: theme.border} : {};

        let modalStyle: GetModalStyles['modalStyle'] = {
            margin: 0,
            ...outerStyle,
            zIndex: variables.modalBaseZIndex,
        };

        let modalContainerStyle: GetModalStyles['modalContainerStyle'];
        let swipeDirection: GetModalStyles['swipeDirection'];
        let animationIn: GetModalStyles['animationIn'];
        let animationOut: GetModalStyles['animationOut'];
        let hideBackdrop = false;
        let shouldAddBottomSafeAreaMargin = false;
        let shouldAddTopSafeAreaMargin = false;
        let shouldAddBottomSafeAreaPadding = false;
        let shouldAddTopSafeAreaPadding = false;

        switch (type) {
            case CONST.MODAL.MODAL_TYPE.FULLSCREEN:
                modalStyle = {...modalStyle, height: '100%'};
                modalContainerStyle = {};
                swipeDirection = 'down';
                animationIn = 'slideInUp';
                animationOut = 'slideOutDown';
                break;
            case CONST.MODAL.MODAL_TYPE.CONFIRM:
                // A confirm modal is one that has a visible backdrop
                // and can be dismissed by clicking outside of the modal.
                modalStyle = {
                    ...modalStyle,
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                };
                modalContainerStyle = {
                    boxShadow: theme.shadow,
                    borderRadius: variables.componentBorderRadiusLarge,
                    overflow: 'hidden',
                    width: variables.sideBarWidth,
                    ...centeredModalBorder,
                };

                // setting this to undefined we effectively disable the
                // ability to swipe our modal
                swipeDirection = undefined;
                animationIn = 'fadeIn';
                animationOut = 'fadeOut';
                break;
            case CONST.MODAL.MODAL_TYPE.CENTERED:
                // A centered modal is one that has a visible backdrop
                // and can be dismissed by clicking outside of the modal.
                // This modal should take up the entire visible area when
                // viewed on a smaller device (e.g. mobile or mobile web).
                modalStyle = {
                    ...modalStyle,
                    alignItems: 'center',
                    height: '100%',
                };
                modalContainerStyle = {
                    boxShadow: theme.shadow,
                    flex: 1,
                    marginTop: isSmallScreenWidth ? 0 : 20,
                    marginBottom: isSmallScreenWidth ? 0 : 20,
                    borderRadius: isSmallScreenWidth ? 0 : variables.componentBorderRadiusLarge,
                    overflow: 'hidden',
                    ...getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth),
                };

                // Allow this modal to be dismissed with a swipe down or swipe right
                swipeDirection = ['down', 'right'];
                animationIn = isSmallScreenWidth ? 'slideInRight' : 'fadeIn';
                animationOut = isSmallScreenWidth ? 'slideOutRight' : 'fadeOut';
                shouldAddTopSafeAreaMargin = !isSmallScreenWidth;
                shouldAddBottomSafeAreaMargin = !isSmallScreenWidth;
                shouldAddTopSafeAreaPadding = isSmallScreenWidth;
                shouldAddBottomSafeAreaPadding = false;
                break;
            case CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT:
                // A centered modal is one that has a visible backdrop
                // and can be dismissed by clicking outside of the modal.
                // This modal should take up the entire visible area when
                // viewed on a smaller device (e.g. mobile or mobile web).
                modalStyle = {
                    ...modalStyle,
                    alignItems: 'center',
                    height: '100%',
                };
                modalContainerStyle = {
                    boxShadow: theme.shadow,
                    flex: 1,
                    marginTop: isSmallScreenWidth ? 0 : 20,
                    marginBottom: isSmallScreenWidth ? 0 : 20,
                    borderRadius: isSmallScreenWidth ? 0 : variables.componentBorderRadiusLarge,
                    overflow: 'hidden',
                    ...getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth),
                };

                // Allow this modal to be dismissed with a swipe to the right, required when we want to have a list in centered modal
                swipeDirection = ['right'];
                animationIn = isSmallScreenWidth ? 'slideInRight' : 'fadeIn';
                animationOut = isSmallScreenWidth ? 'slideOutRight' : 'fadeOut';
                shouldAddTopSafeAreaMargin = !isSmallScreenWidth;
                shouldAddBottomSafeAreaMargin = !isSmallScreenWidth;
                shouldAddTopSafeAreaPadding = isSmallScreenWidth;
                shouldAddBottomSafeAreaPadding = false;
                break;
            case CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE:
                // A centered modal that cannot be dismissed with a swipe.
                modalStyle = {
                    ...modalStyle,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                };
                modalContainerStyle = {
                    boxShadow: theme.shadow,
                    flex: 1,
                    marginTop: isSmallScreenWidth ? 0 : 20,
                    marginBottom: isSmallScreenWidth ? 0 : 20,
                    borderRadius: isSmallScreenWidth ? 0 : variables.componentBorderRadiusLarge,
                    overflow: 'hidden',
                    ...getCenteredModalStyles(styles, windowWidth, isSmallScreenWidth, true),
                };
                swipeDirection = undefined;
                animationIn = isSmallScreenWidth ? 'slideInRight' : 'fadeIn';
                animationOut = isSmallScreenWidth ? 'slideOutRight' : 'fadeOut';
                shouldAddTopSafeAreaMargin = !isSmallScreenWidth;
                shouldAddBottomSafeAreaMargin = !isSmallScreenWidth;
                shouldAddTopSafeAreaPadding = isSmallScreenWidth;
                shouldAddBottomSafeAreaPadding = false;
                break;
            case CONST.MODAL.MODAL_TYPE.CENTERED_SMALL:
                // A centered modal that takes up the minimum possible screen space on all devices
                modalStyle = {
                    ...modalStyle,
                    alignItems: 'center',
                    height: '100%',
                };
                modalContainerStyle = {
                    boxShadow: theme.shadow,
                    borderRadius: variables.componentBorderRadiusLarge,
                    borderWidth: 0,
                    marginTop: 'auto',
                    marginBottom: 'auto',
                    ...centeredModalBorder,
                };

                // Allow this modal to be dismissed with a swipe down or swipe right
                swipeDirection = ['down', 'right'];
                animationIn = 'fadeIn';
                animationOut = 'fadeOut';
                shouldAddTopSafeAreaMargin = false;
                shouldAddBottomSafeAreaMargin = false;
                shouldAddTopSafeAreaPadding = false;
                shouldAddBottomSafeAreaPadding = false;
                break;
            case CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED:
            case CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED_INSET:
                // Bottom-docked modals float: fully rounded, inset 8px on every side, and lifted above the safe area so they
                // sit on top of the home bar (the safe area is added as margin below the card, not padding inside it).
                // The horizontal and top insets are padding on the outer modal so the card's width:100% can never exceed
                // the viewport (avoids off-screen overflow for content-measured popovers).
                modalStyle = {
                    ...modalStyle,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    height: '100%',
                    paddingHorizontal: variables.bottomDockedInsetMargin,
                    paddingTop: variables.bottomDockedInsetMargin,
                    zIndex: shouldDisplayBelowModals ? variables.modalLowestZIndex : variables.modalBaseZIndex,
                };
                modalContainerStyle = {
                    width: '100%',
                    // Explicit numeric marginBottom so getModalPaddingStyles adds the safe area to it (instead of replacing it).
                    marginBottom: variables.bottomDockedInsetMargin,
                    borderRadius: variables.bottomDockedInsetBorderRadius,
                    borderWidth: 1,
                    borderColor: theme.border,
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: theme.shadow,
                    ...(isMobile() ? {maxHeight: `${windowDimensions.windowHeight}px`, height: 'fit-content'} : {}),
                };

                // Push the card above the home bar: the bottom safe area is added to the 8px bottom margin (below the
                // card), never as padding inside it. On mobile web there is no home bar, so the margin stays 8px.
                shouldAddBottomSafeAreaPadding = false;
                shouldAddBottomSafeAreaMargin = true;
                shouldAddTopSafeAreaMargin = !!safeAreaOptions?.modalOverlapsWithTopSafeArea;
                swipeDirection = undefined;
                animationIn = 'slideInUp';
                animationOut = 'slideOutDown';
                break;
            case CONST.MODAL.MODAL_TYPE.POPOVER:
                modalStyle = {
                    ...modalStyle,
                    ...popoverAnchorPosition,
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    zIndex: shouldDisplayBelowModals ? variables.modalLowestZIndex : variables.popoverZIndex,
                };
                modalContainerStyle = {
                    borderRadius: variables.componentBorderRadiusLarge,
                    borderWidth: 1,
                    borderColor: theme.border,
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: theme.shadow,
                };

                hideBackdrop = true;
                swipeDirection = undefined;
                animationIn = 'fadeIn';
                animationOut = 'fadeOut';
                break;
            case CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED: {
                // On wide layout the box is widened by the inset on both sides so the floating card inside is rhpWidth.
                const rightDockedBoxWidth = variables.rhpWidth + 2 * variables.rhpFloatingCardMargin;
                modalStyle = {
                    ...modalStyle,
                    marginLeft: isSmallScreenWidth ? 0 : windowWidth - rightDockedBoxWidth,
                    width: isSmallScreenWidth ? '100%' : rightDockedBoxWidth,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    height: '100%',
                    zIndex: variables.modalRightDockedZIndex,
                };
                modalContainerStyle = isSmallScreenWidth
                    ? {
                          width: '100%',
                          height: '100%',
                          overflow: 'hidden',
                      }
                    : {
                          // Floating RHP style, matching RightModalNavigator's skinny RHP.
                          flex: 1,
                          margin: variables.rhpFloatingCardMargin,
                          borderRadius: variables.componentBorderRadiusLarge,
                          borderWidth: 1,
                          borderColor: theme.border,
                          boxShadow: theme.shadow,
                          overflow: 'hidden',
                      };

                animationIn = 'slideInRight';
                animationOut = 'slideOutRight';

                swipeDirection = undefined;
                shouldAddBottomSafeAreaPadding = !enableEdgeToEdgeBottomSafeAreaPadding;
                shouldAddTopSafeAreaPadding = true;
                break;
            }
            default:
                modalStyle = {height: '100%'};
                modalContainerStyle = {};
                swipeDirection = 'down';
                animationIn = 'slideInUp';
                animationOut = 'slideOutDown';
        }

        modalContainerStyle = {...modalContainerStyle, ...innerContainerStyle};

        return {
            modalStyle,
            modalContainerStyle,
            swipeDirection,
            animationIn,
            animationOut,
            hideBackdrop,
            shouldAddTopSafeAreaMargin,
            shouldAddBottomSafeAreaMargin,
            shouldAddBottomSafeAreaPadding,
            shouldAddTopSafeAreaPadding,
        };
    },
});

export default createModalStyleUtils;
