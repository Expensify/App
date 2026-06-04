import {JsiSkApi} from '@shopify/react-native-skia/lib/module/skia/web';
import {LoadSkiaWeb} from '@shopify/react-native-skia/lib/module/web/LoadSkiaWeb';
import getCanvaskitInitOptions from './canvaskit';

async function initSkiaForCli(): Promise<void> {
    await LoadSkiaWeb(getCanvaskitInitOptions());

    const globalScope = globalThis as unknown as {CanvasKit: Parameters<typeof JsiSkApi>[0]; SkiaApi: ReturnType<typeof JsiSkApi>};
    globalScope.SkiaApi = JsiSkApi(globalScope.CanvasKit);
}

export default initSkiaForCli;
