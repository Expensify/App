import CONST from '@src/CONST';

/** Lists report names one per line, each after a bullet, for the prompt of a confirm modal */
function formatReportNamesAsBulletList(reportNames: Iterable<string>): string {
    return Array.from(reportNames, (reportName) => `${CONST.DOT_SEPARATOR} ${reportName}`).join('\n');
}

export default formatReportNamesAsBulletList;
