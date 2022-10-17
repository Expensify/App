/*
 * sequel.cpp
 *
 * Created by Oscar Franco on 2021/03/07
 * Copyright (c) 2021 Oscar Franco
 *
 * This code is licensed under the MIT license
 */

#include "sqliteBridge.h"
#include <sstream>
#include <iostream>
#include <sqlite3.h>
#include <ctime>
#include <unistd.h>
#include <sys/stat.h>
#include <map>
#include "logs.h"
#include "folly/dynamic.h"
#include <folly/json.h>

using namespace std;
using namespace facebook;

map<string, sqlite3 *> dbMap = map<string, sqlite3 *>();

bool folder_exists(const std::string &foldername)
{
  struct stat buffer;
  return (stat(foldername.c_str(), &buffer) == 0);
}

/**
 * Portable wrapper for mkdir. Internally used by mkdir()
 * @param[in] path the full path of the directory to create.
 * @return zero on success, otherwise -1.
 */
int _mkdir(const char *path)
{
#if _POSIX_C_SOURCE
  return mkdir(path);
#else
  return mkdir(path, 0755); // not sure if this works on mac
#endif
}

/**
 * Recursive, portable wrapper for mkdir.
 * @param[in] path the full path of the directory to create.
 * @return zero on success, otherwise -1.
 */
int mkdir(const char *path)
{
  string current_level = "/";
  string level;
  stringstream ss(path);
  // First line is empty because it starts with /User
  getline(ss, level, '/');
  // split path using slash as a separator
  while (getline(ss, level, '/'))
  {
    current_level += level; // append folder to the current level
    // create current level
    if (!folder_exists(current_level) && _mkdir(current_level.c_str()) != 0)
      return -1;

    current_level += "/"; // don't forget to append a slash
  }

  return 0;
}

inline bool file_exists(const string &path)
{
  struct stat buffer;
  return (stat(path.c_str(), &buffer) == 0);
}

string get_db_path(string const dbName, string const docPath)
{
  mkdir(docPath.c_str());
  return docPath + "/" + dbName;
}

SQLiteOPResult sqliteOpenDb(string const dbName, string const docPath)
{
  string dbPath = get_db_path(dbName, docPath);

  int sqlOpenFlags = SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX;

  sqlite3 *db;
  int exit = 0;
  exit = sqlite3_open_v2(dbPath.c_str(), &db, sqlOpenFlags, nullptr);

  if (exit != SQLITE_OK)
  {
    return SQLiteOPResult{
      .type = SQLiteError,
      .errorMessage = sqlite3_errmsg(db)
    };
  }
  else
  {
    dbMap[dbName] = db;
  }

  return SQLiteOPResult{
      .type = SQLiteOk,
      .rowsAffected = 0
  };
}

SQLiteOPResult sqliteCloseDb(string const dbName)
{

  if (dbMap.count(dbName) == 0)
  {
    return SQLiteOPResult{
        .type = SQLiteError,
        .errorMessage = dbName + " is not open",
      };
  }

  sqlite3 *db = dbMap[dbName];

  sqlite3_close(db);

  dbMap.erase(dbName);

  return SQLiteOPResult{
      .type = SQLiteOk,
  };
}

SQLiteOPResult sqliteAttachDb(string const mainDBName, string const docPath, string const databaseToAttach, string const alias)
{
  /**
   * There is no need to check if mainDBName is opened because sqliteExecuteLiteral will do that.
   * */
  string dbPath = get_db_path(databaseToAttach, docPath);
  string statement = "ATTACH DATABASE '" + dbPath + "' AS " + alias;
  SequelLiteralUpdateResult result = sqliteExecuteLiteral(mainDBName, statement);
  if (result.type == SQLiteError)
  {
    return SQLiteOPResult{
        .type = SQLiteError,
        .errorMessage = mainDBName + " was unable to attach another database: " + string(result.message),
      };
  }
  return SQLiteOPResult{
      .type = SQLiteOk,
  };
}

SQLiteOPResult sqliteDetachDb(string const mainDBName, string const alias)
{
  /**
   * There is no need to check if mainDBName is opened because sqliteExecuteLiteral will do that.
   * */
  string statement = "DETACH DATABASE " + alias;
  SequelLiteralUpdateResult result = sqliteExecuteLiteral(mainDBName, statement);
  if (result.type == SQLiteError)
  {
    return SQLiteOPResult{
        .type = SQLiteError,
        .errorMessage = mainDBName + "was unable to detach database: " + string(result.message),
      };
  }
  return SQLiteOPResult{
      .type = SQLiteOk,
  };
}

SQLiteOPResult sqliteRemoveDb(string const dbName, string const docPath)
{
  if (dbMap.count(dbName) == 1)
  {
    SQLiteOPResult closeResult = sqliteCloseDb(dbName);
    if (closeResult.type == SQLiteError)
    {
      return closeResult;
    }
  }

  string dbPath = get_db_path(dbName, docPath);

  if (!file_exists(dbPath))
  {
    return SQLiteOPResult{
        .type = SQLiteOk,
        .errorMessage = "[react-native-quick-sqlite]: Database file not found" + dbPath
    };
  }

  remove(dbPath.c_str());

  return SQLiteOPResult{
    .type = SQLiteOk,
  };
}

void bindStatement(sqlite3_stmt *statement, vector<QuickValue> *values)
{
  LOGV("bind start");
  size_t size = values->size();
  if (size <= 0)
  {
    return;
  }

  for (int ii = 0; ii < size; ii++)
  {
    int sqIndex = ii + 1;
    QuickValue value = values->at(ii);
    QuickDataType dataType = value.dataType;
    if (dataType == NULL_VALUE)
    {
        LOGV("This is NULL");
        sqlite3_bind_null(statement, sqIndex);
    }
    else if (dataType == BOOLEAN)
    {
        LOGV("This is BOOLEAN");
        sqlite3_bind_int(statement, sqIndex, value.booleanValue);
    }
    else if (dataType == INTEGER)
    {
        LOGV("This is INTEGER");
        sqlite3_bind_int(statement, sqIndex, (int)value.doubleOrIntValue);
    }
    else if (dataType == DOUBLE)
    {
        LOGV("This is double");
        sqlite3_bind_double(statement, sqIndex, value.doubleOrIntValue);
    }
    else if (dataType == INT64)
    {
        LOGV("This is int");
        sqlite3_bind_int64(statement, sqIndex, value.int64Value);
    }
    else if (dataType == TEXT)
    {
        LOGV("This is str");
        sqlite3_bind_text(statement, sqIndex, value.textValue.c_str(), value.textValue.length(), SQLITE_TRANSIENT);
    }
    else if (dataType == ARRAY_BUFFER)
    {
        LOGV("This is AB");
      sqlite3_bind_blob(statement, sqIndex, value.arrayBufferValue.get(), value.arrayBufferSize, SQLITE_STATIC);
    } else if (dataType == ARRAY or dataType == OBJECT) {
      std::string str = folly::toJson(*value.json);
      LOGV(("This is the json -" + str + "-").c_str());
      sqlite3_bind_text(statement, sqIndex, str.c_str(), str.length(), SQLITE_TRANSIENT);
    }
  }
}

SQLiteOPResult sqliteExecute(string const dbName, string const &query, vector<QuickValue> *params, vector<map<string, QuickValue>> *results, vector<QuickColumnMetadata> *metadata)
{
  LOGV("exec start");
  // Check if db connection is opened
  if (dbMap.count(dbName) == 0)
  {
      LOGV("exec error count");
    return SQLiteOPResult{
        .type = SQLiteError,
        .errorMessage = "[react-native-quick-sqlite]: Database " + dbName + " is not open",
        .rowsAffected = 0
    };
  }

  sqlite3 *db = dbMap[dbName];

  // SQLite statements need to be compiled before executed
  sqlite3_stmt *statement;

  // Compile and move result into statement memory spot
  int statementStatus = sqlite3_prepare_v2(db, query.c_str(), -1, &statement, NULL);

  if (statementStatus == SQLITE_OK) // statemnet is correct, bind the passed parameters
  {
    bindStatement(statement, params);
  }
  else
  {
    const char *message = sqlite3_errmsg(db);
      LOGV("exec error prep");
    return SQLiteOPResult{
        .type = SQLiteError,
        .errorMessage = "[react-native-quick-sqlite] SQL preparing error: " + string(message) + " for query " + query,
        .rowsAffected = 0};
  }

  bool isConsuming = true;
  bool isFailed = false;

  int result, i, count, column_type;
  string column_name, column_declared_type;
  map<string, QuickValue> row;

  while (isConsuming)
  {
    result = sqlite3_step(statement);

    switch (result)
    {
    case SQLITE_ROW:
      if(results == NULL)
      {
        break;
      }
      
      i = 0;
      row = map<string, QuickValue>();
      count = sqlite3_column_count(statement);

      while (i < count)
      {
        column_type = sqlite3_column_type(statement, i);
        column_name = sqlite3_column_name(statement, i);

        switch (column_type)
        {

        case SQLITE_INTEGER:
        {
          /**
           * It's not possible to send a int64_t in a jsi::Value because JS cannot represent the whole number range.
           * Instead, we're sending a double, which can represent all integers up to 53 bits long, which is more
           * than what was there before (a 32-bit int).
           *
           * See https://github.com/ospfranco/react-native-quick-sqlite/issues/16 for more context.
           */
          double column_value = sqlite3_column_double(statement, i);
          row[column_name] = createIntegerQuickValue(column_value);
          break;
        }

        case SQLITE_FLOAT:
        {
          double column_value = sqlite3_column_double(statement, i);
          row[column_name] = createDoubleQuickValue(column_value);
          break;
        }

        case SQLITE_TEXT:
        {
          const char *column_value = reinterpret_cast<const char *>(sqlite3_column_text(statement, i));
          int byteLen = sqlite3_column_bytes(statement, i);
            auto str = string(column_value, byteLen);
            try { // Most likely we want to check if it's json somehow but haven't found yet how to do it
                auto patch = folly::parseJson(str.c_str());
                row[column_name] = createDynamicQuickValue(patch);
            } catch(folly::json::parse_error &e) { //It's not caught here for some reason???
                // Specify length too; in case string contains NULL in the middle (which SQLite supports!)
                row[column_name] = createTextQuickValue(str);
            } catch(std::runtime_error &error) {
              row[column_name] = createTextQuickValue(str);
            }
          break;
        }

        case SQLITE_BLOB:
        {
          int blob_size = sqlite3_column_bytes(statement, i);
          const void *blob = sqlite3_column_blob(statement, i);
          uint8_t *data;
          memcpy(data, blob, blob_size);
          row[column_name] = createArrayBufferQuickValue(data, blob_size);
          break;
        }

        case SQLITE_NULL:
        // Intentionally left blank to switch to default case
        default:
          row[column_name] = createNullQuickValue();
          break;
        }
        i++;
      }
      results->push_back(move(row));
      break;
    case SQLITE_DONE:
      if(metadata != NULL)
      {
        i = 0;
        count = sqlite3_column_count(statement);
        while (i < count)
        {
          column_name = sqlite3_column_name(statement, i);
          const char *tp = sqlite3_column_decltype(statement, i);
          column_declared_type = tp != NULL ? tp : "UNKNOWN";
          QuickColumnMetadata meta = {
            .colunmName = column_name,
            .columnIndex = i,
            .columnDeclaredType = column_declared_type,
          };
          metadata->push_back(meta);
          i++;
        }
      }
      isConsuming = false;
      break;

    default:
      isFailed = true;
      isConsuming = false;
    }
  }

  sqlite3_finalize(statement);

  if (isFailed)
  {
    const char *message = sqlite3_errmsg(db);
      LOGV(("exec error exec " + string(message) + "for query " + query).c_str());
    return SQLiteOPResult{
        .type = SQLiteError,
        .errorMessage = "[react-native-quick-sqlite] SQL execution error: " + string(message) + "for query " + query,
        .rowsAffected = 0,
        .insertId = 0
    };
  }

  int changedRowCount = sqlite3_changes(db);
  long long latestInsertRowId = sqlite3_last_insert_rowid(db);
  return SQLiteOPResult{
      .type = SQLiteOk,
      .rowsAffected = changedRowCount,
      .insertId = static_cast<double>(latestInsertRowId)};
}

SequelLiteralUpdateResult sqliteExecuteLiteral(string const dbName, string const &query)
{
  // Check if db connection is opened
  if (dbMap.count(dbName) == 0)
  {
    return {
        SQLiteError,
        "[react-native-quick-sqlite] Database not opened: " + dbName,
        0
    };
  }

  sqlite3 *db = dbMap[dbName];

  // SQLite statements need to be compiled before executed
  sqlite3_stmt *statement;

  // Compile and move result into statement memory spot
  int statementStatus = sqlite3_prepare_v2(db, query.c_str(), -1, &statement, NULL);

  if (statementStatus != SQLITE_OK) // statemnet is correct, bind the passed parameters
  {
    const char *message = sqlite3_errmsg(db);
    return {
        SQLiteError,
        "[react-native-quick-sqlite] SQL execution error: " + string(message),
        0};
  }

  bool isConsuming = true;
  bool isFailed = false;

  int result, i, count, column_type;
  string column_name;

  while (isConsuming)
  {
    result = sqlite3_step(statement);

    switch (result)
    {
    case SQLITE_ROW:
      isConsuming = true;
      break;

    case SQLITE_DONE:
      isConsuming = false;
      break;

    default:
      isFailed = true;
      isConsuming = false;
    }
  }

  sqlite3_finalize(statement);

  if (isFailed)
  {
    const char *message = sqlite3_errmsg(db);
    return {
        SQLiteError,
        "[react-native-quick-sqlite] SQL execution error: " + string(message),
        0};
  }

  int changedRowCount = sqlite3_changes(db);
  return {
      SQLiteOk,
      "",
      changedRowCount};
}
