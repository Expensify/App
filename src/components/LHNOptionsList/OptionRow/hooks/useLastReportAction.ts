import useOptionReportActions from './useOptionLastActions';

function useLastReportAction(reportID: string) {
    const reportActions = useOptionReportActions(reportID);
    return reportActions?.at(-1);
}

export default useLastReportAction;
