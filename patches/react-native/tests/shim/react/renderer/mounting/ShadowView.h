#pragma once
#include <cstdint>
namespace facebook::react {
using Tag = int32_t;
using SurfaceId = int32_t;
// Minimal stand-in: MountingTransaction.cpp only reads `.tag`.
struct ShadowView {
  Tag tag = -1;
};
} // namespace facebook::react
