let clearIsReportActionLinked: () => void = () => {};

const setClearIsReportActionLinked = (fn: () => void) => {
    clearIsReportActionLinked = fn;
};

const getClearIsReportActionLinked = () => clearIsReportActionLinked;

export {setClearIsReportActionLinked, getClearIsReportActionLinked};
