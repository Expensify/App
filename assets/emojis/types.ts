import type IconAsset from '@src/types/utils/IconAsset';

type Emoji = {
    code: string;
    name: string;
    types?: readonly string[];
};

type HeaderEmoji = {
    header: true;
    icon: IconAsset;
    code: string;
};

type PickerEmoji = Emoji | HeaderEmoji;

type PickerEmojis = PickerEmoji[];

type EmojisList = Record<string, {keywords: string[]; name?: string}>;

export type {Emoji, HeaderEmoji, EmojisList, PickerEmojis, PickerEmoji};
