/**
 * On Android we setup the status bar in native code.
 */

export default function CustomStatusBar() {
    // Prefer to not render the StatusBar component in Android as it can cause
    // issues with edge to edge display, which we setup in MainActivity.java.
    return null;
}
