let clearIsReportActionLinked: () => void = () => {};

export const setClearIsReportActionLinked = (fn: () => void) => {
    clearIsReportActionLinked = fn;
};

export const getClearIsReportActionLinked = () => clearIsReportActionLinked;
