// lib/Report/ReportUtils.ts
// ... existing imports ...

// Add this constant at the top of the file with other constants
const WALLET_SETTINGS_KEY = 'walletSettings';

// ... existing code ...

/**
 * Uploads a CSV file to the wallet
 * @param file The CSV file to upload
 * @param shouldFlipAmountSign Whether to flip the amount sign
 */
function uploadCSV(file: File, shouldFlipAmountSign: boolean) {
    // ... existing validation code ...
    
    // Save the user's preference for flipping amount sign
    try {
        const existingSettings = JSON.parse(LoadOrGetItem(WALLET_SETTINGS_KEY) || '{}');
        const updatedSettings = {
            ...existingSettings,
            shouldFlipAmountSign,
        };
        SaveItem(WALLET_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (e) {
        // Log error but don't fail the upload
        console.warn('Failed to save wallet settings:', e);
    }
    
    // ... existing upload logic ...
}

/**
 * Gets the user's preference for flipping amount sign
 * @returns boolean indicating whether to flip amount sign
 */
function getShouldFlipAmountSign(): boolean {
    try {
        const settings = JSON.parse(LoadOrGetItem(WALLET_SETTINGS_KEY) || '{}');
        return settings.shouldFlipAmountSign ?? false;
    } catch (e) {
        return false;
    }
}

// ... existing code ...

// In the component that handles CSV upload UI
// Find where the checkbox/toggle for "flip amount sign" is defined and update it:
// 
// Before:
// const [shouldFlipAmountSign, setShouldFlipAmountSign] = useState(false);
//
// After:
const [shouldFlipAmountSign, setShouldFlipAmountSign] = useState(getShouldFlipAmountSign());

// And update the onChange handler to persist the setting:
const handleFlipAmountSignChange = (value: boolean) => {
    setShouldFlipAmountSign(value);
    try {
        const existingSettings = JSON.parse(LoadOrGetItem(WALLET_SETTINGS_KEY) || '{}');
        const updatedSettings = {
            ...existingSettings,
            shouldFlipAmountSign: value,
        };
        SaveItem(WALLET_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (e) {
        console.warn('Failed to save wallet settings:', e);
    }
};