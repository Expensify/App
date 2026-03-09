type GetReportPaddingBottomParams = {
    isKeyboardActive: boolean;
    composerHeight: number;
    safePaddingBottom: number;
    isComposerFullSize?: boolean;
};

type GetReportPaddingBottom = (params: GetReportPaddingBottomParams) => number;

export type {GetReportPaddingBottomParams, GetReportPaddingBottom};
