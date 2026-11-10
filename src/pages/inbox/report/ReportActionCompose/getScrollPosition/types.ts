import type {ComposerRef} from '@components/Composer/types';

import type {ComponentRef} from 'react';
import type {TextInput} from 'react-native';

type TextInputScrollProps = {
    mobileInputScrollPosition: React.RefObject<number>;
    textInputRef: React.RefObject<HTMLDivElement | ComponentRef<typeof TextInput> | ComposerRef | null>;
};

type GetScrollPositionType = {scrollValue: number};

export type {TextInputScrollProps, GetScrollPositionType};
