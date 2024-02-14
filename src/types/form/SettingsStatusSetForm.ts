import type Form from './Form';

const INPUT_IDS = {
    EMOJI_CODE: 'emojiCode',
    STATUS_TEXT: 'statusText',
    clearAfter: 'clearAfter',
} as const;

type SettingsStatusSetForm = Form<{
    [INPUT_IDS.EMOJI_CODE]: string;
    [INPUT_IDS.STATUS_TEXT]: string;
    [INPUT_IDS.clearAfter]?: string;
}>;

// eslint-disable-next-line import/prefer-default-export
export type {SettingsStatusSetForm};
export default INPUT_IDS;
