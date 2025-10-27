const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Electron Builder afterPack hook
 * Adds rpaths to the native addon so it can find Swift runtime libraries
 */
exports.default = async function(context) {
  const appPath = context.appOutDir;
  const appName = context.packager.appInfo.productFilename + '.app';
  const resourcesPath = path.join(appPath, appName, 'Contents', 'Resources');
  const addonPath = path.join(resourcesPath, 'secure_store_addon.node');

  if (!fs.existsSync(addonPath)) {
    console.warn('⚠️  Addon not found at:', addonPath);
    return;
  }

  try {
    // Add rpath to Electron Framework which contains Swift runtime
    const electronFrameworkPath = '@loader_path/../Frameworks/Electron Framework.framework/Versions/A/Libraries';
    execSync(`install_name_tool -add_rpath "${electronFrameworkPath}" "${addonPath}" 2>/dev/null || true`);
    execSync(`install_name_tool -add_rpath "/usr/lib/swift" "${addonPath}" 2>/dev/null || true`);
    console.log('✅ Rpaths added to secure_store_addon.node');
  } catch (error) {
    console.error('❌ Failed to add rpaths:', error.message);
  }
};
