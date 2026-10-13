declare module 'micromatch' {
    function isMatch(path: string, pattern: string, options?: {dot?: boolean}): boolean;
    // eslint-disable-next-line import/prefer-default-export -- a default export would misrepresent micromatch's actual shape; this ambient declaration only needs to type the one function this repo calls
    export {isMatch};
}
