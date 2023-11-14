function getCanvasFitScale({canvasWidth, canvasHeight, imageWidth, imageHeight}) {
    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;

    return {scaleX, scaleY};
}

const ImageLightboxUtils = {
    getCanvasFitScale,
};

export default ImageLightboxUtils;
