type ClearActionCallback = () => void;
let clearIsReportActionLinked: ClearActionCallback = () => {};
function setClearIsReportActionLinked(fn: ClearActionCallback): void {
    clearIsReportActionLinked = fn;
}
function getClearIsReportActionLinked(): ClearActionCallback {
    return clearIsReportActionLinked;
}
export {setClearIsReportActionLinked, getClearIsReportActionLinked};
