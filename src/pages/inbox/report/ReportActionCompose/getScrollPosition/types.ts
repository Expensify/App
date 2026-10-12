import type {ComponentRef} from 'react';
import type {TextInput} from 'react-native';

type TextInputScrollProps = {
    mobileInputScrollPosition: React.RefObject<number>;
    textInputRef: React.RefObject<HTMLDivElement | ComponentRef<typeof TextInput> | null>;
};

type GetScrollPositionType = {scrollValue: number};

export type {TextInputScrollProps, GetScrollPositionType};
