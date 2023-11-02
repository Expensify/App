import CONST from '@src/CONST';

type AvatarFunction = () => void;

type AvatarIcon = {
    source: string | AvatarFunction;
    type: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    name: string;
    id: number | string;
    fallbackIcon?: string | AvatarFunction;
};

export default AvatarIcon;
