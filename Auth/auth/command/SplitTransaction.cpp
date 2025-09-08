#include "../lib/Transaction.h"
#include "../lib/JSON/Value.h"
#include <auth/AuthCommand.h>

// Another example caller showing how to use the new parameter object pattern in a split scenario
class SplitTransaction : public AuthCommand {
public:
    JSON::Value processRequest(SQLite& db, const SData& request) {
        // Example of how split transaction would use the new parameter object
        
        JSON::Value splitResults(JSON::ARRAY);
        
        // Parse splits from request
        JSON::Value splitsArray = JSON::Value::parse(request["splits"]);
        
        for (size_t i = 0; i < splitsArray.size(); ++i) {
            const JSON::Value& split = splitsArray[i];
            
            // Create parameter object for each split
            Transaction::MoneyRequestParams splitParams;
            
            // Common transaction data (inherited from original)
            splitParams.transaction.currency = request["currency"];
            splitParams.transaction.created = request["created"];
            splitParams.transaction.merchant = request["merchant"];
            splitParams.transaction.description = split.getStringMemberWithDefault("description");
            
            // Split-specific amount
            splitParams.transaction.originalAmount = split.getStringMemberWithDefault("amount");
            
            // Split-specific report data
            splitParams.reports.newChatReportID = split.getIntMemberWithDefault("chatReportID");
            splitParams.reports.newMoneyRequestReportID = split.getIntMemberWithDefault("iouReportID");
            splitParams.reports.newReportActionID = split.getIntMemberWithDefault("reportActionID");
            splitParams.reports.createdChatReportActionID = split.getIntMemberWithDefault("createdChatReportActionID");
            splitParams.reports.createdIOUReportActionID = split.getIntMemberWithDefault("createdIOUReportActionID");
            splitParams.reports.newReportPreviewReportActionID = split.getIntMemberWithDefault("reportPreviewReportActionID");
            
            // Policy data
            splitParams.policy.policyID = request["policyID"];
            splitParams.policy.category = request["category"];
            splitParams.policy.tag = request["tag"];
            splitParams.policy.reimbursableBillableState = Transaction::toState(true, request.test("billable"));
            
            // Mark as split transaction
            splitParams.originalTransactionID = request["originalTransactionID"];
            splitParams.commentNVPs = JSON::Value(JSON::OBJECT);
            splitParams.commentNVPs["source"] = "split";
            splitParams.commentNVPs["originalTransactionID"] = request["originalTransactionID"];
            
            // Call the refactored function
            JSON::Value splitResult = Transaction::createMoneyRequest(
                db,
                request["authToken"],
                0, // No specific payer for splits in policy context
                request.calc64("payeeAccountID"),
                splitParams
            );
            
            splitResults.push_back(splitResult);
        }
        
        return JSON::Value({{"splits", splitResults}});
    }
};

// This example demonstrates another key benefit of the parameter object pattern:
// It's much easier to see the intent of different parameter combinations.
// For splits, we can clearly see:
// - Which parameters are split-specific (amount, reportIDs)
// - Which are inherited from the original (currency, merchant, category)
// - Which are special for splits (originalTransactionID, source marking)

// Compare this to the old approach where all 46 parameters would need to be passed
// individually for each split, making it very difficult to understand the relationship
// between the original transaction and its splits.