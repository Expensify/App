import CONST from '../CONST';
import colors from './colors';
import variables from './variables';
import themeColors from './themes/default';

export default (type, windowDimensions) => {
    const isSmallScreen = windowDimensions.width < variables.mobileResponsiveWidthBreakpoint;

    let modalStyle;
    let modalContainerStyle;
    let swipeDirection;
    let animationIn;
    let animationOut;
    let hideBackdrop = false;
    let shouldAddBottomSafeAreaPadding = false;
    let shouldAddTopSafeAreaPadding = false;

    switch (type) {
        case CONST.MODAL.MODAL_TYPE.CENTERED:
            // A centered modal is one that has a visible backdrop
            // and can be dismissed by clicking outside of the modal.
            // This modal should take up the entire visible area when
            // viewed on a smaller device (e.g. mobile or mobile web).
            modalStyle = {
                margin: 0,
                alignItems: 'center',
            };
            modalContainerStyle = {
                // Shadow Styles
                shadowColor: colors.black,
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.1,
                shadowRadius: 5,

                flex: 1,
                marginTop: isSmallScreen ? 0 : 20,
                marginBottom: isSmallScreen ? 0 : 20,
                borderRadius: isSmallScreen ? 0 : 12,
                borderWidth: isSmallScreen ? 1 : 0,
                overflow: 'hidden',
                width: isSmallScreen ? '100%' : windowDimensions.width - 40,
            };

            // The default swipe direction is swipeDown and by
            // setting this to undefined we effectively disable the
            // ability to swipe our modal
            swipeDirection = undefined;
            animationIn = isSmallScreen ? 'slideInRight' : 'fadeIn';
            animationOut = isSmallScreen ? 'slideOutRight' : 'fadeOut';
            shouldAddTopSafeAreaPadding = true;
            break;
        case CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED:
            modalStyle = {
                margin: 0,
                alignItems: 'center',
                justifyContent: 'flex-end',
            };
            modalContainerStyle = {
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingTop: 12,
                paddingBottom: 12,
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
                margin: 0,
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginRight: windowDimensions.width - variables.sideBarWidth,
                marginBottom: 100,
            };
            modalContainerStyle = {
                width: variables.sideBarWidth - 40,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: themeColors.border,
                paddingTop: 12,
                paddingBottom: 12,
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.025)',
            };

            hideBackdrop = true;
            swipeDirection = undefined;
            animationIn = 'fadeInLeft';
            animationOut = 'fadeOutLeft';
            break;
        default:
            modalStyle = {};
            modalContainerStyle = {};
            swipeDirection = 'down';
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
    }

    // The following declarations are meant only to facilitate the modal padding
    // calculation in the modal file.
    if (!modalContainerStyle.paddingTop) {
        modalContainerStyle = {...modalContainerStyle, paddingTop: 0};
    }
    if (!modalContainerStyle.paddingBottom) {
        modalContainerStyle = {...modalContainerStyle, paddingBottom: 0};
    }

    return {
        modalStyle,
        modalContainerStyle,
        swipeDirection,
        animationIn,
        animationOut,
        hideBackdrop,
        shouldAddBottomSafeAreaPadding,
        shouldAddTopSafeAreaPadding,
    };
};
