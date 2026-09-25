// jsdoc/require-jsdoc: with `contexts`, an interface or type alias needs its own block
type Undocumented = {
    value: string;
};

interface AlsoUndocumented {
    value: string;
}

export type {AlsoUndocumented, Undocumented};
