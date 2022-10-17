/**
 * SQL Batch execution implementation using default sqliteBridge implementation
*/
#include "JSIHelper.h"
#include "sqliteBridge.h"

using namespace std;
using namespace facebook;

struct QuickQueryArguments {
  string sql;
  shared_ptr<vector<QuickValue>> params;
};

/**
 * Local Helper method to translate JSI objects QuickQueryArguments datastructure 
 * MUST be called in the JavaScript Thread
*/
void jsiBatchParametersToQuickArguments(jsi::Runtime &rt, jsi::Array const &batchParams, vector<QuickQueryArguments> *commands);

/**
 * Execute a batch of commands in a exclusive transaction 
*/
SequelBatchOperationResult sqliteExecuteBatch(std::string dbName, vector<QuickQueryArguments> *commands);
