import {CSSProperties} from 'react';
import {ViewStyle} from 'react-native';
import {ValueOf} from 'type-fest';
import {ModalProps} from 'react-native-modal';
import CONST from '../CONST';
import variables from './variables';
import themeColors from './themes/default';
import styles from './styles';

function getCenteredModalStyles(windowWidth: number, isSmallScreenWidth: boolean, isFullScreenWhenSmall = false): ViewStyle {
    return {
        borderWidth: styles.centeredModalStyles(isSmallScreenWidth, isFullScreenWhenSmall).borderWidth,
        width: isSmallScreenWidth ? '100%' : windowWidth - styles.centeredModalStyles(isSmallScreenWidth, isFullScreenWhenSmall).marginHorizontal * 2,
    };
}

type ModalType = ValueOf<typeof CONST.MODAL.MODAL_TYPE>;

type WindowDimensions = {
    windowWidth: number;
    windowHeight: number;
    isSmallScreenWidth: boolean;
    isMediumScreenWidth: boolean;
    isLargeScreenWidth: boolean;
};

type GetModalStyles = {
    modalStyle: ViewStyle;
    modalContainerStyle: ViewStyle | Pick<CSSProperties, 'boxShadow'>;
    swipeDirection: ModalProps['swipeDirection'];
    animationIn: ModalProps['animationIn'];
    animationOut: ModalProps['animationOut'];
    hideBackdrop: boolean;
    shouldAddTopSafeAreaMargin: boolean;
    shouldAddBottomSafeAreaMargin: boolean;
    shouldAddBottomSafeAreaPadding: boolean;
    shouldAddTopSafeAreaPadding: boolean;
};

export default function getModalStyles(
    type: ModalType,
    windowDimensions: WindowDimensions,
    popoverAnchorPosition: ViewStyle = {},
    innerContainerStyle: ViewStyle = {},
    outerStyle: ViewStyle = {},
): GetModalStyles {
    const {isSmallScreenWidth, windowWidth} = windowDimensions;

    let modalStyle: GetModalStyles['modalStyle'] = {
        margin: 0,
        ...outerStyle,
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
        case CONST.MODAL.MODAL_TYPE.CONFIRM:
            // A confirm modal is one that has a visible backdrop
            // and can be dismissed by clicking outside of the modal.
            modalStyle = {
                ...modalStyle,
                ...{
                    alignItems: 'center',
                },
            };
            modalContainerStyle = {
                // Shadow Styles
                shadowColor: themeColors.shadow,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.1,
                shadowRadius: 5,

                borderRadius: 12,
                overflow: 'hidden',
                width: variables.sideBarWidth,
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
                ...{
                    alignItems: 'center',
                },
            };
            modalContainerStyle = {
                // Shadow Styles
                shadowColor: themeColors.shadow,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.1,
                shadowRadius: 5,

                flex: 1,
                marginTop: isSmallScreenWidth ? 0 : 20,
                marginBottom: isSmallScreenWidth ? 0 : 20,
                borderRadius: isSmallScreenWidth ? 0 : 12,
                overflow: 'hidden',
                ...getCenteredModalStyles(windowWidth, isSmallScreenWidth),
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
        case CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE:
            // A centered modal that cannot be dismissed with a swipe.
            modalStyle = {
                ...modalStyle,
                ...{
                    alignItems: 'center',
                },
            };
            modalContainerStyle = {
                // Shadow Styles
                shadowColor: themeColors.shadow,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.1,
                shadowRadius: 5,

                flex: 1,
                marginTop: isSmallScreenWidth ? 0 : 20,
                marginBottom: isSmallScreenWidth ? 0 : 20,
                borderRadius: isSmallScreenWidth ? 0 : 12,
                overflow: 'hidden',
                ...getCenteredModalStyles(windowWidth, isSmallScreenWidth, true),
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
                ...{
                    alignItems: 'center',
                },
            };
            modalContainerStyle = {
                // Shadow Styles
                shadowColor: themeColors.shadow,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.1,
                shadowRadius: 5,

                borderRadius: 12,
                borderWidth: 0,
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
            modalStyle = {
                ...modalStyle,
                ...{
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                },
            };
            modalContainerStyle = {
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 12,
                justifyContent: 'center',
                overflow: 'hidden',
            };

            shouldAddBottomSafeAreaPadding = true;
            swipeDirection = undefined;
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
            break;
        case CONST.MODAL.MODAL_TYPE.POPOVER:
            modalStyle = {
                ...modalStyle,
                ...popoverAnchorPosition,
                ...{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                },
            };
            modalContainerStyle = {
                borderRadius: 12,
                borderWidth: 1,
                borderColor: themeColors.border,
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: variables.popoverMenuShadow,
            };

            hideBackdrop = true;
            swipeDirection = undefined;
            animationIn = 'fadeIn';
            animationOut = 'fadeOut';
            break;
        case CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED:
            modalStyle = {
                ...modalStyle,
                ...{
                    marginLeft: isSmallScreenWidth ? 0 : windowWidth - variables.sideBarWidth,
                    width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                },
            };
            modalContainerStyle = {
                width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
                height: '100%',
                overflow: 'hidden',
            };

            animationIn = {
                from: {
                    translateX: isSmallScreenWidth ? windowWidth : variables.sideBarWidth,
                },
                to: {
                    translateX: 0,
                },
            };
            animationOut = {
                from: {
                    translateX: 0,
                },
                to: {
                    translateX: isSmallScreenWidth ? windowWidth : variables.sideBarWidth,
                },
            };
            hideBackdrop = true;
            swipeDirection = undefined;
            shouldAddBottomSafeAreaPadding = true;
            shouldAddTopSafeAreaPadding = true;
            break;
        default:
            modalStyle = {};
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
}
