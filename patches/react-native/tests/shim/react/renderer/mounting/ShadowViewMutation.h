#pragma once
#include <cassert>
#include <cstdint>
#include <vector>
#include <react/renderer/mounting/ShadowView.h>

namespace facebook::react {

// Enum values copied verbatim from
// node_modules/react-native/ReactCommon/react/renderer/mounting/ShadowViewMutation.h:84-90
struct ShadowViewMutation {
  enum Type : std::uint8_t {
    Create = 1,
    Delete = 2,
    Insert = 4,
    Remove = 8,
    Update = 16,
  };

  Type type = Create;
  Tag parentTag = -1;
  ShadowView oldChildShadowView = {};
  ShadowView newChildShadowView = {};
  int index = -1;

  static ShadowViewMutation CreateMutation(ShadowView child) {
    return {Create, -1, {}, child, -1};
  }
  static ShadowViewMutation DeleteMutation(ShadowView child) {
    return {Delete, -1, child, {}, -1};
  }
  static ShadowViewMutation InsertMutation(Tag parentTag, ShadowView child, int index) {
    return {Insert, parentTag, {}, child, index};
  }
  static ShadowViewMutation RemoveMutation(Tag parentTag, ShadowView child, int index) {
    return {Remove, parentTag, child, {}, index};
  }
  static ShadowViewMutation UpdateMutation(ShadowView oldChild, ShadowView newChild, Tag parentTag) {
    return {Update, parentTag, oldChild, newChild, -1};
  }
};

using ShadowViewMutationList = std::vector<ShadowViewMutation>;

} // namespace facebook::react

#ifndef react_native_assert
#define react_native_assert(cond) assert(cond)
#endif
