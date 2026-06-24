import type {ModalKind} from '@components/Overlay/libs/overlayStore';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import CONST from '@src/CONST';
import type {AnimationIn, AnimationOut} from './types';

const CENTERED_MODAL_TYPES = new Set<ModalKind>([
    CONST.MODAL.MODAL_TYPE.CONFIRM,
    CONST.MODAL.MODAL_TYPE.CENTERED,
    CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE,
    CONST.MODAL.MODAL_TYPE.CENTERED_SMALL,
    CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT,
]);

const KIND_BASE_ANIMATIONS: Record<ModalKind, {animationIn: AnimationIn; animationOut: AnimationOut}> = {
    [CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED]: {animationIn: 'slideInUp', animationOut: 'slideOutDown'},
    [CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED]: {animationIn: 'slideInRight', animationOut: 'slideOutRight'},
    [CONST.MODAL.MODAL_TYPE.CENTERED]: {animationIn: 'fadeIn', animationOut: 'fadeOut'},
    [CONST.MODAL.MODAL_TYPE.CENTERED_SMALL]: {animationIn: 'fadeIn', animationOut: 'fadeOut'},
    [CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT]: {animationIn: 'slideAndFadeInRight', animationOut: 'slideAndFadeOutRight'},
    [CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE]: {animationIn: 'fadeIn', animationOut: 'fadeOut'},
    [CONST.MODAL.MODAL_TYPE.CONFIRM]: {animationIn: 'fadeIn', animationOut: 'fadeOut'},
    [CONST.MODAL.MODAL_TYPE.FULLSCREEN]: {animationIn: 'slideAndFadeInRight', animationOut: 'slideAndFadeOutRight'},
};

type AnimationDefaults = {
    animationIn: AnimationIn;
    animationOut: AnimationOut;
    animationInTiming: number;
    animationOutTiming: number;
};

function useAnimationDefaults(kind: ModalKind): AnimationDefaults {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- per-kind animation timing keys off raw device width, not RHP narrow-mode.
    const {isSmallScreenWidth} = useResponsiveLayout();
    const base = KIND_BASE_ANIMATIONS[kind];
    const isRightDocked = kind === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;
    const isCentered = CENTERED_MODAL_TYPES.has(kind);
    if (!isRightDocked && !isCentered) {
        return {...base, animationInTiming: CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN, animationOutTiming: CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT};
    }
    const isFadeOnlyCentered = kind === CONST.MODAL.MODAL_TYPE.CONFIRM || kind === CONST.MODAL.MODAL_TYPE.CENTERED_SMALL;
    if (isSmallScreenWidth && !isFadeOnlyCentered) {
        return {
            ...base,
            animationInTiming: CONST.MODAL.ANIMATION_TIMING.NARROW_SLIDE_DURATION_IN_WEB,
            animationOutTiming: CONST.MODAL.ANIMATION_TIMING.NARROW_SLIDE_DURATION_OUT_WEB,
        };
    }
    if (isRightDocked) {
        return {
            animationIn: 'slideAndFadeInRight',
            animationOut: 'slideAndFadeOutRight',
            animationInTiming: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_IN_WEB,
            animationOutTiming: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB,
        };
    }
    return {...base, animationInTiming: CONST.MODAL.ANIMATION_TIMING.CENTERED_DURATION_IN_WEB, animationOutTiming: CONST.MODAL.ANIMATION_TIMING.CENTERED_DURATION_OUT_WEB};
}

export default useAnimationDefaults;
