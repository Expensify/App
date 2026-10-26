type SetString = (text: string) => void;
type SetHtml = (html: string, text: string) => void;
type CanSetHtml = () => boolean;

export type {SetString, CanSetHtml, SetHtml};
