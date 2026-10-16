/**
 * Browsers can't decode DNG (iPhone ProRAW / Android RAW), so web and desktop have no way to turn one into a JPEG.
 * DNGs are rejected there as an invalid file type instead.
 */
const canConvertDngToJpeg = false;

export default canConvertDngToJpeg;
