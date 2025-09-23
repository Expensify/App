import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

const getAssetSourceFilename = () => {
    if (process.env.ELECTRON_ENV === "adhoc") {
        return "Assets-adhoc.car";
    }

    if (process.env.ELECTRON_ENV === "development") {
        return "Assets-dev.car";
    }

    return "Assets.car";
};

const assetSource = path.resolve(dirname, `./${getAssetSourceFilename()}`);

// This will copy Assets.car with MacOS Liquid Glass icon
// and will be removed after Electron builder supports this natively
export default async function afterPack(context) {
    if (context.electronPlatformName !== "darwin") return;

    const appName = context.packager.appInfo.productFilename;
    const appRoot = path.join(context.appOutDir, `${appName}.app`, "Contents");
    const resourcesDir = path.join(appRoot, "Resources");

    await fs.mkdir(resourcesDir, { recursive: true });
    await fs.copyFile(SRC_CAR, path.join(resourcesDir, "Assets.car"));
}
