type OnReportActionListLoadedInTests = (reportID: string) => void;

const NOOP = () => {};

const onReportActionListLoadedInTests: OnReportActionListLoadedInTests = NOOP;
const setOnReportActionListLoadedInTests: (callback: OnReportActionListLoadedInTests) => void = NOOP;

export {onReportActionListLoadedInTests, setOnReportActionListLoadedInTests};
export type {OnReportActionListLoadedInTests};
