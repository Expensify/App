/** Requests money based on a distance (e.g. mileage from a map) */
function createDistanceRequest(
    report: OnyxEntry<OnyxTypes.Report>,
    participant: Participant,
    comment: string,
    created: string,
    category: string | undefined,
    tag: string | undefined,
    taxCode: string | undefined,
    taxAmount: number | undefined,
    amount: number,
    currency: string,
    merchant: string,
    billable: boolean | undefined,
    validWaypoints: WaypointCollection,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    customUnitRateID?: string,
) {
    // If the report is an iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

    const optimisticReceipt: Receipt = {
        source: ReceiptGeneric as ReceiptSource,
        state: CONST.IOU.RECEIPT_STATE.OPEN,
    };
    const {
        iouReport,
        chatReport,
        transaction,
        iouAction,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewAction,
        transactionThreadReportID,
        createdReportActionIDForThread,
        payerEmail,
        onyxData,
    } = getMoneyRequestInformation(
        currentChatReport,
        participant,
        comment,
        amount,
        currency,
        created,
        merchant,
        optimisticReceipt,
        undefined,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        policy,
        policyTagList,
        policyCategories,
        userAccountID,
        currentUserEmail,
        moneyRequestReportID,
    );

    const activeReportID = isMoneyRequestReport ? report?.reportID ?? '-1' : chatReport.reportID;
    const parameters: CreateDistanceRequestParams = {
        comment,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        waypoints: JSON.stringify(validWaypoints),
        created,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        transactionThreadReportID,
        createdReportActionIDForThread,
        payerEmail,
        customUnitRateID,
    };

    API.write(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    Navigation.dismissModal(activeReportID);
    Report.notifyNewAction(activeReportID, userAccountID);
}