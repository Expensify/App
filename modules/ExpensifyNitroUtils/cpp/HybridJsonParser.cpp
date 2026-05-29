#include "HybridJsonParser.hpp"

#include <glaze/json/json_t.hpp>
#include <glaze/json/read.hpp>

#include <stdexcept>
#include <variant>

namespace margelo::nitro::utils {

std::shared_ptr<AnyMap> HybridJsonParser::parse(const std::string&) {
    throw std::runtime_error("HybridJsonParser::parse (typed) should never be called — raw JSI binding is used instead.");
}

std::vector<std::shared_ptr<AnyMap>> HybridJsonParser::parseRows(const std::vector<std::string>&) {
    throw std::runtime_error("HybridJsonParser::parseRows (typed) should never be called — raw JSI binding is used instead.");
}

void HybridJsonParser::loadHybridMethods() {
    // Intentionally skip HybridJsonParserSpec::loadHybridMethods(): the typed
    // parse/parseRows signatures exist only to satisfy nitrogen codegen, but
    // we want raw JSI methods at runtime to avoid AnyMap marshalling.
    HybridObject::loadHybridMethods();
    registerHybrids(this, [](Prototype& prototype) {
        prototype.registerRawHybridMethod("parse", 1, &HybridJsonParser::parseRaw);
        prototype.registerRawHybridMethod("parseRows", 1, &HybridJsonParser::parseRowsRaw);
    });
}

jsi::Value HybridJsonParser::parseRaw(jsi::Runtime& runtime, const jsi::Value& /*thisValue*/, const jsi::Value* args, size_t count) {
    if (count < 1 || !args[0].isString()) {
        throw jsi::JSError(runtime, "JsonParser.parse expects a single string argument");
    }
    const std::string json = args[0].asString(runtime).utf8(runtime);
    return parseStringToJsi(runtime, json);
}

jsi::Value HybridJsonParser::parseRowsRaw(jsi::Runtime& runtime, const jsi::Value& /*thisValue*/, const jsi::Value* args, size_t count) {
    if (count < 1 || !args[0].isObject() || !args[0].asObject(runtime).isArray(runtime)) {
        throw jsi::JSError(runtime, "JsonParser.parseRows expects a single string[] argument");
    }
    jsi::Array input = args[0].asObject(runtime).asArray(runtime);
    const size_t length = input.size(runtime);
    jsi::Array output(runtime, length);
    for (size_t i = 0; i < length; i++) {
        jsi::Value element = input.getValueAtIndex(runtime, i);
        if (!element.isString()) {
            throw jsi::JSError(runtime, "JsonParser.parseRows: every element must be a string");
        }
        const std::string json = element.asString(runtime).utf8(runtime);
        output.setValueAtIndex(runtime, i, parseStringToJsi(runtime, json));
    }
    return output;
}

jsi::Value HybridJsonParser::parseStringToJsi(jsi::Runtime& runtime, const std::string& json) {
    glz::json_t value;
    auto err = glz::read_json(value, json);
    if (err) {
        throw jsi::JSError(runtime, "JsonParser: invalid JSON at byte " + std::to_string(err.location));
    }
    return glazeToJsi(runtime, value, 0);
}

jsi::Value HybridJsonParser::glazeToJsi(jsi::Runtime& runtime, const glz::json_t& value, int depth) {
    if (depth > kMaxDepth) {
        throw jsi::JSError(runtime, "JsonParser: maximum nesting depth exceeded (" + std::to_string(kMaxDepth) + ")");
    }
    return std::visit(
        [&](const auto& v) -> jsi::Value {
            using T = std::decay_t<decltype(v)>;
            if constexpr (std::is_same_v<T, std::nullptr_t>) {
                return jsi::Value::null();
            } else if constexpr (std::is_same_v<T, bool>) {
                return jsi::Value(v);
            } else if constexpr (std::is_same_v<T, double>) {
                return jsi::Value(v);
            } else if constexpr (std::is_same_v<T, std::string>) {
                return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, v));
            } else if constexpr (std::is_same_v<T, glz::json_t::array_t>) {
                jsi::Array array(runtime, v.size());
                for (size_t i = 0; i < v.size(); i++) {
                    array.setValueAtIndex(runtime, i, glazeToJsi(runtime, v[i], depth + 1));
                }
                return array;
            } else if constexpr (std::is_same_v<T, glz::json_t::object_t>) {
                jsi::Object object(runtime);
                for (const auto& [key, child] : v) {
                    jsi::PropNameID name = jsi::PropNameID::forUtf8(runtime, key);
                    object.setProperty(runtime, name, glazeToJsi(runtime, child, depth + 1));
                }
                return object;
            } else {
                throw jsi::JSError(runtime, "JsonParser: unsupported JSON variant");
            }
        },
        value.data);
}

} // namespace margelo::nitro::utils
