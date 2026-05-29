#pragma once

#include "HybridJsonParserSpec.hpp"

#include <jsi/jsi.h>
#include <memory>
#include <string>
#include <vector>

namespace glz {
struct json_t;
}

namespace margelo::nitro::utils {

using namespace facebook;

class HybridJsonParser : public HybridJsonParserSpec {
public:
    HybridJsonParser() : HybridObject(TAG) {}

    // Spec overrides. Never called at runtime — `loadHybridMethods` registers
    // raw JSI methods (`parseRaw` / `parseRowsRaw`) that shadow these.
    std::shared_ptr<AnyMap> parse(const std::string& json) override;
    std::vector<std::shared_ptr<AnyMap>> parseRows(const std::vector<std::string>& jsons) override;

protected:
    void loadHybridMethods() override;

private:
    jsi::Value parseRaw(jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count);
    jsi::Value parseRowsRaw(jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* args, size_t count);

    jsi::Value parseStringToJsi(jsi::Runtime& runtime, const std::string& json);
    jsi::Value glazeToJsi(jsi::Runtime& runtime, const glz::json_t& value, int depth);

    static constexpr int kMaxDepth = 1000;
};

} // namespace margelo::nitro::utils
