// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <algorithm>
#include <array>
#include <chrono>
#include <cstring>
#include <functional>
#include <memory>
#include <string>
#include <string_view>
#include <unordered_map>
#include <vector>

// Optional OpenSSL support - detected at compile time
#if defined(GLZ_ENABLE_OPENSSL) && __has_include(<openssl/sha.h>)
#include <openssl/sha.h>
#define GLZ_HAS_OPENSSL

// To deconflict Windows.h
#ifdef DELETE
#undef DELETE
#endif
#endif

#include "glaze/base64/base64.hpp"
#include "glaze/ext/glaze_asio.hpp"
#include "glaze/net/http_router.hpp"

namespace glz
{
   // WebSocket opcode constants
   enum class ws_opcode : uint8_t { continuation = 0x0, text = 0x1, binary = 0x2, close = 0x8, ping = 0x9, pong = 0xa };

   // WebSocket close codes
   enum class ws_close_code : uint16_t {
      normal = 1000,
      going_away = 1001,
      protocol_error = 1002,
      unsupported_data = 1003,
      invalid_payload = 1007,
      policy_violation = 1008,
      message_too_big = 1009,
      mandatory_extension = 1010,
      internal_error = 1011
   };

   // WebSocket frame header helper
   struct ws_frame_header
   {
      uint8_t data[2];

      ws_frame_header() { reset(); }

      void reset()
      {
         data[0] = 0;
         data[1] = 0;
      }

      void fin(bool v) { data[0] = (data[0] & ~0x80) | (v ? 0x80 : 0); }
      void opcode(ws_opcode v) { data[0] = (data[0] & ~0x0F) | (static_cast<uint8_t>(v) & 0x0F); }
      void mask(bool v) { data[1] = (data[1] & ~0x80) | (v ? 0x80 : 0); }
      void payload_len(uint8_t v) { data[1] = (data[1] & ~0x7F) | (v & 0x7F); }

      bool fin() const { return (data[0] & 0x80) != 0; }
      ws_opcode opcode() const { return static_cast<ws_opcode>(data[0] & 0x0F); }
      bool mask() const { return (data[1] & 0x80) != 0; }
      uint8_t payload_len() const { return data[1] & 0x7F; }
   };

   // WebSocket utilities
   namespace ws_util
   {
#if !defined(GLZ_ENABLE_OPENSSL)
      // Fallback SHA-1 implementation when OpenSSL is not available
      namespace fallback_sha1
      {
         struct sha1_context
         {
            uint32_t state[5];
            uint32_t count[2];
            uint8_t buffer[64];
         };

         inline void sha1_init(sha1_context* context)
         {
            context->state[0] = 0x67452301;
            context->state[1] = 0xEFCDAB89;
            context->state[2] = 0x98BADCFE;
            context->state[3] = 0x10325476;
            context->state[4] = 0xC3D2E1F0;
            context->count[0] = context->count[1] = 0;
         }

         inline void sha1_process(sha1_context* context, const uint8_t data[64])
         {
            uint32_t w[80], a, b, c, d, e, temp;

            for (int i = 0; i < 16; i++) {
               w[i] = (data[i * 4] << 24) | (data[i * 4 + 1] << 16) | (data[i * 4 + 2] << 8) | data[i * 4 + 3];
            }

            for (int i = 16; i < 80; i++) {
               w[i] = w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16];
               w[i] = (w[i] << 1) | (w[i] >> 31);
            }

            a = context->state[0];
            b = context->state[1];
            c = context->state[2];
            d = context->state[3];
            e = context->state[4];

            for (int i = 0; i < 80; i++) {
               if (i < 20) {
                  temp = ((a << 5) | (a >> 27)) + ((b & c) | (~b & d)) + e + w[i] + 0x5A827999;
               }
               else if (i < 40) {
                  temp = ((a << 5) | (a >> 27)) + (b ^ c ^ d) + e + w[i] + 0x6ED9EBA1;
               }
               else if (i < 60) {
                  temp = ((a << 5) | (a >> 27)) + ((b & c) | (b & d) | (c & d)) + e + w[i] + 0x8F1BBCDC;
               }
               else {
                  temp = ((a << 5) | (a >> 27)) + (b ^ c ^ d) + e + w[i] + 0xCA62C1D6;
               }

               e = d;
               d = c;
               c = (b << 30) | (b >> 2);
               b = a;
               a = temp;
            }

            context->state[0] += a;
            context->state[1] += b;
            context->state[2] += c;
            context->state[3] += d;
            context->state[4] += e;
         }

         inline void sha1_update(sha1_context* context, const uint8_t* data, size_t len)
         {
            size_t i = 0;
            size_t j = (context->count[0] >> 3) & 63;

            if ((context->count[0] += uint32_t(len << 3)) < (len << 3)) context->count[1]++;
            context->count[1] += (len >> 29);

            if ((j + len) > 63) {
               std::memcpy(&context->buffer[j], data, (i = 64 - j));
               sha1_process(context, context->buffer);
               for (; i + 63 < len; i += 64) {
                  sha1_process(context, &data[i]);
               }
               j = 0;
            }

            std::memcpy(&context->buffer[j], &data[i], len - i);
         }

         inline void sha1_final(sha1_context* context, uint8_t digest[20])
         {
            uint8_t finalcount[8];

            for (int i = 0; i < 8; i++) {
               finalcount[i] = (uint8_t)((context->count[(i >= 4 ? 0 : 1)] >> ((3 - (i & 3)) * 8)) & 255);
            }

            sha1_update(context, (uint8_t*)"\200", 1);
            while ((context->count[0] & 504) != 448) {
               sha1_update(context, (uint8_t*)"\0", 1);
            }

            sha1_update(context, finalcount, 8);

            for (int i = 0; i < 20; i++) {
               digest[i] = (uint8_t)((context->state[i >> 2] >> ((3 - (i & 3)) * 8)) & 255);
            }
         }
      }
#endif

      // Generate WebSocket accept key from client key
      inline std::string generate_accept_key(std::string_view client_key)
      {
         std::string combined = std::string(client_key) + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

         unsigned char hash[20];

#if defined(GLZ_ENABLE_OPENSSL) && defined(GLZ_HAS_OPENSSL)
         // Use OpenSSL when available
#if OPENSSL_VERSION_NUMBER <= 0x030000000L
         SHA_CTX sha1;
         SHA1_Init(&sha1);
         SHA1_Update(&sha1, combined.data(), combined.size());
         SHA1_Final(hash, &sha1);
#else
         EVP_MD_CTX* sha1 = EVP_MD_CTX_new();
         EVP_DigestInit_ex(sha1, EVP_sha1(), NULL);
         EVP_DigestUpdate(sha1, combined.data(), combined.size());
         EVP_DigestFinal_ex(sha1, hash, NULL);
         EVP_MD_CTX_free(sha1);
#endif
#else
         // Use fallback implementation when OpenSSL is not available
         fallback_sha1::sha1_context ctx;
         fallback_sha1::sha1_init(&ctx);
         fallback_sha1::sha1_update(&ctx, reinterpret_cast<const uint8_t*>(combined.data()), combined.size());
         fallback_sha1::sha1_final(&ctx, hash);
#endif

         return glz::write_base64(std::string_view{reinterpret_cast<char*>(hash), sizeof(hash)});
      }

      // Check if a string contains a value (case-insensitive, comma-separated)
      inline bool header_contains(std::string_view header, std::string_view value)
      {
         while (!header.empty()) {
            // Skip whitespace
            while (!header.empty() && (header.front() == ' ' || header.front() == '\t')) {
               header.remove_prefix(1);
            }

            if (header.empty()) break;

            // Find the end of this token
            auto comma_pos = header.find(',');
            std::string_view token = header.substr(0, comma_pos);

            // Remove trailing whitespace from token
            while (!token.empty() && (token.back() == ' ' || token.back() == '\t')) {
               token.remove_suffix(1);
            }

            // Case-insensitive comparison
            if (token.size() == value.size() &&
                std::equal(token.begin(), token.end(), value.begin(), value.end(),
                           [](char a, char b) { return std::tolower(a) == std::tolower(b); })) {
               return true;
            }

            if (comma_pos == std::string_view::npos) break;
            header.remove_prefix(comma_pos + 1);
         }

         return false;
      }
   }

   // Forward declarations
   struct websocket_connection;

   // WebSocket server class
   struct websocket_server
   {
      using message_handler = std::function<void(std::shared_ptr<websocket_connection>, std::string_view, ws_opcode)>;
      using close_handler = std::function<void(std::shared_ptr<websocket_connection>)>;
      using error_handler = std::function<void(std::shared_ptr<websocket_connection>, std::error_code)>;
      using open_handler = std::function<void(std::shared_ptr<websocket_connection>, const request&)>;
      using validate_handler = std::function<bool(const request&)>;

      websocket_server() = default;

      // Set message handler
      inline void on_message(message_handler handler) { message_handler_ = std::move(handler); }

      // Set connection handler
      inline void on_open(open_handler handler) { open_handler_ = std::move(handler); }

      // Set close handler
      inline void on_close(close_handler handler) { close_handler_ = std::move(handler); }

      // Set error handler
      inline void on_error(error_handler handler) { error_handler_ = std::move(handler); }

      // Set connection validator
      inline void on_validate(validate_handler handler) { validate_handler_ = std::move(handler); }

      // Internal methods called by websocket_connection
      inline void notify_open(std::shared_ptr<websocket_connection> conn, const request& req)
      {
         if (open_handler_) {
            open_handler_(conn, req);
         }
      }

      inline void notify_message(std::shared_ptr<websocket_connection> conn, std::string_view message, ws_opcode opcode)
      {
         if (message_handler_) {
            message_handler_(conn, message, opcode);
         }
      }

      inline void notify_close(std::shared_ptr<websocket_connection> conn)
      {
         if (close_handler_) {
            close_handler_(conn);
         }
      }

      inline void notify_error(std::shared_ptr<websocket_connection> conn, std::error_code ec)
      {
         if (error_handler_) {
            error_handler_(conn, ec);
         }
      }

      inline bool validate_connection(const request& req)
      {
         if (validate_handler_) {
            return validate_handler_(req);
         }
         return true;
      }

     private:
      open_handler open_handler_;
      message_handler message_handler_;
      close_handler close_handler_;
      error_handler error_handler_;
      validate_handler validate_handler_;
   };

   // WebSocket connection class - implementations come after websocket_server
   struct websocket_connection : public std::enable_shared_from_this<websocket_connection>
   {
     public:
      inline websocket_connection(asio::ip::tcp::socket socket, websocket_server* server)
         : socket_(std::move(socket)), server_(server)
      {
         remote_endpoint_ = socket_.remote_endpoint();
      }

      ~websocket_connection() = default;

      // Start the WebSocket connection (performs handshake)
      inline void start(const request& req) { perform_handshake(req); }

      // Send a text message
      inline void send_text(std::string_view message) { send_frame(ws_opcode::text, message); }

      // Send a binary message
      inline void send_binary(std::string_view message) { send_frame(ws_opcode::binary, message); }

      // Send a ping frame
      inline void send_ping(std::string_view payload = {}) { send_frame(ws_opcode::ping, payload); }

      // Send a pong frame
      inline void send_pong(std::string_view payload = {}) { send_frame(ws_opcode::pong, payload); }

      // Close the connection
      inline void close(ws_close_code code = ws_close_code::normal, std::string_view reason = {})
      {
         if (is_closing_) return;

         is_closing_ = true;
         send_close_frame(code, reason);

         // Close after a short delay to allow the close frame to be sent
         auto self = shared_from_this();
         auto timer = std::make_shared<asio::steady_timer>(socket_.get_executor());
         timer->expires_after(std::chrono::milliseconds(100));
         timer->async_wait([self, timer](std::error_code) { self->do_close(); });
      }

      // Get remote endpoint information
      inline std::string remote_address() const { return remote_endpoint_.address().to_string(); }

      inline uint16_t remote_port() const { return remote_endpoint_.port(); }

      // Set user data
      inline void set_user_data(std::shared_ptr<void> data) { user_data_ = data; }
      inline std::shared_ptr<void> get_user_data() const { return user_data_; }

     private:
      inline void perform_handshake(const request& req)
      {
         // Validate WebSocket upgrade request
         auto it = req.headers.find("upgrade");
         constexpr std::string_view websocket_str = "websocket";
         if (it == req.headers.end() ||
             !std::equal(it->second.begin(), it->second.end(), websocket_str.begin(), websocket_str.end(),
                         [](char a, char b) { return std::tolower(a) == std::tolower(b); })) {
            do_close();
            return;
         }

         it = req.headers.find("connection");
         if (it == req.headers.end() || !ws_util::header_contains(it->second, "upgrade")) {
            do_close();
            return;
         }

         it = req.headers.find("sec-websocket-version");
         if (it == req.headers.end() || it->second != "13") {
            do_close();
            return;
         }

         it = req.headers.find("sec-websocket-key");
         if (it == req.headers.end()) {
            do_close();
            return;
         }

         // Check if server wants to validate this connection
         if (server_ && !server_->validate_connection(req)) {
            do_close();
            return;
         }

         // Generate accept key
         std::string accept_key = ws_util::generate_accept_key(it->second);

         // Send handshake response
         std::string response_str =
            "HTTP/1.1 101 Switching Protocols\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            "Sec-WebSocket-Accept: ";
         response_str.append(accept_key);
         response_str.append("\r\n\r\n");

         auto self = shared_from_this();

         // Use shared_ptr to keep response string alive during async operation
         auto response_buffer = std::make_shared<std::string>(std::move(response_str));
         asio::async_write(socket_, asio::buffer(*response_buffer),
                           [self, req, response_buffer](std::error_code ec, std::size_t) {
                              if (ec) {
                                 if (self->server_) {
                                    self->server_->notify_error(self, ec);
                                 }
                                 return;
                              }

                              self->handshake_complete_ = true;

                              // Notify server of successful connection
                              if (self->server_) {
                                 self->server_->notify_open(self, req);
                              }

                              // Start reading frames
                              self->start_read();
                           });
      }

      inline void start_read()
      {
         auto self = shared_from_this();
         socket_.async_read_some(asio::buffer(read_buffer_), [self](std::error_code ec, std::size_t bytes_transferred) {
            self->on_read(ec, bytes_transferred);
         });
      }

      inline void on_read(std::error_code ec, std::size_t bytes_transferred)
      {
         if (ec) {
            if (server_) {
               server_->notify_error(shared_from_this(), ec);
            }
            return;
         }

         // Add received data to frame buffer
         frame_buffer_.insert(frame_buffer_.end(), read_buffer_.begin(), read_buffer_.begin() + bytes_transferred);

         // Process complete frames
         process_frame(frame_buffer_.data(), frame_buffer_.size());

         // Continue reading if connection is still open
         if (!is_closing_ && handshake_complete_) {
            start_read();
         }
      }

      inline void process_frame(const uint8_t* data, std::size_t length)
      {
         std::size_t offset = 0;

         while (offset < length) {
            // Need at least 2 bytes for basic header
            if (length - offset < 2) {
               break;
            }

            ws_frame_header header;
            header.data[0] = data[offset];
            header.data[1] = data[offset + 1];
            offset += 2;

            // Check reserved bits
            if ((header.data[0] & 0x70) != 0) {
               close(ws_close_code::protocol_error, "Reserved bits set");
               return;
            }

            // Get payload length
            uint64_t payload_length = header.payload_len();

            if (payload_length == 126) {
               if (length - offset < 2) break;
               payload_length = (static_cast<uint64_t>(data[offset]) << 8) | data[offset + 1];
               offset += 2;
            }
            else if (payload_length == 127) {
               if (length - offset < 8) break;
               payload_length = 0;
               for (int i = 0; i < 8; ++i) {
                  payload_length = (payload_length << 8) | data[offset + i];
               }
               offset += 8;
            }

            // Read mask key if present
            std::array<uint8_t, 4> mask_key{};
            if (header.mask()) {
               if (length - offset < 4) break;
               std::copy(data + offset, data + offset + 4, mask_key.begin());
               offset += 4;
            }

            // Check if we have the complete payload
            if (length - offset < payload_length) {
               break;
            }

            // Extract and unmask payload
            std::vector<uint8_t> payload(payload_length);
            if (payload_length > 0) {
               std::copy(data + offset, data + offset + payload_length, payload.begin());

               if (header.mask()) {
                  for (std::size_t i = 0; i < payload_length; ++i) {
                     payload[i] ^= mask_key[i % 4];
                  }
               }
            }

            offset += payload_length;

            // Handle the frame
            handle_frame(header.opcode(), payload.data(), payload.size(), header.fin());

            // Remove processed data from buffer
            if (offset > 0) {
               frame_buffer_.erase(frame_buffer_.begin(), frame_buffer_.begin() + offset);
               return process_frame(frame_buffer_.data(), frame_buffer_.size());
            }
         }
      }

      inline void handle_frame(ws_opcode opcode, const uint8_t* payload, std::size_t length, bool fin)
      {
         switch (opcode) {
         case ws_opcode::text:
         case ws_opcode::binary:
            if (is_reading_frame_) {
               close(ws_close_code::protocol_error, "Unexpected data frame");
               return;
            }

            current_opcode_ = opcode;
            message_buffer_.assign(payload, payload + length);

            if (fin) {
               // Validate UTF-8 for text frames
               if (opcode == ws_opcode::text && !is_valid_utf8(message_buffer_.data(), message_buffer_.size())) {
                  close(ws_close_code::invalid_payload, "Invalid UTF-8");
                  return;
               }

               if (server_) {
                  server_->notify_message(
                     shared_from_this(),
                     std::string_view(reinterpret_cast<const char*>(message_buffer_.data()), message_buffer_.size()),
                     current_opcode_);
               }
               message_buffer_.clear();
               current_opcode_ = ws_opcode::continuation;
            }
            else {
               is_reading_frame_ = true;
            }
            break;

         case ws_opcode::continuation:
            if (!is_reading_frame_) {
               close(ws_close_code::protocol_error, "Unexpected continuation frame");
               return;
            }

            message_buffer_.insert(message_buffer_.end(), payload, payload + length);

            if (fin) {
               is_reading_frame_ = false;

               // Validate UTF-8 for text frames
               if (current_opcode_ == ws_opcode::text &&
                   !is_valid_utf8(message_buffer_.data(), message_buffer_.size())) {
                  close(ws_close_code::invalid_payload, "Invalid UTF-8");
                  return;
               }

               if (server_) {
                  server_->notify_message(
                     shared_from_this(),
                     std::string_view(reinterpret_cast<const char*>(message_buffer_.data()), message_buffer_.size()),
                     current_opcode_);
               }
               message_buffer_.clear();
               current_opcode_ = ws_opcode::continuation;
            }
            break;

         case ws_opcode::close: {
            ws_close_code code = ws_close_code::normal;
            std::string reason;

            if (length >= 2) {
               code = static_cast<ws_close_code>((payload[0] << 8) | payload[1]);
               if (length > 2) {
                  reason = std::string(reinterpret_cast<const char*>(payload + 2), length - 2);
               }
            }

            if (!is_closing_) {
               send_close_frame(code, reason);
            }

            do_close();
         } break;

         case ws_opcode::ping:
            send_pong(std::string_view(reinterpret_cast<const char*>(payload), length));
            break;

         case ws_opcode::pong:
            // Pong frames are just ignored
            break;

         default:
            close(ws_close_code::protocol_error, "Unknown opcode");
            break;
         }
      }

      inline void send_frame(ws_opcode opcode, std::string_view payload, bool fin = true)
      {
         if (is_closing_) return;

         std::size_t header_size = get_frame_header_size(payload.size());
         std::vector<uint8_t> frame(header_size + payload.size());

         write_frame_header(opcode, payload.size(), fin, frame.data());
         std::copy(payload.begin(), payload.end(), frame.begin() + header_size);

         auto self = shared_from_this();

         // Use shared_ptr to keep the frame alive during async operation
         auto frame_buffer = std::make_shared<std::vector<uint8_t>>(std::move(frame));
         asio::async_write(socket_, asio::buffer(*frame_buffer), [self, frame_buffer](std::error_code ec, std::size_t) {
            if (ec && self->server_) {
               self->server_->notify_error(self, ec);
            }
         });
      }

      inline void send_close_frame(ws_close_code code, std::string_view reason)
      {
         std::vector<uint8_t> payload(2 + reason.size());
         payload[0] = static_cast<uint8_t>(static_cast<uint16_t>(code) >> 8);
         payload[1] = static_cast<uint8_t>(static_cast<uint16_t>(code) & 0xFF);

         if (!reason.empty()) {
            std::copy(reason.begin(), reason.end(), payload.begin() + 2);
         }

         send_frame(ws_opcode::close, std::string_view(reinterpret_cast<const char*>(payload.data()), payload.size()));
      }

      inline std::size_t get_frame_header_size(std::size_t payload_length)
      {
         if (payload_length < 126) {
            return 2;
         }
         else if (payload_length <= 0xFFFF) {
            return 4;
         }
         else {
            return 10;
         }
      }

      inline void write_frame_header(ws_opcode opcode, std::size_t payload_length, bool fin, uint8_t* header)
      {
         ws_frame_header frame_header;
         frame_header.fin(fin);
         frame_header.opcode(opcode);
         frame_header.mask(false);

         header[0] = frame_header.data[0];

         if (payload_length < 126) {
            frame_header.payload_len(static_cast<uint8_t>(payload_length));
            header[1] = frame_header.data[1];
         }
         else if (payload_length <= 0xFFFF) {
            frame_header.payload_len(126);
            header[1] = frame_header.data[1];
            header[2] = static_cast<uint8_t>(payload_length >> 8);
            header[3] = static_cast<uint8_t>(payload_length & 0xFF);
         }
         else {
            frame_header.payload_len(127);
            header[1] = frame_header.data[1];
            for (int i = 0; i < 8; ++i) {
               header[2 + i] = static_cast<uint8_t>(payload_length >> (8 * (7 - i)));
            }
         }
      }

      inline bool is_valid_utf8(const uint8_t* data, std::size_t length)
      {
         // Simple UTF-8 validation
         for (std::size_t i = 0; i < length;) {
            uint8_t byte = data[i];

            if (byte < 0x80) {
               // ASCII character
               i++;
            }
            else if ((byte & 0xE0) == 0xC0) {
               // 2-byte sequence
               if (i + 1 >= length || (data[i + 1] & 0xC0) != 0x80) {
                  return false;
               }
               i += 2;
            }
            else if ((byte & 0xF0) == 0xE0) {
               // 3-byte sequence
               if (i + 2 >= length || (data[i + 1] & 0xC0) != 0x80 || (data[i + 2] & 0xC0) != 0x80) {
                  return false;
               }
               i += 3;
            }
            else if ((byte & 0xF8) == 0xF0) {
               // 4-byte sequence
               if (i + 3 >= length || (data[i + 1] & 0xC0) != 0x80 || (data[i + 2] & 0xC0) != 0x80 ||
                   (data[i + 3] & 0xC0) != 0x80) {
                  return false;
               }
               i += 4;
            }
            else {
               return false;
            }
         }

         return true;
      }

      inline void do_close()
      {
         if (server_) {
            server_->notify_close(shared_from_this());
         }

         asio::error_code ec;
         socket_.close(ec);
      }

      asio::ip::tcp::socket socket_;
      websocket_server* server_;
      std::array<uint8_t, 4096> read_buffer_;
      std::vector<uint8_t> frame_buffer_;
      std::vector<uint8_t> message_buffer_;
      ws_opcode current_opcode_{ws_opcode::continuation};
      bool is_reading_frame_{false};
      bool is_closing_{false};
      bool handshake_complete_{false};
      std::shared_ptr<void> user_data_;
      asio::ip::tcp::endpoint remote_endpoint_;
   };
}
