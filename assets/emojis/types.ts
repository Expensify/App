import IconAsset from '@src/types/utils/IconAsset';

type Emoji = {
    code: string;
    name: string;
    types?: string[];
};

type HeaderEmoji = {
    header: true;
    icon: IconAsset;
    code: string;
};

type PickerEmojis = Array<Emoji | HeaderEmoji>;

type EmojisList = Record<string, {keywords: string[]; name?: string}>;

export type {Emoji, HeaderEmoji, EmojisList, PickerEmojis};
