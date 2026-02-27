type SetString = (text: string) => void;
type SetHtml = (html: string, text: string) => void;
type CanSetHtml = (() => (...args: ClipboardItems) => Promise<void>) | (() => boolean);

export type {SetString, CanSetHtml, SetHtml};
