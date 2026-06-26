import DiagonalAvatars from './DiagonalAvatars';
import HorizontalAvatars from './HorizontalAvatars';
import ProfileAvatar from './ProfileAvatar';
import SingleAvatar from './SingleAvatar';
import SubscriptAvatar from './SubscriptAvatar';

export {ProfileAvatar, SingleAvatar, SubscriptAvatar, DiagonalAvatars, HorizontalAvatars};

export default {
    Single: SingleAvatar,
    Subscript: SubscriptAvatar,
    Multiple: {
        Diagonal: DiagonalAvatars,
        Horizontal: HorizontalAvatars,
    },
};

export type {SingleAvatarProps} from './SingleAvatar';
export type {SubscriptAvatarProps} from './SubscriptAvatar';
export type {DiagonalAvatarsProps} from './DiagonalAvatars';
export type {HorizontalAvatarsProps, HorizontalStackingOptions} from './HorizontalAvatars';
