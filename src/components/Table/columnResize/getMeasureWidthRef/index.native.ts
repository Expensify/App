/** Native columns are never measured, so there is nothing to read ahead of paint. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the parameter exists only to match the web signature
function getMeasureWidthRef(onWidth: (width: number) => void): ((node: unknown) => void) | undefined {
    return undefined;
}

export default getMeasureWidthRef;
