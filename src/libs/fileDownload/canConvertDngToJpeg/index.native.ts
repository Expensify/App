/**
 * iOS (ImageIO) and Android (BitmapFactory/ImageDecoder) decode DNG, so native converts it to JPEG through
 * ImageManipulator (see heicConverter) instead of rejecting it.
 */
const canConvertDngToJpeg = true;

export default canConvertDngToJpeg;
