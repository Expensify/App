import CONST from '@src/CONST';

type AvatarFunctionType = () => void;

type AvatarType = {
    source: string | AvatarFunctionType;
    type: typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    name: string;
    id: number | string;
    fallbackIcon: string | AvatarFunctionType;
};

export default AvatarType;
