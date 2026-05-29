// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <cstdint>
#include <limits>
#include <string>
#include <string_view>

#include "glaze/core/context.hpp"

namespace glz::repe
{
   struct header
   {
      uint64_t length{}; // Total length of [header, query, body]
      //
      uint16_t spec{0x1507}; // (5383) Magic two bytes to denote the REPE specification
      uint8_t version = 1; // REPE version
      uint8_t notify{}; // Action to take, multiple actions may be bit-packed together
      uint32_t reserved{}; // Must be zero
      //
      uint64_t id{}; // Identifier
      //
      uint64_t query_length{}; // The total length of the query (-1 denotes no size given)
      //
      uint64_t body_length{}; // The total length of the body (-1 denotes no size given)
      //
      uint16_t query_format{};
      uint16_t body_format{};
      error_code ec{};
   };

   static_assert(sizeof(header) == 48);

   // query and body are heap allocated and we want to be able to reuse memory
   struct message final
   {
      repe::header header{};
      std::string query{};
      std::string body{};

      operator bool() const { return bool(header.ec); }

      error_code error() const { return header.ec; }
   };

   // User interface that will be encoded into a REPE header
   struct user_header final
   {
      std::string_view query = ""; // The JSON pointer path to call or member to access/assign
      uint64_t id{}; // Identifier
      error_code ec{};
      bool notify{};
   };

   inline repe::header encode(const user_header& h) noexcept
   {
      repe::header ret{
         .notify = h.notify, //
         .id = h.id, //
         .query_length = h.query.size(), //
         .ec = h.ec //
      };
      return ret;
   }
}
