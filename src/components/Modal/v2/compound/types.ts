import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type AnimationIn = 'fadeIn' | 'slideInUp' | 'slideInRight' | 'slideAndFadeInRight';
type AnimationOut = 'fadeOut' | 'slideOutDown' | 'slideOutRight' | 'slideAndFadeOutRight';

type SwipeDirection = ValueOf<typeof CONST.SWIPE_DIRECTION>;

export type {AnimationIn, AnimationOut, SwipeDirection};
