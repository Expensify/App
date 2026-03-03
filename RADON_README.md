# Radon IDE Configuration Guide

Configure Radon IDE with Expensify.

## What has changed

### 1. VS Code Settings

The `.vscode` folder now contains the `launch.json` folder, which contains information about the **Expensify Hybrid Launch Configuration** - the configuration that will be used to launch the Hybrid app inside Radon IDE.

The file is needed to allow Radon to run custom build and fingerprint scripts, as well as start the application on the appropriate metro port.

### 2. Scripts

The `scripts` directory now contains a `radon` folder, where two scripts have been created - `build.sh` and `fingerprint.sh`. Those allow Radon to use the usual Expensify workflow based on `rock` under the hood.

If there are problems running the scripts themselves, try making them executable by running:

```bash
chmod +x ./scripts/radon/build.sh
chmod +x ./scripts/radon/fingerprint.sh
```

This ensures that Radon IDE can execute these scripts during the build and fingerprinting processes.

## Launching the Hybrid App in Radon IDE

To launch the application using Radon IDE:

1. Open Radon IDE
2. Navigate to **Custom Configurations** submenu
3. Select the **`Hybrid`** configuration
4. Click to launch the app

The Hybrid configuration will use the helper scripts to build and run your app with Rock.
