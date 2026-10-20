import useHtmlPaste from '@hooks/useHtmlPaste';
import type UseHtmlPaste from '@hooks/useHtmlPaste/types';

type HtmlPasteHandlerProps = {
    /** Ref to the input that should receive the pasted HTML */
    inputRef: Parameters<UseHtmlPaste>[0];

    /** Maximum length of the text input value after pasting */
    maxLength?: number;
};

/**
 * Renders nothing and exists only to scope `useHtmlPaste` to inputs that accept markdown.
 * The hook subscribes to reports so a pasted room mention resolves to its name, and a hook cannot be
 * called conditionally — so the call lives in a child that is only rendered when it is needed, keeping
 * plain text fields free of that subscription.
 */
function HtmlPasteHandler({inputRef, maxLength}: HtmlPasteHandlerProps) {
    useHtmlPaste(inputRef, undefined, true, maxLength);
    return null;
}

HtmlPasteHandler.displayName = 'HtmlPasteHandler';

export default HtmlPasteHandler;
