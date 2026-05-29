// Glaze Library
// For the license information refer to glaze.hpp

#pragma once

// Glaze Feature Test Macros for breaking changes

// v5.2.0 Moves `layout` CSV option into glz::opts_csv
#define glaze_v5_2_0_opts_csv

// v5.1.0 swaps the template parameters of read_supported/write_supported to enable cleaner concepts and usage
#define glaze_v5_1_0_supported_swap

// v5.0.0 removes many internal functions and concepts out of the detail namespace to enable cleaner customization
#define glaze_v5_0_0
// v5.0.0 moves to more generic read_supported and write_supported concepts
// removes concepts like `read_json_supported` and uses `read_supported<JSON, T>`
#define glaze_v5_0_0_generic_supported
// v5.0.0 makes glz::opts the default options and moves some of the compile time options out of the struct
#define glaze_v5_0_0_customized_opts

// v4.3.0 removed global glz::trace
#define glaze_v4_3_0_trace

// v4.2.3 renamed glz::tuplet::tuple to glz::tuple
#define glaze_v4_2_3_tuple

// v3.6.0 renames glz::refl to glz::reflect and does not instantiate the struct as an
// inline constexpr variable
#define glaze_v3_6_0_reflect

// v3.5.0 change glz::detail::to_json and glz::detail::from_json specializations
// to glz::to<JSON and glz::from<JSON
// The template specialization takes a uint32_t Format as the first template parameter
#define glaze_v3_5_0_to_from
