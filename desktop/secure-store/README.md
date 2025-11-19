# @expensify/secure-store

Secure storage addon for Electron using native Swift implementation on macOS.

## ⚠️ Important: NSFaceIDUsageDescription Required

This addon **requires authentication by default** and uses biometric authentication (Touch ID/Face ID). Your application **MUST** include `NSFaceIDUsageDescription` in its Info.plist file.

### For Electron Apps

The `desktop/Info.plist` file has been configured with the required keys:
- `NSFaceIDUsageDescription` - Required for Face ID/Touch ID authentication
- `NSIdentityUsageDescription` - Fallback description for older macOS versions

When building with electron-builder, this Info.plist will be automatically merged into your app bundle via the `extendInfo` configuration in `config/electronBuilder.config.js`.

### Development Mode

For development mode (running with `npm run desktop`), the Info.plist keys should be automatically available through the Electron app bundle. If you encounter authentication errors in development, you may need to rebuild the app.

## Overview

This native addon provides secure storage capabilities for the Expensify Electron application using macOS Keychain.

## Features

- **Platform**: macOS only (Swift-based)
- **Storage**: macOS Keychain (persistent and encrypted)
- **API**: Simple async set/get/delete interface
- **Security**: Uses macOS Security framework for secure storage
- **Bridge**: Swift → Objective-C → C++ → Node.js

## Installation

```bash
npm install
```

This will automatically build the native addon using `node-gyp`.

## Usage

```typescript
import secureStore from '@expensify/secure-store';

// Store a value (REQUIRES AUTHENTICATION by default)
// User will be prompted with Touch ID/Face ID or device password
await secureStore.set('myKey', 'mySecretValue');

// Retrieve a value (REQUIRES AUTHENTICATION by default)
const value = secureStore.get('myKey');
console.log(value); // 'mySecretValue'

// To disable authentication (NOT RECOMMENDED for sensitive data)
await secureStore.set('publicKey', 'value', {
    requireAuthentication: false
});

// Delete a value
secureStore.delete('myKey');

// Trying to get a non-existent or deleted value returns null
const deleted = secureStore.get('myKey');
console.log(deleted); // null
```

For detailed usage examples and options, see [USAGE_EXAMPLE.md](./USAGE_EXAMPLE.md).

## API

### `set(key: string, value: string): Promise<void>`

Stores a value securely in the macOS Keychain.

- **key**: The key to store the value under (must be a string)
- **value**: The value to store (must be a string)
- **Returns**: Promise that resolves when the value is stored

### `get(key: string): string | null`

Retrieves a value from the macOS Keychain.

- **key**: The key to retrieve (must be a string)
- **Returns**: The stored value as a string, or `null` if not found

### `delete(key: string): void`

Deletes a value from the macOS Keychain.

- **key**: The key to delete (must be a string)

## Architecture

```
TypeScript (index.ts)
    ↓
Node.js Native Addon (secure_store_addon.mm)
    ↓
Objective-C Bridge (SecureStoreBridge.m)
    ↓
Swift Implementation (SecureStore.swift)
```

## Project Structure

```
secure-store/
├── binding.gyp                 # node-gyp build configuration
├── package.json                # Package metadata and dependencies
├── include/
│   └── SecureStoreBridge.h     # Objective-C bridge header
├── src/
│   ├── SecureStore.swift       # Swift implementation (mock storage)
│   ├── SecureStoreBridge.m     # Objective-C bridge implementation
│   └── secure_store_addon.mm   # Node.js addon (Objective-C++)
└── ts/
    └── index.ts                # TypeScript wrapper

## Build Process

The build happens in two stages:

1. **Swift Compilation**: `src/SecureStore.swift` is compiled to a static library (`libSecureStore.a`)
2. **Node Addon Build**: The Objective-C++ addon links against the Swift library

To rebuild:

```bash
npm run rebuild
```

To clean build artifacts:

```bash
npm run clean
```

## Implementation Details

The implementation uses the macOS Keychain via the Security framework for persistent, encrypted storage:

- **Keychain Service**: Configurable service identifier (defaults to "app")
- **Authentication**: Optional biometric/device password authentication
- **Accessibility**: Configurable accessibility levels (default: `whenUnlocked`)
- **Legacy Support**: Backwards compatible with older keychain entries

### Security Features

- All data is stored encrypted in the macOS Keychain
- Supports biometric authentication (Touch ID/Face ID)
- Supports device password/PIN as authentication fallback
- Data persists across app restarts
- Platform-specific security implementation

## Future Enhancements

### Cross-Platform Support

Future versions could add support for:
- Windows Credential Manager
- Linux Secret Service API

## Testing

Run the test file:

```bash
node test.js
```

This will test all three operations (set, get, delete) and verify the mock implementation works correctly.

## Requirements

- macOS 11.0 or later
- Xcode Command Line Tools
- Node.js 14+
- Swift 5.0+

## License

MIT
