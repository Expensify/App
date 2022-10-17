/**
 * Batch execution implementation
*/
#include "sqlbatchexecutor.h"

void jsiBatchParametersToQuickArguments(jsi::Runtime &rt, jsi::Array const &batchParams, vector<QuickQueryArguments> *commands)
{
  for (int i = 0; i < batchParams.length(rt); i++)
  {
    const jsi::Array &command = batchParams.getValueAtIndex(rt, i).asObject(rt).asArray(rt);
    if (command.length(rt) == 0)
    {
      continue;
    }

    const string query = command.getValueAtIndex(rt, 0).asString(rt).utf8(rt);
    const jsi::Value &commandParams = command.length(rt) > 1 ? command.getValueAtIndex(rt, 1) : jsi::Value::undefined();
    if (!commandParams.isUndefined() && commandParams.asObject(rt).isArray(rt) && commandParams.asObject(rt).asArray(rt).length(rt) > 0 && commandParams.asObject(rt).asArray(rt).getValueAtIndex(rt, 0).isObject())
    {
      // This arguments is an array of arrays, like a batch update of a single sql command.
      const jsi::Array &batchUpdateParams = commandParams.asObject(rt).asArray(rt);
      for (int x = 0; x < batchUpdateParams.length(rt); x++)
      {
        const jsi::Value &p = batchUpdateParams.getValueAtIndex(rt, x);
        vector<QuickValue> params;
        jsiQueryArgumentsToSequelParam(rt, p, &params);
        commands->push_back(QuickQueryArguments{
          query,
          make_shared<vector<QuickValue>>(params)
        });
      }
    }
    else
    {
      vector<QuickValue> params;
      jsiQueryArgumentsToSequelParam(rt, commandParams, &params);
      commands->push_back(QuickQueryArguments{
        query,
        make_shared<vector<QuickValue>>(params)
      });
    }
  }
}

SequelBatchOperationResult sqliteExecuteBatch(std::string dbName, vector<QuickQueryArguments> *commands)
{
  size_t commandCount = commands->size();
  if(commandCount <= 0)
  {
    return SequelBatchOperationResult {
      .type = SQLiteError,
      .message = "No SQL commands provided",
    };
  }

  try 
  {
    int affectedRows = 0;
    sqliteExecuteLiteral(dbName, "BEGIN EXCLUSIVE TRANSACTION");
    for(int i = 0; i<commandCount; i++) {
      auto command = commands->at(i);
      // We do not provide a datastructure to receive query data because we don't need/want to handle this results in a batch execution
      auto result = sqliteExecute(dbName, command.sql, command.params.get(), NULL, NULL);
      if(result.type == SQLiteError)
      {
        return SequelBatchOperationResult {
          .type = SQLiteError,
          .message = result.errorMessage,
        };
      } else 
      {
        affectedRows += result.rowsAffected;
      }
    }
    sqliteExecuteLiteral(dbName, "COMMIT");
    return SequelBatchOperationResult {
      .type = SQLiteOk,
      .affectedRows = affectedRows,
      .commands = (int) commandCount,
    };
  } catch(std::exception &exc)
  {
    sqliteExecuteLiteral(dbName, "ROLLBACK");
    return SequelBatchOperationResult {
      .type = SQLiteError,
      .message = exc.what(),
    };
  }
}
