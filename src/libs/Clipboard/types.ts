type SetString = (text: string) => Promise<boolean>;
type SetHtml = (html: string, text: string) => void;
type CanSetHtml = () => boolean;

export type {SetString, CanSetHtml, SetHtml};
