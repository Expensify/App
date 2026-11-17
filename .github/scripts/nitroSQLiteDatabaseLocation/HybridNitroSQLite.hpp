#pragma once

#include <string>

// OnLoad.mm only needs these storage paths from the HybridObject implementation.
namespace margelo::nitro::rnnitrosqlite {
class HybridNitroSQLite {
public:
  static inline std::string docPath;
  static inline std::string migrationDocPath;
};
} // namespace margelo::nitro::rnnitrosqlite
