import CONST from '../CONST';
import colors from './colors';
import variables from './variables';

export default (type, windowDimensions) => {
    const isSmallScreen = windowDimensions.width < variables.mobileResponsiveWidthBreakpoint;

    let modalStyle;
    let modalContainerStyle;
    let swipeDirection;
    let animationIn;
    let animationOut;
    let hideBackdrop = false;
    let needsSafeAreaPadding = false;

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
            needsSafeAreaPadding = true;
            break;
        case CONST.MODAL.MODAL_TYPE.CREATE_MENU:
            modalStyle = {
                margin: 0,
                alignItems: 'center',
                justifyContent: 'flex-end',
                marginRight: isSmallScreen ? 0 : windowDimensions.width - variables.sideBarWidth,
                marginBottom: isSmallScreen ? 0 : 82,
            };
            modalContainerStyle = {
                width: isSmallScreen ? '100%' : variables.sideBarWidth - 40,
                borderTopLeftRadius: isSmallScreen ? 20 : 12,
                borderTopRightRadius: isSmallScreen ? 20 : 12,
                borderBottomLeftRadius: isSmallScreen ? 0 : 12,
                borderBottomRightRadius: isSmallScreen ? 0 : 12,
                borderWidth: isSmallScreen ? 0 : 1,
                borderColor: '#ECECEC',
                paddingTop: 12,
                paddingBottom: 12,
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: isSmallScreen ? 'none' : '0px 0px 10px 0px rgba(0, 0, 0, 0.025)',
            };

            hideBackdrop = !isSmallScreen;
            swipeDirection = undefined;
            animationIn = isSmallScreen ? 'slideInUp' : 'fadeInLeft';
            animationOut = isSmallScreen ? 'slideOutDown' : 'fadeOutLeft';
            break;
        default:
            modalStyle = {};
            modalContainerStyle = {};
            swipeDirection = 'down';
            animationIn = 'slideInUp';
            animationOut = 'slideOutDown';
    }

    return {
        modalStyle,
        modalContainerStyle,
        swipeDirection,
        animationIn,
        animationOut,
        needsSafeAreaPadding,
        hideBackdrop,
    };
};
