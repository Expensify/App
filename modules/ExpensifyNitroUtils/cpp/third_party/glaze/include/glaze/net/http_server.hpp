// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#include <asio/signal_set.hpp>
#include <atomic>
#include <charconv>
#include <chrono>
#include <condition_variable>
#include <expected>
#include <functional>
#include <future>
#include <glaze/glaze.hpp>
#include <iostream>
#include <mutex>
#include <set>
#include <source_location>
#include <thread>
#include <unordered_map>

#include "glaze/net/cors.hpp"
#include "glaze/net/http_router.hpp"
#include "glaze/net/openapi.hpp"
#include "glaze/net/websocket_connection.hpp"

// Conditionally include SSL headers only when needed
#ifdef GLZ_ENABLE_SSL
#include <asio/ssl.hpp>
#endif

// To deconflict Windows.h
#ifdef DELETE
#undef DELETE
#endif

namespace glz
{
   // Streaming connection handle for server-side streaming
   struct streaming_connection : public std::enable_shared_from_this<streaming_connection>
   {
      using data_sent_handler = std::function<void(std::error_code)>;
      using disconnect_handler = std::function<void()>;

      streaming_connection(std::shared_ptr<asio::ip::tcp::socket> socket)
         : socket_(socket), is_headers_sent_(false), is_closed_(false)
      {}

      // Send initial headers for streaming response
      void send_headers(int status_code, const std::unordered_map<std::string, std::string>& headers = {},
                        data_sent_handler handler = {})
      {
         if (is_headers_sent_) return;
         is_headers_sent_ = true;

         std::string response_str;
         response_str.reserve(512);

         response_str.append("HTTP/1.1 ");
         response_str.append(std::to_string(status_code));
         response_str.append(" ");
         response_str.append(get_status_message(status_code));
         response_str.append("\r\n");

         // Add custom headers
         for (const auto& [name, value] : headers) {
            response_str.append(name);
            response_str.append(": ");
            response_str.append(value);
            response_str.append("\r\n");
         }

         // Default headers for streaming
         if (headers.find("Transfer-Encoding") == headers.end()) {
            response_str.append("Transfer-Encoding: chunked\r\n");
            chunked_encoding_ = true;
         }
         if (headers.find("Connection") == headers.end()) {
            response_str.append("Connection: keep-alive\r\n");
         }
         if (headers.find("Cache-Control") == headers.end()) {
            response_str.append("Cache-Control: no-cache\r\n");
         }

         response_str.append("\r\n");

         auto buffer = std::make_shared<std::string>(std::move(response_str));
         auto self = shared_from_this();

         asio::async_write(*socket_, asio::buffer(*buffer), [self, buffer, handler](std::error_code ec, std::size_t) {
            if (handler) handler(ec);
         });
      }

      // Send a chunk of data
      void send_chunk(std::string_view data, data_sent_handler handler = {})
      {
         if (is_closed_) return;

         auto self = shared_from_this();

         if (chunked_encoding_) {
            // Format as HTTP chunk
            std::string chunk;
            chunk.reserve(data.size() + 20); // 20 is a good estimate for hex size + CRLFs

            // Chunk size in hex, converted efficiently with std::to_chars
            std::array<char, 16> size_buf{}; // 64-bit size_t in hex is at most 16 chars
            if (auto [ptr, ec] = std::to_chars(size_buf.data(), size_buf.data() + size_buf.size(), data.size(), 16);
                ec == std::errc()) {
               chunk.append(std::string_view(size_buf.data(), ptr - size_buf.data()));
            }
            chunk.append("\r\n");
            chunk.append(data);
            chunk.append("\r\n");

            auto buffer = std::make_shared<std::string>(std::move(chunk));
            asio::async_write(*socket_, asio::buffer(*buffer),
                              [self, buffer, handler](std::error_code ec, std::size_t) {
                                 if (handler) handler(ec);
                              });
         }
         else {
            // Send raw data
            auto buffer = std::make_shared<std::string>(data);
            asio::async_write(*socket_, asio::buffer(*buffer),
                              [self, buffer, handler](std::error_code ec, std::size_t) {
                                 if (handler) handler(ec);
                              });
         }
      }

      // Send Server-Sent Event
      void send_event(std::string_view event_type, std::string_view data, std::string_view id = {},
                      data_sent_handler handler = {})
      {
         std::string sse_data;
         sse_data.reserve(data.size() + 50);

         if (!id.empty()) {
            sse_data.append("id: ");
            sse_data.append(id);
            sse_data.append("\n");
         }

         if (!event_type.empty()) {
            sse_data.append("event: ");
            sse_data.append(event_type);
            sse_data.append("\n");
         }

         sse_data.append("data: ");
         sse_data.append(data);
         sse_data.append("\n\n");

         send_chunk(sse_data, handler);
      }

      // Send JSON as Server-Sent Event
      template <class T>
      void send_json_event(const T& data, std::string_view event_type = "message", std::string_view id = {},
                           data_sent_handler handler = {})
      {
         std::string json_str;
         auto ec = glz::write_json(data, json_str);
         if (!ec) {
            send_event(event_type, json_str, id, handler);
         }
         else if (handler) {
            handler(std::make_error_code(std::errc::invalid_argument));
         }
      }

      // Close the streaming connection
      void close(disconnect_handler handler = {})
      {
         if (is_closed_) return;
         is_closed_ = true;

         auto self = shared_from_this();

         if (chunked_encoding_) {
            // Send final chunk
            std::string final_chunk = "0\r\n\r\n";
            auto buffer = std::make_shared<std::string>(std::move(final_chunk));

            asio::async_write(*socket_, asio::buffer(*buffer), [self, buffer, handler](asio::error_code, std::size_t) {
               if (handler) handler();
               asio::error_code close_ec;
               self->socket_->close(close_ec);
            });
         }
         else {
            if (handler) handler();
            asio::error_code ec;
            socket_->close(ec);
         }
      }

      // Set disconnect handler for client disconnection
      void on_disconnect(disconnect_handler handler)
      {
         disconnect_handler_ = handler;
         start_disconnect_detection();
      }

      // Check if connection is still alive
      bool is_open() const { return socket_ && socket_->is_open() && !is_closed_; }

      // Get remote endpoint info
      std::string remote_address() const
      {
         if (socket_) {
            try {
               return socket_->remote_endpoint().address().to_string();
            }
            catch (...) {
            }
         }
         return "";
      }

      uint16_t remote_port() const
      {
         if (socket_) {
            try {
               return socket_->remote_endpoint().port();
            }
            catch (...) {
            }
         }
         return 0;
      }

      bool is_headers_sent() const { return is_headers_sent_; }

      std::shared_ptr<asio::ip::tcp::socket> socket_;

     private:
      disconnect_handler disconnect_handler_;
      bool is_headers_sent_;
      bool is_closed_;
      bool chunked_encoding_ = false;

      void start_disconnect_detection()
      {
         if (!socket_ || is_closed_) return;

         auto self = shared_from_this();
         auto buffer = std::make_shared<std::array<uint8_t, 1>>();

         // Try to read - will fail when client disconnects
         socket_->async_receive(
            asio::buffer(*buffer), asio::socket_base::message_peek, [self, buffer](std::error_code ec, std::size_t) {
               if (ec && self->disconnect_handler_) {
                  self->is_closed_ = true;
                  self->disconnect_handler_();
               }
               else if (!ec && !self->is_closed_) {
                  // Continue monitoring
                  auto timer = std::make_shared<asio::steady_timer>(self->socket_->get_executor());
                  timer->expires_after(std::chrono::seconds(1));
                  timer->async_wait([self, timer](std::error_code) { self->start_disconnect_detection(); });
               }
            });
      }

      std::string_view get_status_message(int status_code)
      {
         switch (status_code) {
         case 200:
            return "OK";
         case 201:
            return "Created";
         case 204:
            return "No Content";
         case 400:
            return "Bad Request";
         case 401:
            return "Unauthorized";
         case 403:
            return "Forbidden";
         case 404:
            return "Not Found";
         case 500:
            return "Internal Server Error";
         default:
            return "Unknown";
         }
      }
   };

   // Enhanced response class with streaming support
   struct streaming_response
   {
      std::shared_ptr<streaming_connection> stream;

      streaming_response(std::shared_ptr<streaming_connection> conn) : stream(conn) {}

      // Send headers and start streaming
      streaming_response& start_stream(int status_code = 200,
                                       const std::unordered_map<std::string, std::string>& headers = {})
      {
         if (stream) {
            stream->send_headers(status_code, headers);
         }
         return *this;
      }

      // Send a chunk of data
      streaming_response& send(std::string_view data)
      {
         if (stream) {
            stream->send_chunk(data);
         }
         return *this;
      }

      // Send JSON data
      template <class T>
      streaming_response& send_json(const T& data)
      {
         if (stream) {
            std::string json_str;
            auto ec = glz::write_json(data, json_str);
            if (!ec) {
               stream->send_chunk(json_str);
            }
         }
         return *this;
      }

      // Send Server-Sent Event
      streaming_response& send_event(std::string_view event_type, std::string_view data, std::string_view id = {})
      {
         if (stream) {
            stream->send_event(event_type, data, id);
         }
         return *this;
      }

      // Helper for SSE setup
      streaming_response& as_event_stream()
      {
         return start_stream(200, {{"Content-Type", "text/event-stream"},
                                   {"Cache-Control", "no-cache"},
                                   {"Access-Control-Allow-Origin", "*"}});
      }

      // Close the stream
      void close()
      {
         if (stream) {
            stream->close();
         }
      }
   };

   // Handler types for streaming
   using streaming_handler = std::function<void(request&, streaming_response&)>;

   // Server implementation using non-blocking asio with WebSocket support
   template <bool EnableTLS = false>
   struct http_server
   {
      // Socket type abstraction
      using socket_type = std::conditional_t<EnableTLS,
#ifdef GLZ_ENABLE_SSL
                                             asio::ssl::stream<asio::ip::tcp::socket>,
#else
                                             asio::ip::tcp::socket,
#endif
                                             asio::ip::tcp::socket>;

      inline http_server() : io_context(std::make_unique<asio::io_context>())
      {
         error_handler = [](std::error_code ec, std::source_location loc) {
            std::fprintf(stderr, "Error at %s:%d: %s\n", loc.file_name(), static_cast<int>(loc.line()),
                         ec.message().c_str());
         };

         // Initialize SSL context for TLS-enabled servers
         if constexpr (EnableTLS) {
#ifdef GLZ_ENABLE_SSL
            ssl_context = std::make_unique<asio::ssl::context>(asio::ssl::context::tlsv12);
            ssl_context->set_default_verify_paths();
#else
            static_assert(!EnableTLS, "TLS support requires GLZ_ENABLE_SSL to be defined and OpenSSL to be available");
#endif
         }
      }

      inline ~http_server()
      {
         if (running) {
            stop();
         }
         // Clean up any remaining threads
         for (auto& thread : threads) {
            if (thread.joinable()) {
               thread.join();
            }
         }
         threads.clear();
      }

      inline http_server& bind(std::string_view address, uint16_t port)
      {
         try {
            asio::ip::tcp::endpoint endpoint(asio::ip::make_address(address), port);
            acceptor = std::make_unique<asio::ip::tcp::acceptor>(*io_context, endpoint);
         }
         catch (...) {
            error_handler(std::make_error_code(std::errc::address_in_use), std::source_location::current());
         }
         return *this;
      }

      inline http_server& bind(uint16_t port) { return bind("0.0.0.0", port); }

      inline void start(size_t num_threads = 0)
      {
         if (running || !acceptor) {
            return;
         }

         running = true;

         // Use hardware concurrency if not specified
         if (num_threads == 0) {
            num_threads = std::thread::hardware_concurrency();
         }

         // Start the acceptor
         do_accept();

         // Start worker threads
         threads.reserve(num_threads);
         for (size_t i = 0; i < num_threads; ++i) {
            threads.emplace_back([this] {
               std::error_code ec;
               io_context->run(ec);
               // Don't report errors during shutdown
            });
         }
      }

      inline void stop()
      {
         {
            std::lock_guard<std::mutex> lock(shutdown_mutex);
            if (!running) {
               return;
            }
            running = false;
         }

         // Stop accepting new connections
         if (acceptor) {
            std::error_code ec;
            acceptor->close(ec);
         }

         // Cancel the signal handler
         if (signals_) {
            std::error_code ec;
            signals_->cancel(ec);
         }

         // Stop the io_context
         io_context->stop();

         // Only join threads if we're not in one of the worker threads
         auto current_thread_id = std::this_thread::get_id();
         bool is_worker_thread = false;
         for (const auto& thread : threads) {
            if (thread.get_id() == current_thread_id) {
               is_worker_thread = true;
               break;
            }
         }

         if (!is_worker_thread) {
            for (auto& thread : threads) {
               if (thread.joinable()) {
                  thread.join();
               }
            }
            threads.clear();
         }

         // Notify any threads waiting for shutdown
         shutdown_cv.notify_all();
      }

      inline http_server& mount(std::string_view base_path, const http_router& router)
      {
         // Mount all routes from the router at the specified base path
         for (const auto& [path, method_handlers] : router.routes) {
            std::string full_path = std::string(base_path);
            if (!full_path.empty() && full_path.back() == '/') {
               full_path.pop_back();
            }
            full_path += path;

            for (const auto& [method, route_entry] : method_handlers) {
               root_router.route(method, full_path, route_entry.handle, route_entry.spec);
            }
         }

         // Add middleware
         for (const auto& middleware : router.middlewares) {
            root_router.use(middleware);
         }

         return *this;
      }

      inline http_router& route(http_method method, std::string_view path, handler handle, const route_spec& spec = {})
      {
         return root_router.route(method, path, handle, spec);
      }

      inline http_router& get(std::string_view path, handler handle, const route_spec& spec = {})
      {
         return root_router.get(path, handle, spec);
      }

      inline http_router& post(std::string_view path, handler handle, const route_spec& spec = {})
      {
         return root_router.post(path, handle, spec);
      }

      inline http_router& put(std::string_view path, handler handle, const route_spec& spec = {})
      {
         return root_router.put(path, handle, spec);
      }

      inline http_router& del(std::string_view path, handler handle, const route_spec& spec = {})
      {
         return root_router.del(path, handle, spec);
      }

      inline http_router& patch(std::string_view path, handler handle, const route_spec& spec = {})
      {
         return root_router.patch(path, handle, spec);
      }

      // Register streaming route
      inline http_server& stream(http_method method, std::string_view path, streaming_handler handle)
      {
         streaming_handlers_[std::string(path)][method] = std::move(handle);
         return *this;
      }

      // Convenience methods for streaming
      inline http_server& stream_get(std::string_view path, streaming_handler handle)
      {
         return stream(http_method::GET, path, std::move(handle));
      }

      inline http_server& stream_post(std::string_view path, streaming_handler handle)
      {
         return stream(http_method::POST, path, std::move(handle));
      }

      inline http_server& on_error(error_handler handle)
      {
         this->error_handler = std::move(handle);
         return *this;
      }

      /**
       * @brief Enable API inspection by exposing an OpenAPI 3.0 specification.
       *
       * This provides a standard, machine-readable way for clients to discover the API.
       *
       * @param path The path to expose the OpenAPI JSON specification on.
       * @param title The title of the API.
       * @param version The version of the API.
       * @return Reference to this server for method chaining.
       */
      http_server& enable_openapi_spec(std::string_view path = "/openapi.json",
                                       std::string_view title = "API Specification", std::string_view version = "1.0.0")
      {
         get(path, [this, title = std::string(title), version = std::string(version)](const request&, response& res) {
            open_api spec{};
            spec.info.title = title;
            spec.info.version = version;

            for (const auto& [route_path, method_handlers] : root_router.routes) {
               // Convert router path /:param to OpenAPI path /{param}
               std::string openapi_path = route_path;
               size_t pos = 0;
               while ((pos = openapi_path.find(':', pos)) != std::string::npos) {
                  openapi_path.replace(pos, 1, "{");
                  size_t end_pos = openapi_path.find('/', pos);
                  if (end_pos == std::string::npos) {
                     openapi_path.push_back('}');
                  }
                  else {
                     openapi_path.insert(end_pos, "}");
                  }
               }

               auto& path_item = spec.paths[openapi_path];

               for (const auto& [method, route_entry] : method_handlers) {
                  openapi_operation op;
                  op.summary = route_entry.spec.description;
                  if (!route_entry.spec.tags.empty()) {
                     op.tags = route_entry.spec.tags;
                  }
                  op.operationId = std::string(to_string(method)) + route_path;
                  op.responses["200"].description = "OK";

                  // Add request body schema
                  if (route_entry.spec.request_body_schema) {
                     openapi_request_body req_body;
                     req_body.required = true;
                     if (auto schema_val =
                            glz::read_json<glz::detail::schematic>(*route_entry.spec.request_body_schema)) {
                        req_body.content["application/json"].schema = *schema_val;
                     }
                     op.requestBody = req_body;

                     // Add schema to components
                     if (!spec.components) spec.components.emplace();
                     if (!spec.components->schemas) spec.components->schemas.emplace();
                     if (auto schema_val =
                            glz::read_json<glz::detail::schematic>(*route_entry.spec.request_body_schema)) {
                        spec.components->schemas->operator[](*route_entry.spec.request_body_type_name) = *schema_val;
                     }
                  }

                  // Add response schema
                  if (route_entry.spec.response_schema) {
                     openapi_response res_obj;
                     res_obj.description = "Successful response";
                     res_obj.content.emplace(); // Emplace the unordered_map
                     if (auto schema_val = glz::read_json<glz::detail::schematic>(*route_entry.spec.response_schema)) {
                        res_obj.content.value()["application/json"].schema = *schema_val;
                     }
                     op.responses["200"] = res_obj;

                     // Add schema to components
                     if (!spec.components) spec.components.emplace();
                     if (!spec.components->schemas) spec.components->schemas.emplace();
                     if (auto schema_val = glz::read_json<glz::detail::schematic>(*route_entry.spec.response_schema)) {
                        spec.components->schemas->operator[](*route_entry.spec.response_type_name) = *schema_val;
                     }
                  }

                  // Extract path parameters
                  auto segments = http_router::split_path(route_path);
                  for (const auto& segment : segments) {
                     if (!segment.empty() && segment.front() == ':') {
                        if (!op.parameters) op.parameters.emplace();
                        auto& param = op.parameters->emplace_back();
                        param.name = segment.substr(1);
                        param.in = "path";
                        param.required = true;
                        if (auto it = route_entry.spec.constraints.find(param.name);
                            it != route_entry.spec.constraints.end()) {
                           param.description = it->second.description;
                        }
                     }
                  }

                  switch (method) {
                  case http_method::GET:
                     path_item.get = op;
                     break;
                  case http_method::POST:
                     path_item.post = op;
                     break;
                  case http_method::PUT:
                     path_item.put = op;
                     break;
                  case http_method::DELETE:
                     path_item.del = op;
                     break;
                  case http_method::PATCH:
                     path_item.patch = op;
                     break;
                  default:
                     break;
                  }
               }
            }
            res.json(spec);
         });
         return *this;
      }

      /**
       * @brief Enable CORS with default configuration (allows all origins)
       *
       * This is suitable for development environments
       *
       * @return Reference to this server for method chaining
       */
      http_server& enable_cors()
      {
         root_router.use(glz::simple_cors());
         return *this;
      }

      /**
       * @brief Enable CORS with custom configuration
       *
       * @param config The CORS configuration to use
       * @return Reference to this server for method chaining
       */
      http_server& enable_cors(const glz::cors_config& config)
      {
         root_router.use(glz::create_cors_middleware(config));
         return *this;
      }

      /**
       * @brief Enable CORS for specific origins
       *
       * This is suitable for production environments where you want to restrict
       * which origins can access your API
       *
       * @param origins Vector of allowed origins (e.g., {"https://example.com", "https://app.example.com"})
       * @param allow_credentials Whether to allow credentials (cookies, auth headers)
       * @return Reference to this server for method chaining
       */
      http_server& enable_cors(const std::vector<std::string>& origins, bool allow_credentials = false)
      {
         root_router.use(glz::restrictive_cors(origins, allow_credentials));
         return *this;
      }

      /**
       * @brief Register a WebSocket handler for a specific path
       *
       * @param path The path to handle WebSocket connections on
       * @param server The WebSocket server instance to handle connections
       * @return Reference to this http_server for method chaining
       */
      inline http_server& websocket(std::string_view path, std::shared_ptr<websocket_server> server)
      {
         websocket_handlers_[std::string(path)] = server;
         return *this;
      }

      /**
       * @brief Load SSL certificate and private key for HTTPS servers
       *
       * @param cert_file Path to the certificate file (PEM format)
       * @param key_file Path to the private key file (PEM format)
       * @return Reference to this server for method chaining
       */
      inline http_server& load_certificate(const std::string& cert_file, const std::string& key_file)
      {
         if constexpr (EnableTLS) {
#ifdef GLZ_ENABLE_SSL
            ssl_context->use_certificate_chain_file(cert_file);
            ssl_context->use_private_key_file(key_file, asio::ssl::context::pem);
#endif
         }
         else {
            (void)cert_file;
            (void)key_file;
         }
         return *this;
      }

      /**
       * @brief Set SSL verification mode
       *
       * @param mode SSL verification mode
       * @return Reference to this server for method chaining
       */
      inline http_server& set_ssl_verify_mode([[maybe_unused]] int mode)
      {
         if constexpr (EnableTLS) {
#ifdef GLZ_ENABLE_SSL
            ssl_context->set_verify_mode(mode);
#endif
         }
         return *this;
      }

      /**
       * @brief Enable signal handling for graceful shutdown
       *
       * Registers signal handlers for SIGINT (Ctrl+C) and SIGTERM.
       * When these signals are received, the server will stop gracefully.
       *
       * @return Reference to this server for method chaining
       */
      inline http_server& with_signals()
      {
         signal_handling_enabled = true;

         // Create signal_set that will handle SIGINT and SIGTERM
         signals_ = std::make_unique<asio::signal_set>(*io_context, SIGINT, SIGTERM);

         // Set up async handler - this properly captures 'this' and integrates with ASIO
         signals_->async_wait([this](std::error_code ec, int signal_number) {
            if (!ec) {
               std::cout << "\nReceived signal " << signal_number << ", shutting down..." << std::endl;
               std::cout.flush();
               this->stop();
            }
         });

         return *this;
      }

      /**
       * @brief Wait for a shutdown signal
       *
       * This method blocks until the server is stopped, either by calling stop()
       * or by receiving a signal if signal handling is enabled with with_signals().
       *
       * @return void
       */
      inline void wait_for_signal()
      {
         std::unique_lock<std::mutex> lock(shutdown_mutex);
         shutdown_cv.wait(lock, [this] { return !running; });

         // After shutdown is signaled, wait for all threads to finish
         lock.unlock();
         for (auto& thread : threads) {
            if (thread.joinable()) {
               thread.join();
            }
         }
         threads.clear();
      }

     private:
      std::unique_ptr<asio::io_context> io_context;
      std::unique_ptr<asio::ip::tcp::acceptor> acceptor;
      std::vector<std::thread> threads;
      http_router root_router;
      bool running = false;
      glz::error_handler error_handler;
      std::unordered_map<std::string, std::shared_ptr<websocket_server>> websocket_handlers_;
      std::unordered_map<std::string, std::unordered_map<http_method, streaming_handler>> streaming_handlers_;

      // Signal handling members
      bool signal_handling_enabled = false;
      std::unique_ptr<asio::signal_set> signals_;
      std::condition_variable shutdown_cv;
      std::mutex shutdown_mutex;

#ifdef GLZ_ENABLE_SSL
      std::conditional_t<EnableTLS, std::unique_ptr<asio::ssl::context>, std::monostate> ssl_context;
#endif

      inline void do_accept()
      {
         acceptor->async_accept([this](std::error_code ec, asio::ip::tcp::socket socket) {
            if (!ec) {
               // Process the connection
               process_request(std::move(socket));
            }
            else if (running) {
               // Only report errors if we're still running (not shutting down)
               error_handler(ec, std::source_location::current());
            }

            // Continue accepting if still running
            if (running) {
               do_accept();
            }
         });
      }

      inline void process_request(asio::ip::tcp::socket socket)
      {
         // Capture socket in a shared_ptr for async operations
         auto socket_ptr = std::make_shared<asio::ip::tcp::socket>(std::move(socket));
         auto remote_endpoint = socket_ptr->remote_endpoint();
         auto buffer = std::make_shared<asio::streambuf>();

         asio::async_read_until(
            *socket_ptr, *buffer, "\r\n\r\n",
            [this, socket_ptr, buffer, remote_endpoint](asio::error_code ec, std::size_t /*bytes_transferred*/) {
               if (ec) {
                  // EOF is a normal disconnect, not a server error
                  if (ec != asio::error::eof) {
                     error_handler(ec, std::source_location::current());
                  }
                  return;
               }

               const auto data_size = buffer->size();
               const char* data_ptr = static_cast<const char*>(buffer->data().data());
               std::string_view request_view(data_ptr, data_size);

               size_t headers_end_pos = request_view.find("\r\n\r\n");
               if (headers_end_pos == std::string_view::npos) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }
               std::string_view headers_part = request_view.substr(0, headers_end_pos);
               size_t body_start_offset = headers_end_pos + 4;

               // Parse request line
               size_t request_line_end_pos = headers_part.find("\r\n");
               if (request_line_end_pos == std::string_view::npos) {
                  request_line_end_pos = headers_part.length();
               }
               std::string_view request_line = headers_part.substr(0, request_line_end_pos);
               headers_part.remove_prefix(request_line_end_pos + 2); // +2 for \r\n

               // Parse method, target, and HTTP version from the request line
               size_t first_space = request_line.find(' ');
               if (first_space == std::string_view::npos) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }
               std::string_view method_sv = request_line.substr(0, first_space);
               if (method_sv.empty() || !std::all_of(method_sv.begin(), method_sv.end(),
                                                     [](char c) { return std::isalnum(c) || c == '_'; })) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }

               size_t second_space = request_line.find(' ', first_space + 1);
               if (second_space == std::string_view::npos) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }
               std::string_view target_sv = request_line.substr(first_space + 1, second_space - first_space - 1);
               if (target_sv.empty() || target_sv.find(' ') != std::string_view::npos) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }

               std::string_view http_version_part = request_line.substr(second_space + 1);
               if (http_version_part.size() > 0 && http_version_part.back() == '\r') {
                  http_version_part.remove_suffix(1);
               }
               if (http_version_part.size() < 7 || http_version_part.rfind("HTTP/", 0) != 0) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }
               std::string_view version_number = http_version_part.substr(5);
               size_t dot_pos = version_number.find('.');
               if (dot_pos == std::string_view::npos || dot_pos == 0 || dot_pos == version_number.length() - 1) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }
               std::string_view major_v = version_number.substr(0, dot_pos);
               std::string_view minor_v = version_number.substr(dot_pos + 1);
               if (major_v.empty() || !std::all_of(major_v.begin(), major_v.end(), ::isdigit) || minor_v.empty() ||
                   !std::all_of(minor_v.begin(), minor_v.end(), ::isdigit)) {
                  send_error_response(socket_ptr, 400, "Bad Request");
                  return;
               }

               auto method_opt = from_string(std::string(method_sv));
               if (!method_opt) {
                  send_error_response(socket_ptr, 501, "Not Implemented");
                  return;
               }
               std::string target{target_sv};

               // Parse headers
               std::unordered_map<std::string, std::string> headers;
               while (!headers_part.empty()) {
                  size_t line_end = headers_part.find("\r\n");
                  std::string_view line = headers_part.substr(0, line_end);

                  auto colon_pos = line.find(':');
                  if (colon_pos != std::string_view::npos) {
                     std::string_view name_sv = line.substr(0, colon_pos);
                     std::string_view value_sv = line.substr(colon_pos + 1);
                     value_sv.remove_prefix(std::min(value_sv.find_first_not_of(" \t"), value_sv.size()));
                     std::string name(name_sv);
                     std::transform(name.begin(), name.end(), name.begin(), ::tolower);
                     headers[name] = std::string(value_sv);
                  }

                  if (line_end == std::string_view::npos) break;
                  headers_part.remove_prefix(line_end + 2);
               }

               // Consume the parsed headers from the buffer
               buffer->consume(body_start_offset);

               if (is_websocket_upgrade(headers)) {
                  handle_websocket_upgrade(socket_ptr, *method_opt, target, headers, remote_endpoint);
                  return;
               }

               std::size_t content_length = 0;
               if (auto it = headers.find("content-length"); it != headers.end()) {
                  try {
                     content_length = std::stoul(it->second);
                  }
                  catch (const std::exception&) {
                     send_error_response(socket_ptr, 400, "Bad Request");
                     return;
                  }
               }

               if (content_length > 0) {
                  std::string body;
                  body.reserve(content_length);
                  // Append what's already in the buffer
                  const size_t initial_body_size = std::min(content_length, buffer->size());
                  body.append(static_cast<const char*>(buffer->data().data()), initial_body_size);
                  buffer->consume(initial_body_size);

                  if (body.length() < content_length) {
                     asio::async_read(*socket_ptr, *buffer, asio::transfer_exactly(content_length - body.length()),
                                      [this, socket_ptr, buffer, method_opt, target, headers, remote_endpoint,
                                       body = std::move(body)](std::error_code ec, size_t) mutable {
                                         if (ec) {
                                            error_handler(ec, std::source_location::current());
                                            return;
                                         }
                                         // Append newly read data
                                         body.append(static_cast<const char*>(buffer->data().data()), buffer->size());
                                         buffer->consume(buffer->size());
                                         process_full_request(socket_ptr, *method_opt, target, headers, std::move(body),
                                                              remote_endpoint);
                                      });
                  }
                  else {
                     process_full_request(socket_ptr, *method_opt, target, headers, std::move(body), remote_endpoint);
                  }
               }
               else {
                  process_full_request(socket_ptr, *method_opt, target, headers, "", remote_endpoint);
               }
            });
      }

      inline bool is_websocket_upgrade(const std::unordered_map<std::string, std::string>& headers)
      {
         auto upgrade_it = headers.find("upgrade");
         if (upgrade_it == headers.end()) return false;

         auto connection_it = headers.find("connection");
         if (connection_it == headers.end()) return false;

         // Check if upgrade header contains "websocket" (case-insensitive)
         std::string upgrade_value = upgrade_it->second;
         std::transform(upgrade_value.begin(), upgrade_value.end(), upgrade_value.begin(), ::tolower);
         if (upgrade_value.find("websocket") == std::string::npos) return false;

         // Check if connection header contains "upgrade" (case-insensitive)
         std::string connection_value = connection_it->second;
         std::transform(connection_value.begin(), connection_value.end(), connection_value.begin(), ::tolower);
         return connection_value.find("upgrade") != std::string::npos;
      }

      inline void handle_websocket_upgrade(std::shared_ptr<asio::ip::tcp::socket> socket, http_method method,
                                           const std::string& target,
                                           const std::unordered_map<std::string, std::string>& headers,
                                           asio::ip::tcp::endpoint remote_endpoint)
      {
         // Find matching WebSocket handler
         auto ws_it = websocket_handlers_.find(target);
         if (ws_it == websocket_handlers_.end()) {
            send_error_response(socket, 404, "Not Found");
            return;
         }

         // Create request object for WebSocket handler
         request req;
         req.method = method;
         req.target = target;
         req.headers = headers;
         req.remote_ip = remote_endpoint.address().to_string();
         req.remote_port = remote_endpoint.port();

         // Create WebSocket connection and start it
         // Need to include websocket_connection.hpp for this to work
         auto ws_conn = std::make_shared<websocket_connection>(std::move(*socket), ws_it->second.get());
         ws_conn->start(req);
      }

      inline void handle_streaming_request(std::shared_ptr<asio::ip::tcp::socket> socket, http_method method,
                                           const std::string& target,
                                           const std::unordered_map<std::string, std::string>& headers,
                                           std::string body, asio::ip::tcp::endpoint remote_endpoint,
                                           const streaming_handler& handler)
      {
         // Create request object
         request req;
         req.method = method;
         req.target = target;
         req.headers = headers;
         req.body = std::move(body);
         req.remote_ip = remote_endpoint.address().to_string();
         req.remote_port = remote_endpoint.port();

         // Create streaming connection
         auto stream_conn = std::make_shared<streaming_connection>(socket);
         streaming_response stream_res(stream_conn);

         try {
            // Call the streaming handler
            handler(req, stream_res);
         }
         catch (const std::exception&) {
            // If handler throws immediately, try to send an error response.
            if (!stream_conn->is_headers_sent()) {
               stream_conn->send_headers(500, {{"Content-Type", "text/plain"}});
               stream_conn->send_chunk("Internal Server Error");
            }
            stream_conn->close();
            // Log the error
            error_handler(std::make_error_code(std::errc::invalid_argument), std::source_location::current());
         }
      }

      inline void process_full_request(std::shared_ptr<asio::ip::tcp::socket> socket, http_method method,
                                       const std::string& target,
                                       const std::unordered_map<std::string, std::string>& headers, std::string body,
                                       asio::ip::tcp::endpoint remote_endpoint)
      {
         // Check for a streaming handler first. This performs an exact match on the path,
         // so parameterized streaming routes are not supported, which is consistent
         // with the WebSocket implementation.
         auto handler_it = streaming_handlers_.find(target);
         if (handler_it != streaming_handlers_.end()) {
            auto method_it = handler_it->second.find(method);
            if (method_it != handler_it->second.end()) {
               // Found a streaming handler, delegate to it and exit.
               handle_streaming_request(socket, method, target, headers, std::move(body), remote_endpoint,
                                        method_it->second);
               return;
            }
         }

         // Create the request object
         request request;
         request.method = method;
         request.target = target;
         request.headers = headers;
         request.body = std::move(body);
         request.remote_ip = remote_endpoint.address().to_string();
         request.remote_port = remote_endpoint.port();

         // Find a matching route using http_router::match which handles both exact and parameterized routes
         auto [handle, params] = root_router.match(method, target);

         // Update the request with any extracted parameters
         request.params = std::move(params);

         if (!handle) {
            // No matching route found
            send_error_response(socket, 404, "Not Found");
            return;
         }

         // Create the response object
         response response;

         try {
            // Apply middleware
            for (const auto& middleware : root_router.middlewares) {
               middleware(request, response);
            }

            // Call the handle
            handle(request, response);

            // Send the response
            send_response(socket, response);
         }
         catch (const std::exception& e) {
            // Log the exception details for debugging
            std::string error_message = e.what();
            error_handler(std::make_error_code(std::errc::invalid_argument), std::source_location::current());

            // Send a 500 error response back to the client
            send_error_response(socket, 500, "Internal Server Error");
         }
      }

      inline void send_response(std::shared_ptr<asio::ip::tcp::socket> socket, const response& response)
      {
         // Pre-calculate response size to avoid reallocations
         size_t estimated_size = 64; // Base size for status line

         for (const auto& [name, value] : response.response_headers) {
            estimated_size += name.size() + value.size() + 4; // ": " + "\r\n"
         }

         estimated_size += response.response_body.size() + 128; // Extra buffer for default headers

         // Use a single string with reserved capacity
         std::string response_str;
         response_str.reserve(estimated_size);

         // Direct string building without streams
         response_str.append("HTTP/1.1 ");
         response_str.append(std::to_string(response.status_code));
         response_str.append(" ");
         response_str.append(get_status_message(response.status_code));
         response_str.append("\r\n");

         for (const auto& [name, value] : response.response_headers) {
            response_str.append(name);
            response_str.append(": ");
            response_str.append(value);
            response_str.append("\r\n");
         }

         // Add default headers if not present (using find is faster than streams)
         if (response.response_headers.find("Content-Length") == response.response_headers.end()) {
            response_str.append("Content-Length: ");
            response_str.append(std::to_string(response.response_body.size()));
            response_str.append("\r\n");
         }

         if (response.response_headers.find("Date") == response.response_headers.end()) {
            response_str.append("Date: ");
            response_str.append(get_current_date());
            response_str.append("\r\n");
         }

         if (response.response_headers.find("Server") == response.response_headers.end()) {
            response_str.append("Server: Glaze/1.0\r\n");
         }

         // End headers and add body
         response_str.append("\r\n");
         response_str.append(response.response_body);

         auto response_buffer = std::make_shared<std::string>(std::move(response_str));

         // Send the response asynchronously
         asio::async_write(*socket, asio::buffer(*response_buffer),
                           [socket, response_buffer](std::error_code /*ec*/, std::size_t /*bytes_transferred*/) {
                              // response_buffer keeps the string alive for the duration of the async operation
                              // Socket cleanup handled by shared_ptr
                           });
      }

      inline void send_error_response(std::shared_ptr<asio::ip::tcp::socket> socket, int status_code,
                                      const std::string& message)
      {
         response response;
         response.status(status_code).content_type("text/plain").body(message);

         send_response(socket, response);
      }

      inline std::string_view get_status_message(int status_code)
      {
         switch (status_code) {
         case 200:
            return "OK";
         case 201:
            return "Created";
         case 204:
            return "No Content";
         case 400:
            return "Bad Request";
         case 401:
            return "Unauthorized";
         case 403:
            return "Forbidden";
         case 404:
            return "Not Found";
         case 405:
            return "Method Not Allowed";
         case 409:
            return "Conflict";
         case 418:
            return "I'm a teapot";
         case 500:
            return "Internal Server Error";
         case 501:
            return "Not Implemented";
         case 503:
            return "Service Unavailable";
         default:
            return "Unknown";
         }
      }

      inline std::string get_current_date()
      {
         auto now = std::chrono::system_clock::now();
         auto time_t_now = std::chrono::system_clock::to_time_t(now);

         char buf[100];
         std::strftime(buf, sizeof(buf), "%a, %d %b %Y %H:%M:%S GMT", std::gmtime(&time_t_now));

         return buf;
      }
   };

   // Utility functions for common streaming patterns
   namespace streaming_utils
   {
      // Create a periodic data sender
      template <typename T>
      void send_periodic_data(std::shared_ptr<streaming_connection> conn, std::function<T()> data_generator,
                              std::chrono::milliseconds interval, size_t max_events = 0)
      {
         auto counter = std::make_shared<size_t>(0);
         if (!conn || !conn->is_open()) return;
         auto timer = std::make_shared<asio::steady_timer>(conn->socket_->get_executor());

         // Use shared_ptr to safely handle recursive lambda calls and avoid compiler-specific segfaults
         auto send_next = std::make_shared<std::function<void()>>();
         *send_next = [conn, timer, counter, data_generator, interval, max_events, send_next]() mutable {
            if (!conn->is_open() || (max_events > 0 && *counter >= max_events)) {
               conn->close();
               return;
            }

            try {
               T data = data_generator();
               conn->send_json_event(data, "data", std::to_string(*counter), [=](std::error_code ec) mutable {
                  if (!ec) {
                     (*counter)++;
                     timer->expires_after(interval);
                     timer->async_wait([send_next, timer, counter](std::error_code) { (*send_next)(); });
                  }
                  else {
                     conn->close();
                  }
               });
            }
            catch (const std::exception&) {
               conn->close();
            }
         };

         (*send_next)();
      }

      // Create a data stream from a collection
      template <typename Container>
      void stream_collection(std::shared_ptr<streaming_connection> conn, const Container& data,
                             std::chrono::milliseconds delay_between_items = std::chrono::milliseconds(10))
      {
         auto it = std::make_shared<typename Container::const_iterator>(data.begin());
         auto end_it = data.end();
         if (!conn || !conn->is_open()) return;
         auto timer = std::make_shared<asio::steady_timer>(conn->socket_->get_executor());

         // Use shared_ptr to safely handle recursive lambda calls and avoid compiler-specific segfaults
         auto send_next = std::make_shared<std::function<void()>>();
         *send_next = [conn, timer, it, end_it, delay_between_items, send_next]() mutable {
            if (!conn->is_open() || *it == end_it) {
               conn->close();
               return;
            }

            conn->send_json_event(**it, "item", "", [=](std::error_code ec) mutable {
               if (!ec) {
                  ++(*it);
                  timer->expires_after(delay_between_items);
                  timer->async_wait([send_next, timer, it](std::error_code) { (*send_next)(); });
               }
               else {
                  conn->close();
               }
            });
         };

         (*send_next)();
      }
   } // namespace streaming_utils

   // Alias for HTTPS server
   using https_server = http_server<true>;
}
