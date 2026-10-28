/**
 * Browsers have no built-in DNG (iPhone ProRAW / Android RAW) decoder, so web and desktop reject DNGs as an invalid
 * file type instead of converting them to JPEG.
 */
const canConvertDngToJpeg = false;

export default canConvertDngToJpeg;
