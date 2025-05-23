import type {OnReportActionListLoadedInTests} from '@pages/home/report/ReportActionsList/testUtils';

const NOOP = () => {};

// eslint-disable-next-line import/no-mutable-exports
let onReportActionListLoadedInTests: OnReportActionListLoadedInTests = NOOP;
const setOnReportActionListLoadedInTests = (callback: OnReportActionListLoadedInTests) => {
    onReportActionListLoadedInTests = callback;
};

export {onReportActionListLoadedInTests, setOnReportActionListLoadedInTests};
