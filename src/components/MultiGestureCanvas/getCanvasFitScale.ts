type GetCanvasFitScale = (props: {
    canvasSize: {
        width: number;
        height: number;
    };
    contentSize: {
        width: number;
        height: number;
    };
}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const scaleX = canvasSize.width / contentSize.width;
    const scaleY = canvasSize.height / contentSize.height;

    const minScale = Math.min(scaleX, scaleY);
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

export default getCanvasFitScale;
