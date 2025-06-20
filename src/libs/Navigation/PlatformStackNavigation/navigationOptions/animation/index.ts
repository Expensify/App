const InternalPlatformAnimations = {
    SLIDE_FROM_LEFT: 'slide_from_left',
    SLIDE_FROM_RIGHT: 'slide_from_right',
    SLIDE_FROM_BOTTOM: 'slide_from_bottom',
    IOS_FROM_LEFT: 'ios_from_left',
    IOS_FROM_RIGHT: 'ios_from_right',
    SIMPLE_PUSH: 'simple_push',
    FADE: 'fade',
    NONE: 'none',
} as const;

const Animations = {
    SLIDE_FROM_LEFT: 'slide_from_left',
    SLIDE_FROM_RIGHT: 'slide_from_right',
    MODAL: 'modal',
    FADE: 'fade',
    NONE: 'none',
} as const;

export default Animations;
export {InternalPlatformAnimations};
