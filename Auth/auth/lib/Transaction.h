#pragma once

#include <cstdint>
#include <string>
#include <map>
#include <set>
#include <vector>
#include <list>
#include "auth/lib/JSON/Value.h"

using namespace std;

class Transaction {
public:
    enum states {
        STATE_NOFLAG = 0,
        STATE_REIMBURSABLE = 1,
        STATE_BILLABLE = 2,
        STATE_REIMBURSABLE_BILLABLE = 3,
        STATE_REIMBURSABLE_LEGACY = 4,
        STATE_REIMBURSABLE_BILLABLE_LEGACY = 5
    };

    // Parameter object structure for createMoneyRequest function
    struct MoneyRequestParams {
        // Core transaction data
        struct TransactionData {
            string originalAmount;
            string currency;
            string created;
            string merchant;
            string description;
            int64_t mcc = 0;
            string externalID;
            string memo;
        } transaction;
        
        // Modified transaction data  
        struct ModifiedTransactionData {
            string modifiedAmount;
            string modifiedCurrency;
            string modifiedMerchant; 
            string modifiedCreated;
            int64_t modifiedMCC = 0;
        } modified;
        
        // Report-related data
        struct ReportData {
            int64_t newMoneyRequestReportID = 0;
            int64_t newChatReportID = 0;
            int64_t newReportActionID = 0;
            int64_t createdChatReportActionID = 0;
            int64_t createdIOUReportActionID = 0;
            int64_t newReportPreviewReportActionID = 0;
            int64_t transactionThreadReportID = 0;
            int64_t createdReportActionIDForThread = 0;
        } reports;
        
        // Receipt data
        struct ReceiptData {
            int64_t receiptID = 0;
            string receiptFilename;
            int64_t receiptState = 0;
            string receiptDetails;
            string uploadingIP;
            JSON::Value gps = JSON::Value(JSON::OBJECT);
        } receipt;
        
        // Policy and categorization
        struct PolicyData {
            string policyID;
            string category;
            string tag;
            states reimbursableBillableState = STATE_NOFLAG;
        } policy;
        
        // Flags and special cases
        struct Flags {
            bool isSendingMoney = false;
            bool alwaysCreateNewIOU = false;
            bool isTrackedExpense = false;
            bool isMoneyRequestReportCreatedForTravel = false;
            bool isTestDrive = false;
            bool isInAuthViolationsBeta = false;
        } flags;
        
        // Additional data
        string originalTransactionID;
        int64_t cardID = 0;
        JSON::Value commentNVPs = JSON::Value(JSON::OBJECT);
        string distanceComment;
        int64_t testDriveCommentReportActionID = 0;
    };

    // Updated function signature using parameter object
    static JSON::Value createMoneyRequest(SQLite& db,
                                         const string& authToken,
                                         const int64_t payerAccountID,
                                         int64_t payeeAccountID,
                                         const MoneyRequestParams& params);

    // Forward declarations for other existing methods
    // (These would be the other methods from the original Transaction class)
    
    // Constants and other members as needed
    static const string DETAILS;
    static const string NVP_ATTENDEES;
    static const string NVP_RTER_REJECTED_EXPENSE;
    
    // Other existing method declarations would go here...
    
    static bool verifyWrite(SQLite& db, const string& transactionIDList, const int64_t accountID, const int64_t maximumReportState);
    static bool verifyRead(SQLite& db, const string& transactionIDList, const int64_t accountID, const bool includeDeleted = false, const bool checkAll = false);
    static bool exists(SQLite& db, const string& transactionID);
    static string generateID(SQLite& db);
    // ... and many more methods from the original class
};

// Forward declaration for SQLite class
class SQLite;