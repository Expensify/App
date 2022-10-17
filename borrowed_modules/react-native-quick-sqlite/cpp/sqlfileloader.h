
/**
 * SQL File Loader
 * Utilizes the regular sqlite bridge to load an SQLFile inside a transaction
 *
*/

#include "JSIHelper.h"
#include "sqliteBridge.h"
SequelBatchOperationResult importSQLFile(std::string dbName, std::string fileLocation);