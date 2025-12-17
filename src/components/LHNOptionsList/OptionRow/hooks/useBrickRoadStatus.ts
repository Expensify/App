import useReportAttributes from '@hooks/useReportAttributes';

function useBrickRoadStatus(reportID: string) {
    const reportAttributes = useReportAttributes(reportID);

    return reportAttributes?.brickRoadStatus;
}

export default useBrickRoadStatus;
