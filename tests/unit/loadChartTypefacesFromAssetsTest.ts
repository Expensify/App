import type { SkTypeface } from "@shopify/react-native-skia";
import loadChartTypefacesFromAssets from "@components/Charts/utils/loadChartTypefacesFromAssets";

function makeMockTypeface(key: string): SkTypeface {
  return { id: key } as unknown as SkTypeface;
}

describe("loadChartTypefacesFromAssets", () => {
  it("should return null for failed keys and typefaces for successful keys", async () => {
    const assets = {
      KEY_A: "asset-a",
      KEY_B: "asset-b",
    };
    const loadFn = jest.fn(async (assetKey: string) => {
      if (assetKey === "KEY_B") {
        throw new Error("Failed to load KEY_B");
      }

      return makeMockTypeface(assetKey);
    });
    const onError = jest.fn();

    const result = await loadChartTypefacesFromAssets(assets, loadFn, onError);

    expect(result.KEY_A).toEqual(makeMockTypeface("KEY_A"));
    expect(result.KEY_B).toBeNull();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith("KEY_B", expect.any(Error));
  });

  it("should invoke onError once per failed asset", async () => {
    const assets = {
      KEY_A: "asset-a",
      KEY_B: "asset-b",
      KEY_C: "asset-c",
    };
    const loadFn = jest.fn(async (assetKey: string) => {
      if (assetKey === "KEY_B" || assetKey === "KEY_C") {
        throw new Error(`Failed to load ${assetKey}`);
      }

      return makeMockTypeface(assetKey);
    });
    const onError = jest.fn();

    const result = await loadChartTypefacesFromAssets(assets, loadFn, onError);

    expect(result.KEY_A).toEqual(makeMockTypeface("KEY_A"));
    expect(result.KEY_B).toBeNull();
    expect(result.KEY_C).toBeNull();
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledWith("KEY_B", expect.any(Error));
    expect(onError).toHaveBeenCalledWith("KEY_C", expect.any(Error));
  });
});
