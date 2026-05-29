// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

#if __has_include(<asio.hpp>) && !defined(GLZ_USE_BOOST_ASIO)
#include <asio.hpp>
#elif __has_include(<boost/asio.hpp>)
#ifndef GLZ_USING_BOOST_ASIO
#define GLZ_USING_BOOST_ASIO
#endif
#include <boost/asio.hpp>
#else
static_assert(false, "standalone or boost asio must be included to use glaze/ext/glaze_asio.hpp");
#endif

#include <cassert>
#include <coroutine>
#include <iostream>

#include "glaze/rpc/registry.hpp"
#include "glaze/util/memory_pool.hpp"

namespace glz
{
   namespace repe
   {
      inline void encode_error(const error_code& ec, message& msg)
      {
         msg.header.ec = ec;
         msg.body.clear();
      }

      template <has_size ErrorMessage>
      inline void encode_error(const error_code& ec, message& msg, ErrorMessage&& error_message)
      {
         msg.header.ec = ec;
         if (error_message.size() > (std::numeric_limits<uint32_t>::max)()) {
            return;
         }
         if (error_message.empty()) {
            return;
         }
         const auto error_size = 4 + error_message.size(); // 4 bytes for message length
         msg.header.body_length = error_size;
         msg.body = error_message;
      }

      template <class ErrorMessage>
         requires(not has_size<ErrorMessage>)
      inline void encode_error(const error_code& ec, message& msg, ErrorMessage&& error_message)
      {
         encode_error(ec, msg, std::string_view{error_message});
      }

      // Decodes a repe::message when an error has been encountered
      inline std::string decode_error(message& msg)
      {
         if (bool(msg.error())) {
            const auto ec = msg.header.ec;
            if (msg.header.body_length >= 4) {
               const std::string_view error_message = msg.body;
               std::string ret = "REPE error: ";
               ret.append(format_error(ec));
               ret.append(" | ");
               ret.append(error_message);
               return {ret};
            }
            else {
               return std::string{"REPE error: "} + format_error(ec);
            }
         }
         return {"no error"};
      }

      // Decodes a repe::message into a structure
      // Returns a std::string with a formatted error on error
      template <auto Opts = opts{}, class T>
      inline std::optional<std::string> decode_message(T&& value, message& msg)
      {
         if (bool(msg.header.ec)) {
            const auto ec = msg.header.ec;
            if (msg.header.body_length >= 4) {
               const std::string_view error_message = msg.body;
               std::string ret = "REPE error: ";
               ret.append(format_error(ec));
               ret.append(" | ");
               ret.append(error_message);
               return {ret};
            }
            else {
               return std::string{"REPE error: "} + format_error(ec);
            }
         }

         // we don't const qualify `msg` for performance
         auto ec = glz::read<Opts>(std::forward<T>(value), msg.body);
         if (ec) {
            return {glz::format_error(ec, msg.body)};
         }

         return {};
      }
   }

#if defined(GLZ_USING_BOOST_ASIO)
   namespace asio
   {
      using namespace boost::asio;
      using error_code = boost::system::error_code;
   }
#endif
   inline void send_buffer(asio::ip::tcp::socket& socket, repe::message& msg)
   {
      if (msg.header.length == 0) {
         encode_error(error_code::invalid_header, msg);
         return;
      }

      std::array<asio::const_buffer, 3> buffers{asio::buffer(&msg.header, sizeof(msg.header)), asio::buffer(msg.query),
                                                asio::buffer(msg.body)};

      asio::error_code e{};
      asio::write(socket, buffers, asio::transfer_exactly(msg.header.length), e);
      if (e) {
         encode_error(error_code::connection_failure, msg, e.message());
         return;
      }
   }

   inline void receive_buffer(asio::ip::tcp::socket& socket, repe::message& msg)
   {
      asio::error_code e{};
      asio::read(socket, asio::buffer(&msg.header, sizeof(msg.header)), asio::transfer_exactly(sizeof(msg.header)), e);
      if (e) {
         encode_error(error_code::connection_failure, msg, e.message());
         return;
      }
      msg.query.resize(msg.header.query_length);
      asio::read(socket, asio::buffer(msg.query), asio::transfer_exactly(msg.header.query_length));
      msg.body.resize(msg.header.body_length);
      asio::read(socket, asio::buffer(msg.body), asio::transfer_exactly(msg.header.body_length), e);
      if (e) {
         encode_error(error_code::connection_failure, msg, e.message());
         return;
      }
   }

   inline asio::awaitable<void> co_send_buffer(asio::ip::tcp::socket& socket, const repe::message& msg)
   {
      if (msg.header.length == 0) {
         throw std::runtime_error("No length provided in REPE header");
      }
      if (msg.header.query_length != msg.query.size()) {
         throw std::runtime_error("Query length mismatch in REPE header");
      }
      if (msg.header.body_length != msg.body.size()) {
         throw std::runtime_error("Body length mismatch in REPE header");
      }

      // Prepare the buffers: header, query, and body
      std::array<asio::const_buffer, 3> buffers{asio::buffer(&msg.header, sizeof(msg.header)), asio::buffer(msg.query),
                                                asio::buffer(msg.body)};

      // Calculate the total bytes to send
      std::size_t total_length = sizeof(msg.header) + msg.header.query_length + msg.header.body_length;

      // Asynchronously write the buffers to the socket
      co_await asio::async_write(socket, buffers, asio::transfer_exactly(total_length), asio::use_awaitable);
   }

   inline asio::awaitable<void> co_receive_buffer(asio::ip::tcp::socket& socket, repe::message& msg)
   {
      // Asynchronously read the header
      co_await asio::async_read(socket, asio::buffer(&msg.header, sizeof(msg.header)),
                                asio::transfer_exactly(sizeof(msg.header)), asio::use_awaitable);

      // Validate and read the query
      msg.query.resize(msg.header.query_length);
      co_await asio::async_read(socket, asio::buffer(msg.query), asio::transfer_exactly(msg.header.query_length),
                                asio::use_awaitable);

      // Validate and read the body
      msg.body.resize(msg.header.body_length);
      co_await asio::async_read(socket, asio::buffer(msg.body), asio::transfer_exactly(msg.header.body_length),
                                asio::use_awaitable);
   }

   // TODO: Make this socket_pool behave more like the object_pool and return a shared_ptr<socket>
   struct socket_pool
   {
      std::string host{"localhost"}; // host name
      std::string service{""}; // often the port
      std::mutex mtx{};
      std::vector<std::shared_ptr<asio::ip::tcp::socket>> sockets{2};
      std::vector<size_t> available{0, 1}; // indices of available sockets

      std::shared_ptr<asio::io_context> ctx{};
      std::shared_ptr<std::atomic<bool>> is_connected = std::make_shared<std::atomic<bool>>(false);

      // provides a pointer to a socket and an index
      std::tuple<std::shared_ptr<asio::ip::tcp::socket>, size_t, std::error_code> get()
      {
         std::unique_lock lock{mtx};

         if (not ctx) {
            // TODO: make this error into an error code
            throw std::runtime_error("asio::io_context is null");
         }

         // reset all socket pointers if a connection failed
         if (not*is_connected) {
            for (auto& socket : sockets) {
               socket.reset();
            }
         }

         if (available.empty()) {
            const auto current_size = sockets.size();
            const auto new_size = sockets.size() * 2;
            sockets.resize(new_size);
            for (size_t i = current_size; i < new_size; ++i) {
               available.emplace_back(i);
            }
         }

         const auto index = available.back();
         available.pop_back();
         auto& socket = sockets[index];
#if !defined(GLZ_USING_BOOST_ASIO)
         std::error_code ec{};
#else
         boost::system::error_code ec{};
#endif
         if (socket) {
            return {socket, index, ec};
         }
         else {
            socket = std::make_shared<asio::ip::tcp::socket>(*ctx);
            asio::ip::tcp::resolver resolver{*ctx};
            const auto endpoint = resolver.resolve(host, service, ec);
            if (ec) {
               return {nullptr, index, ec};
            }
            asio::connect(*socket, endpoint, ec);
            if (ec) {
               return {nullptr, index, ec};
            }
            socket->set_option(asio::ip::tcp::no_delay(true), ec);
            if (ec) {
               return {nullptr, index, ec};
            }
            (*is_connected) = true;
            return {socket, index, ec};
         }
      }

      void free(const size_t index)
      {
         std::unique_lock lock{mtx};
         available.emplace_back(index);
      }
   };

   struct unique_socket
   {
      socket_pool* pool{};
      std::shared_ptr<asio::ip::tcp::socket> ptr{};
      size_t index{};
#if !defined(GLZ_USING_BOOST_ASIO)
      std::error_code ec{};
#else
      boost::system::error_code ec{};
#endif

      std::shared_ptr<asio::ip::tcp::socket> value() { return ptr; }

      const std::shared_ptr<asio::ip::tcp::socket> value() const { return ptr; }

      operator bool() const { return bool(ptr) && bool(pool) && not bool(ec); }

      asio::ip::tcp::socket& operator*() { return *ptr; }

      const asio::ip::tcp::socket& operator*() const { return *ptr; }

      unique_socket(socket_pool* input_pool) : pool(input_pool) { std::tie(ptr, index, ec) = pool->get(); }
      unique_socket(const unique_socket&) = default;
      unique_socket(unique_socket&&) = default;
      unique_socket& operator=(const unique_socket&) = default;
      unique_socket& operator=(unique_socket&&) = default;

      ~unique_socket() { pool->free(index); }
   };

   template <auto Opts = opts{}>
   struct asio_client
   {
      std::string host{"localhost"}; // host name
      std::string service{""}; // often the port
      uint32_t concurrency{1}; // how many threads to use

      struct glaze
      {
         using T = asio_client;
         static constexpr auto value = glz::object(&T::host, &T::service, &T::concurrency);
      };

      std::shared_ptr<asio::io_context> ctx{};
      std::shared_ptr<glz::socket_pool> socket_pool{};
      std::shared_ptr<glz::memory_pool<repe::message>> message_pool =
         std::make_shared<glz::memory_pool<repe::message>>();

      std::shared_ptr<std::atomic<bool>> is_connected =
         std::make_shared<std::atomic<bool>>(false); // will be set to pool's boolean

      bool connected() const { return *is_connected; }

      [[nodiscard]] error_code init()
      {
         *is_connected = false;
         // create a new socket_pool if we are initilaizing, this is needed because the sockets hold references to the
         // io_context which is being recreated with init()
         socket_pool = std::make_shared<glz::socket_pool>();

         {
            std::unique_lock lock{socket_pool->mtx}; // lock the socket_pool when setting up
            ctx = std::make_shared<asio::io_context>(concurrency);
            socket_pool->ctx = ctx;
            socket_pool->host = host;
            socket_pool->service = service;
            is_connected = socket_pool->is_connected;
         }

         unique_socket socket{socket_pool.get()};
         if (socket) {
            return {}; // connection success
         }
         else {
            return error_code::connection_failure;
         }
      }

      template <class Header = repe::user_header, class... Params>
      void call(Header&& header, repe::message& response, Params&&... params)
      {
         auto request = message_pool->borrow();
         request->body.clear();
         if (not connected()) {
            encode_error(request->error(), response, "call failure: NOT CONNECTED");
            return;
         }
         repe::request<Opts>(std::move(header), *request, std::forward<Params>(params)...);
         if (bool(request->error())) {
            encode_error(request->error(), response, "bad request");
            return;
         }

         unique_socket socket{socket_pool.get()};
         if (not socket) {
            socket.ptr.reset();
            (*is_connected) = false;
            encode_error(error_code::send_error, response, "socket failure");
            return;
         }

         send_buffer(*socket, *request);

         if (bool(request->error())) {
            return;
         }

         if (not header.notify) {
            receive_buffer(*socket, response);
            if (bool(response.error())) {
               return;
            }
         }
      }

      // The `call` method above is designed to be generic and fully-featured.
      // The `call` method handles invoking RPC functions and sending data to query endpoints
      // as well as receiving data back.
      // The API is designed to reduce copies and gives the user control of how the response is handled.
      // This is important for chaining calls and efficiently handling memory.
      // ---
      // The `send` and `receive` methods provide simpler APIs that throw for cleaner code
      // and allocate the response in the function call.

      // Send parameters to a target query function or value
      template <class... Params>
      void set(const std::string_view query, Params&&... params)
      {
         if (not connected()) {
            throw std::runtime_error("asio_client: NOT CONNECTED");
         }

         repe::message response{};
         auto request = message_pool->borrow();
         request->body.clear();
         repe::request<Opts>(repe::user_header{.query = query}, *request, std::forward<Params>(params)...);
         if (bool(request->error())) {
            throw std::runtime_error("bad request");
         }

         unique_socket socket{socket_pool.get()};
         if (not socket) {
            socket.ptr.reset();
            (*is_connected) = false;
            throw std::runtime_error("socket failure");
         }

         send_buffer(*socket, *request);

         if (bool(request->error())) {
            throw std::runtime_error(glz::format_error(request->error()));
         }

         receive_buffer(*socket, response);
         if (bool(response.error())) {
            std::string error_message = glz::format_error(response.error());
            if (response.body.size()) {
               error_message.append(": ");
               error_message.append(response.body);
            }
            throw std::runtime_error(error_message);
         }
      }

      template <class Output>
      void get(const std::string_view query, Output& output)
      {
         if (not connected()) {
            throw std::runtime_error("asio_client: NOT CONNECTED");
         }

         repe::message response{};
         auto request = message_pool->borrow();
         request->body.clear();
         repe::request<Opts>(repe::user_header{.query = query}, *request);
         if (bool(request->error())) {
            throw std::runtime_error("bad request");
         }

         unique_socket socket{socket_pool.get()};
         if (not socket) {
            socket.ptr.reset();
            (*is_connected) = false;
            throw std::runtime_error("socket failure");
         }

         send_buffer(*socket, *request);

         if (bool(request->error())) {
            throw std::runtime_error(glz::format_error(request->error()));
         }

         receive_buffer(*socket, response);
         if (bool(response.error())) {
            std::string error_message = glz::format_error(response.error());
            if (response.body.size()) {
               error_message.append(": ");
               error_message.append(response.body);
            }
            throw std::runtime_error(error_message);
         }

         auto ec = read<Opts>(output, response.body);
         if (bool(ec)) {
            throw std::runtime_error(glz::format_error(ec, response.body));
         }
      }

      // Allocating version of `get`
      template <class Output>
      auto get(const std::string_view query)
      {
         Output out{};
         get(query, out);
         return out;
      }

      template <class Input, class Output>
      void inout(const std::string_view query, Input&& input, Output& output)
      {
         if (not connected()) {
            throw std::runtime_error("asio_client: NOT CONNECTED");
         }

         repe::message response{};
         auto request = message_pool->borrow();
         request->body.clear();
         repe::request<Opts>(repe::user_header{.query = query}, *request, std::forward<Input>(input));
         if (bool(request->error())) {
            throw std::runtime_error("bad request");
         }

         unique_socket socket{socket_pool.get()};
         if (not socket) {
            socket.ptr.reset();
            (*is_connected) = false;
            throw std::runtime_error("socket failure");
         }

         send_buffer(*socket, *request);

         if (bool(request->error())) {
            throw std::runtime_error(glz::format_error(request->error()));
         }

         receive_buffer(*socket, response);
         if (bool(response.error())) {
            std::string error_message = glz::format_error(response.error());
            if (response.body.size()) {
               error_message.append(": ");
               error_message.append(response.body);
            }
            throw std::runtime_error(error_message);
         }

         auto ec = read<Opts>(output, response.body);
         if (bool(ec)) {
            throw std::runtime_error(glz::format_error(ec, response.body));
         }
      }
   };

   template <auto Opts = opts{}>
   struct asio_server
   {
      uint16_t port{}; // 0 will select a random free port
      uint32_t concurrency{1}; // How many threads to use (a call to .run() is inclusive on the main thread)

      // Register a callback that takes a string error message on server/registry errors.
      // Note that we use a std::string to support a wide source of errors and use e.what()
      // IMPORTANT: The code within the callback must be thread safe, as multiple threads could call this
      // simultaneously.
      std::function<void(const std::string&)> error_handler{};

      ~asio_server() { stop(); }

      struct glaze
      {
         using T = asio_server;
         static constexpr auto value = glz::object(&T::port, &T::concurrency);
      };

      std::shared_ptr<asio::io_context> ctx{};
      std::shared_ptr<asio::signal_set> signals{};
      std::shared_ptr<std::vector<std::thread>> threads{};

      glz::registry<Opts> registry{};

      void clear_registry() { registry.clear(); }

      template <const std::string_view& Root = detail::empty_path, class T>
         requires(glaze_object_t<T> || reflectable<T>)
      void on(T& value)
      {
         registry.template on<Root>(value);
      }

      bool initialized = false;

      void init()
      {
         if (!initialized) {
            if (concurrency == 0) {
               throw std::runtime_error("concurrency == 0");
            }
            ctx = std::make_shared<asio::io_context>(concurrency);
            signals = std::make_shared<asio::signal_set>(*ctx, SIGINT, SIGTERM);
         }
         initialized = true;
      }

      void run(bool run_on_main_thread = true)
      {
         if (!initialized) {
            init();
         }

         // Setup signal handling to stop the server
         signals->async_wait([&](auto, auto) { ctx->stop(); });

         // Create the acceptor synchronously so we know the actual port if set to 0 (select random free)
         auto executor = ctx->get_executor();
         asio::ip::tcp::acceptor acceptor(executor, {asio::ip::tcp::v6(), port});
         port = acceptor.local_endpoint().port();

         // Start the listener coroutine
         asio::co_spawn(*ctx, listener(std::move(acceptor)), asio::detached);

         // Run the io_context in multiple threads for concurrency
         threads = std::shared_ptr<std::vector<std::thread>>(new std::vector<std::thread>{}, [](auto* ptr) {
            // Join all threads before exiting
            for (auto& thread : *ptr) {
               if (thread.joinable()) {
                  thread.join();
               }
            }
         });

         threads->reserve(concurrency - uint32_t(run_on_main_thread));
         for (uint32_t i = uint32_t(run_on_main_thread); i < concurrency; ++i) {
            threads->emplace_back([this]() { ctx->run(); });
         }

         if (run_on_main_thread) {
            // Run in the main thread as well, which will block
            ctx->run();

            threads.reset(); // join all threads
         }
      }

      void run_async() { run(false); }

      // stop the server
      void stop()
      {
         if (ctx) {
            ctx->stop(); // Stop the server's io_context
         }
      }

      asio::awaitable<void> run_instance(asio::ip::tcp::socket socket)
      {
         socket.set_option(asio::ip::tcp::no_delay(true));

         // Allocate once and reuse memory
         repe::message request{};
         repe::message response{};

         try {
            while (true) {
               co_await co_receive_buffer(socket, request);
               response.header.ec = {}; // clear error code, as we use this field to determine if a new error occured
               registry.call(request, response);
               if (not request.header.notify) {
                  co_await co_send_buffer(socket, response);
               }
            }
         }
         catch (const std::exception& e) {
            if (error_handler) {
               error_handler(e.what());
            }
            else {
               std::fprintf(stderr, "glz::asio_server error: %s\n", e.what());
            }
         }
      }

      asio::awaitable<void> listener(asio::ip::tcp::acceptor acceptor)
      {
         auto executor = co_await asio::this_coro::executor;

         while (true) {
            auto socket = co_await acceptor.async_accept(asio::use_awaitable);
            asio::co_spawn(executor, run_instance(std::move(socket)), asio::detached);
         }
      }
   };
}
