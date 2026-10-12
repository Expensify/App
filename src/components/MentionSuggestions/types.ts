import type {Icon} from '@src/types/onyx/OnyxCommon';

type Mention = {
    /**
     * Main display text of the mention
     * always visible right after icon (if present)
     */
    text: string;

    /**
     * Additional text for the mention
     * visible if it's value is different than Mention.text value
     * rendered after Mention.text
     */
    alternateText: string;

    /**
     * Handle of the mention
     * used as a value for the mention (e.g. in for the filtering or putting the mention in the message)
     */
    handle?: string;

    /** Array of icons of the mention. If present, we use the first element of this array. For room suggestions, the icons are not used */
    icons?: Icon[];
};

export default Mention;
