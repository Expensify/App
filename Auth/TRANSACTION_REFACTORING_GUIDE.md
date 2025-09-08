# Transaction::createMoneyRequest Refactoring Guide

## Overview
This document describes the complete refactoring of `Transaction::createMoneyRequest` from a 46-parameter function to use the Parameter Object pattern.

## Problem Statement
The original `Transaction::createMoneyRequest` function had **46 parameters**, making it:
- Extremely difficult to call correctly
- Error-prone due to parameter order confusion
- Hard to maintain and extend
- Poor developer experience with no clear parameter groupings

## Solution: Parameter Object Pattern
We've refactored the function to use a structured parameter object that logically groups related parameters.

### New Function Signature
```cpp
// BEFORE (46 parameters!)
JSON::Value createMoneyRequest(SQLite& db,
                              const string& authToken,
                              const int64_t payerAccountID,
                              int64_t payeeAccountID,
                              const string& originalAmount,
                              const string& currency,
                              const string& created,
                              const string& merchant,
                              const bool isSendingMoney,
                              const string& description,
                              // ... 36 more parameters ...
                              const bool isInAuthViolationsBeta);

// AFTER (4 core parameters + 1 structured object)
JSON::Value createMoneyRequest(SQLite& db,
                              const string& authToken,
                              const int64_t payerAccountID,
                              int64_t payeeAccountID,
                              const MoneyRequestParams& params);
```

## Parameter Object Structure

### MoneyRequestParams
The parameter object is organized into logical groups:

```cpp
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
```

## Migration Guide

### For Existing Callers

#### Step 1: Create Parameter Object
Instead of passing 46 individual parameters, create and populate a `MoneyRequestParams` object:

```cpp
// OLD WAY (DON'T USE):
Transaction::createMoneyRequest(
    db, authToken, payerID, payeeID,
    "10000", "USD", "2024-01-15", "Restaurant",
    false, "Business lunch", "", false,
    12345, 67890, "TXN123", 11111, 22222, 33333, 44444,
    "POL123", 98765, commentNVPs, "Meals", "Project A",
    "", Transaction::STATE_REIMBURSABLE, 54321,
    55555, 66666, 5812, "EXT123", "memo",
    0, "", "", "", "", true,
    "receipt.jpg", 1, "{}", "192.168.1.1", gpsData,
    false, false, 0, true
);

// NEW WAY (USE THIS):
Transaction::MoneyRequestParams params;

// Core transaction data
params.transaction.originalAmount = "10000";
params.transaction.currency = "USD";
params.transaction.created = "2024-01-15";
params.transaction.merchant = "Restaurant";
params.transaction.description = "Business lunch";
params.transaction.mcc = 5812;
params.transaction.externalID = "EXT123";
params.transaction.memo = "memo";

// Policy data
params.policy.policyID = "POL123";
params.policy.category = "Meals";
params.policy.tag = "Project A";
params.policy.reimbursableBillableState = Transaction::STATE_REIMBURSABLE;

// Flags
params.flags.isTrackedExpense = true;
params.flags.isInAuthViolationsBeta = true;

// Receipt data
params.receipt.receiptFilename = "receipt.jpg";
params.receipt.receiptState = 1;
params.receipt.uploadingIP = "192.168.1.1";
params.receipt.gps = gpsData;

// Report data
params.reports.newMoneyRequestReportID = 12345;
params.reports.newChatReportID = 67890;
// ... populate other report IDs as needed

// Call the function
Transaction::createMoneyRequest(db, authToken, payerID, payeeID, params);
```

#### Step 2: Update All Callers
Every file calling `Transaction::createMoneyRequest` must be updated to use the new signature.

Common files that may need updates:
- `auth/command/*.cpp` - Command handlers
- Split transaction logic
- Money request creation flows
- Test files

## Benefits Achieved

### 1. **Dramatically Improved Readability**
- Parameter groups are self-documenting
- Clear separation of concerns
- Easy to see what data belongs together

### 2. **Reduced Error Potential**
- No more parameter order mistakes
- Type safety within each group
- Default values prevent missing parameters

### 3. **Better Maintainability**
- Adding new parameters is easy (just add to appropriate struct)
- Removing parameters is safer
- Refactoring is less risky

### 4. **Enhanced Developer Experience**
- IDE autocomplete works better
- IntelliSense shows logical groupings
- Self-documenting code structure

### 5. **Easier Testing**
- Test data setup is more readable
- Parameter combinations are clearer
- Mock data creation is simplified

## Testing

### Compilation Test
Run the test file to verify the refactoring:
```bash
g++ -I. Auth/auth/test/TestTransactionRefactor.cpp -o test_refactor
./test_refactor
```

### Integration Testing
1. Verify all command handlers compile with new signature
2. Run existing money request creation tests
3. Test split transaction scenarios
4. Validate receipt upload flows

## Files Modified

### Core Files
- `Auth/auth/lib/Transaction.h` - Added `MoneyRequestParams` struct and new signature
- `Auth/auth/lib/Transaction.cpp` - Refactored implementation

### Example Callers (Update Pattern)
- `Auth/auth/command/CreateMoneyRequest.cpp` - Standard money request
- `Auth/auth/command/SplitTransaction.cpp` - Split transaction handling

### Testing
- `Auth/auth/test/TestTransactionRefactor.cpp` - Verification tests

## Rollback Plan
If issues arise, the old 46-parameter function signature can be temporarily restored while callers are fixed. However, the parameter object approach should be the permanent solution.

## Future Enhancements
With this structure in place, future improvements become easier:

1. **Builder Pattern**: Add fluent builders for common parameter combinations
2. **Validation**: Add parameter validation within the struct
3. **Serialization**: Add JSON serialization for debugging/logging
4. **Factory Methods**: Create factory methods for common scenarios

## Conclusion
This refactoring transforms an unwieldy 46-parameter function into a clean, maintainable, and developer-friendly API. The Parameter Object pattern provides:

- ✅ **Readable** function calls
- ✅ **Maintainable** code structure  
- ✅ **Extensible** parameter system
- ✅ **Type-safe** parameter groupings
- ✅ **Self-documenting** API

The investment in refactoring pays dividends in reduced bugs, faster development, and better code quality.