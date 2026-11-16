type SetString = (text: string) => Promise<boolean>;
type SetHtml = (html: string, text: string) => Promise<boolean>;
type CanSetHtml = (() => (...args: ClipboardItems) => Promise<void>) | (() => boolean);

export type {SetString, CanSetHtml, SetHtml};
