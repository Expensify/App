/**
 * On Android we setup the status bar in native code.
 */

export default function CustomStatusBar() {
    // Prefer to not render the StatusBar component in Android as it can cause
    // issues with edge to edge display. We setup the status bar appearance in
    // MainActivity.java and styles.xml.
    return null;
}
