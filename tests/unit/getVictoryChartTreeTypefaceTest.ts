import type { SkTypeface } from "@shopify/react-native-skia";
import type {
  ChartDefaultTypeface,
  ChartSkiaTypefaceKey,
} from "@components/Charts/types/chartSkiaTypefaceTypes";
import { CHART_SKIA_TYPEFACE_ASSETS } from "@components/Charts/utils/chartFontAssets";
import getVictoryChartTreeTypeface from "@components/Charts/utils/getVictoryChartTreeTypeface";

const CHART_SKIA_TYPEFACE_KEYS = Object.keys(
  CHART_SKIA_TYPEFACE_ASSETS,
) as ChartSkiaTypefaceKey[];

function makeTypefaces(): ChartDefaultTypeface {
  return Object.fromEntries(
    CHART_SKIA_TYPEFACE_KEYS.map((key) => [
      key,
      { id: key } as unknown as SkTypeface,
    ]),
  ) as ChartDefaultTypeface;
}

describe("getVictoryChartTreeTypeface", () => {
  it("should fall back when EXP_NEUE failed to load but another chart typeface is available", () => {
    const typefaces = makeTypefaces();
    for (const key of CHART_SKIA_TYPEFACE_KEYS) {
      typefaces[key] = null;
    }
    typefaces.EXP_NEUE_BOLD = { id: "EXP_NEUE_BOLD" } as unknown as SkTypeface;

    expect(getVictoryChartTreeTypeface(typefaces)).toBe(
      typefaces.EXP_NEUE_BOLD,
    );
  });

  it("should return null when every typeface failed to load", () => {
    const typefaces = makeTypefaces();
    for (const key of CHART_SKIA_TYPEFACE_KEYS) {
      typefaces[key] = null;
    }

    expect(getVictoryChartTreeTypeface(typefaces)).toBeNull();
  });
});
