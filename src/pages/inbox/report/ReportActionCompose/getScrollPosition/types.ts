import type {TextInput} from 'react-native';

type TextInputScrollProps = {
    mobileInputScrollPosition: React.RefObject<number>;
    textInputRef: React.RefObject<HTMLDivElement | TextInput | null>;
};

type GetScrollPositionType = {scrollValue: number};

export type {TextInputScrollProps, GetScrollPositionType};
