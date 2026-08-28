type LetterInitial = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
type NumberInitial = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type Initial = LetterInitial | NumberInitial;

const DEFAULT_INITIAL: Initial = 'A';

function getInitialFromText(text: string | null | undefined): Initial {
    const match = text?.toUpperCase().match(/[A-Z0-9]/);
    const initial = match?.[0] as Initial | undefined;
    return initial ?? DEFAULT_INITIAL;
}

export {getInitialFromText, DEFAULT_INITIAL};
