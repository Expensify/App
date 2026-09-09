import type IconAsset from '@src/types/utils/IconAsset';

type Emoji = {
    code: string;
    name: string;
    hexcode: string;
    types?: readonly string[];

    /**
     * Additional searchable names for this emoji that should rank as name matches in the suggestions.
     * Useful for emojis whose canonical `name` is not human-readable (e.g. `+1` / `-1`),
     */
    aliases?: readonly string[];
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
