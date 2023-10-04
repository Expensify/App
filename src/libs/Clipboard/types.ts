type SetString = (text: string) => void;

type Clipboard = {
    setString: SetString;
    canSetHtml: () => void;
    setHtml: (html: string, text: string) => void;
}

export type {SetString, Clipboard};