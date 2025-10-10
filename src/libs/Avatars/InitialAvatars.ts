/* eslint-disable @typescript-eslint/naming-convention */
import type {SvgProps} from 'react-native-svg';
import * as WorkspaceDefaultAvatars from '@components/Icon/WorkspaceDefaultAvatars';

type LetterInitial = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';
type NumberInitial = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type Initial = LetterInitial | NumberInitial;

const DEFAULT_INITIAL: Initial = 'A';

const INITIAL_AVATARS: Record<Initial, React.FC<SvgProps>> = {
    A: WorkspaceDefaultAvatars.WorkspaceA,
    B: WorkspaceDefaultAvatars.WorkspaceB,
    C: WorkspaceDefaultAvatars.WorkspaceC,
    D: WorkspaceDefaultAvatars.WorkspaceD,
    E: WorkspaceDefaultAvatars.WorkspaceE,
    F: WorkspaceDefaultAvatars.WorkspaceF,
    G: WorkspaceDefaultAvatars.WorkspaceG,
    H: WorkspaceDefaultAvatars.WorkspaceH,
    I: WorkspaceDefaultAvatars.WorkspaceI,
    J: WorkspaceDefaultAvatars.WorkspaceJ,
    K: WorkspaceDefaultAvatars.WorkspaceK,
    L: WorkspaceDefaultAvatars.WorkspaceL,
    M: WorkspaceDefaultAvatars.WorkspaceM,
    N: WorkspaceDefaultAvatars.WorkspaceN,
    O: WorkspaceDefaultAvatars.WorkspaceO,
    P: WorkspaceDefaultAvatars.WorkspaceP,
    Q: WorkspaceDefaultAvatars.WorkspaceQ,
    R: WorkspaceDefaultAvatars.WorkspaceR,
    S: WorkspaceDefaultAvatars.WorkspaceS,
    T: WorkspaceDefaultAvatars.WorkspaceT,
    U: WorkspaceDefaultAvatars.WorkspaceU,
    V: WorkspaceDefaultAvatars.WorkspaceV,
    W: WorkspaceDefaultAvatars.WorkspaceW,
    X: WorkspaceDefaultAvatars.WorkspaceX,
    Y: WorkspaceDefaultAvatars.WorkspaceY,
    Z: WorkspaceDefaultAvatars.WorkspaceZ,
    '0': WorkspaceDefaultAvatars.Workspace0,
    '1': WorkspaceDefaultAvatars.Workspace1,
    '2': WorkspaceDefaultAvatars.Workspace2,
    '3': WorkspaceDefaultAvatars.Workspace3,
    '4': WorkspaceDefaultAvatars.Workspace4,
    '5': WorkspaceDefaultAvatars.Workspace5,
    '6': WorkspaceDefaultAvatars.Workspace6,
    '7': WorkspaceDefaultAvatars.Workspace7,
    '8': WorkspaceDefaultAvatars.Workspace8,
    '9': WorkspaceDefaultAvatars.Workspace9,
};

function getInitialFromText(text: string | null | undefined): Initial {
    const match = text?.toUpperCase().match(/[A-Z0-9]/);
    const initial = match?.[0] as Initial | undefined;
    return initial ?? DEFAULT_INITIAL;
}

function getInitialAvatarSvg(initialOrText: string): React.FC<SvgProps> {
    return INITIAL_AVATARS[getInitialFromText(initialOrText)];
}

export {getInitialAvatarSvg, getInitialFromText, DEFAULT_INITIAL};

export type {Initial};
