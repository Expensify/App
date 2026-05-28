import type IconAsset from '@src/types/utils/IconAsset';

type Emoji = {
    code: string;
    name: string;
    hexcode: string;
    types?: readonly string[];

    /**
     * Additional searchable names for this emoji that should rank as name matches in the suggestion trie.
     * Useful for emojis whose canonical `name` is not human-readable (e.g. `+1` / `-1`),
     * so they can also be discovered by typing readable prefixes like `thumbs_up`.
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
