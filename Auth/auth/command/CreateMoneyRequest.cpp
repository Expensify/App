#include "../lib/Transaction.h"
#include "../lib/JSON/Value.h"
#include <auth/AuthCommand.h>

// Example caller showing how to use the new parameter object pattern
class CreateMoneyRequest : public AuthCommand {
public:
    JSON::Value processRequest(SQLite& db, const SData& request) {
        // Example showing how a caller would be updated to use the new parameter object
        
        // BEFORE (old 46-parameter function call):
        /*
        JSON::Value result = Transaction::createMoneyRequest(
            db,
            request["authToken"],
            request.calc64("payerAccountID"),
            request.calc64("payeeAccountID"),
            request["originalAmount"],
            request["currency"],
            request["created"],
            request["merchant"],
            request.test("isSendingMoney"),
            request["description"],
            request["originalTransactionID"],
            request.test("alwaysCreateNewIOU"),
            request.calc64("newMoneyRequestReportID"),
            request.calc64("newChatReportID"),
            request["newTransactionID"],
            request.calc64("newReportActionID"),
            request.calc64("createdChatReportActionID"),
            request.calc64("createdIOUReportActionID"),
            request.calc64("newReportPreviewReportActionID"),
            request["policyID"],
            request.calc64("receiptID"),
            JSON::Value::parse(request["commentNVPs"]),
            request["category"],
            request["tag"],
            request["distanceComment"],
            Transaction::toState(request.test("reimbursable"), request.test("billable")),
            request.calc64("cardID"),
            request.calc64("transactionThreadReportID"),
            request.calc64("createdReportActionIDForThread"),
            request.calc64("mcc"),
            request["externalID"],
            request["memo"],
            request.calc64("modifiedMCC"),
            request["modifiedMerchant"],
            request["modifiedCreated"],
            request["modifiedAmount"],
            request["modifiedCurrency"],
            request.test("isTrackedExpense"),
            request["receiptFilename"],
            request.calc64("receiptState"),
            request["receiptDetails"],
            request["uploadingIP"],
            JSON::Value::parse(request["gps"]),
            request.test("isMoneyRequestReportCreatedForTravel"),
            request.test("isTestDrive"),
            request.calc64("testDriveCommentReportActionID"),
            request.test("isInAuthViolationsBeta")
        );
        */

        // AFTER (new parameter object approach):
        Transaction::MoneyRequestParams params;

        // Populate transaction data
        params.transaction.originalAmount = request["originalAmount"];
        params.transaction.currency = request["currency"];
        params.transaction.created = request["created"];
        params.transaction.merchant = request["merchant"];
        params.transaction.description = request["description"];
        params.transaction.mcc = request.calc64("mcc");
        params.transaction.externalID = request["externalID"];
        params.transaction.memo = request["memo"];

        // Populate modified transaction data
        params.modified.modifiedAmount = request["modifiedAmount"];
        params.modified.modifiedCurrency = request["modifiedCurrency"];
        params.modified.modifiedMerchant = request["modifiedMerchant"];
        params.modified.modifiedCreated = request["modifiedCreated"];
        params.modified.modifiedMCC = request.calc64("modifiedMCC");

        // Populate report data
        params.reports.newMoneyRequestReportID = request.calc64("newMoneyRequestReportID");
        params.reports.newChatReportID = request.calc64("newChatReportID");
        params.reports.newReportActionID = request.calc64("newReportActionID");
        params.reports.createdChatReportActionID = request.calc64("createdChatReportActionID");
        params.reports.createdIOUReportActionID = request.calc64("createdIOUReportActionID");
        params.reports.newReportPreviewReportActionID = request.calc64("newReportPreviewReportActionID");
        params.reports.transactionThreadReportID = request.calc64("transactionThreadReportID");
        params.reports.createdReportActionIDForThread = request.calc64("createdReportActionIDForThread");

        // Populate receipt data
        params.receipt.receiptID = request.calc64("receiptID");
        params.receipt.receiptFilename = request["receiptFilename"];
        params.receipt.receiptState = request.calc64("receiptState");
        params.receipt.receiptDetails = request["receiptDetails"];
        params.receipt.uploadingIP = request["uploadingIP"];
        params.receipt.gps = request["gps"].empty() ? JSON::Value(JSON::OBJECT) : JSON::Value::parse(request["gps"]);

        // Populate policy data
        params.policy.policyID = request["policyID"];
        params.policy.category = request["category"];
        params.policy.tag = request["tag"];
        params.policy.reimbursableBillableState = Transaction::toState(request.test("reimbursable"), request.test("billable"));

        // Populate flags
        params.flags.isSendingMoney = request.test("isSendingMoney");
        params.flags.alwaysCreateNewIOU = request.test("alwaysCreateNewIOU");
        params.flags.isTrackedExpense = request.test("isTrackedExpense");
        params.flags.isMoneyRequestReportCreatedForTravel = request.test("isMoneyRequestReportCreatedForTravel");
        params.flags.isTestDrive = request.test("isTestDrive");
        params.flags.isInAuthViolationsBeta = request.test("isInAuthViolationsBeta");

        // Populate additional data
        params.originalTransactionID = request["originalTransactionID"];
        params.cardID = request.calc64("cardID");
        params.commentNVPs = request["commentNVPs"].empty() ? JSON::Value(JSON::OBJECT) : JSON::Value::parse(request["commentNVPs"]);
        params.distanceComment = request["distanceComment"];
        params.testDriveCommentReportActionID = request.calc64("testDriveCommentReportActionID");

        // Now call the refactored function with much cleaner signature
        JSON::Value result = Transaction::createMoneyRequest(
            db,
            request["authToken"],
            request.calc64("payerAccountID"),
            request.calc64("payeeAccountID"),
            params
        );

        return result;
    }
};

// This demonstrates the dramatic improvement in readability and maintainability:
// BEFORE: 46 individual parameters that were hard to track and error-prone
// AFTER: 4 simple parameters + 1 well-organized parameter object

// Benefits of the refactored approach:
// 1. Much more readable function calls
// 2. Logical grouping of related parameters
// 3. Easier to add new parameters (just add to appropriate struct)
// 4. Self-documenting code through struct member names
// 5. Reduced chance of parameter order mistakes
// 6. Better IDE support with autocomplete and type checking