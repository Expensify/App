type GetCompactReceiptDimensionsParams = {
    windowWidth: number;
    horizontalMargin: number;
    containerWidth: number;
    aspectRatio: number | null;
};

type CompactReceiptDimensions = {
    compactReceiptMaxWidth: number;
    compactReceiptMaxHeight: number;
};

type GetCompactReceiptDimensions = (params: GetCompactReceiptDimensionsParams) => CompactReceiptDimensions;

export default GetCompactReceiptDimensions;
