// Android has no contact permission to watch, so there is nothing to re-import when a screen gains focus or the app returns to the foreground.
// Contacts are added through the system picker instead (see ContactPicker).
function useContactPermissions(): void {}

export default useContactPermissions;
