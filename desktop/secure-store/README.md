# @expensify/secure-store

Secure storage addon for Electron using native Swift implementation on macOS.

## Overview

This native addon provides secure storage capabilities for the Expensify Electron application. Currently implements a mock in-memory storage, which can be replaced with macOS Keychain implementation in the future.

## Features

- **Platform**: macOS only (Swift-based)
- **Storage**: Currently uses in-memory storage (mock implementation)
- **API**: Simple set/get/delete interface
- **Bridge**: Swift → Objective-C → C++ → Node.js

## Installation

```bash
npm install
```

This will automatically build the native addon using `node-gyp`.

## Usage

```typescript
import secureStore from '@expensify/secure-store';

// Store a value
secureStore.set('myKey', 'mySecretValue');

// Retrieve a value
const value = secureStore.get('myKey');
console.log(value); // 'mySecretValue'

// Delete a value
secureStore.delete('myKey');

// Trying to get a non-existent or deleted value returns null
const deleted = secureStore.get('myKey');
console.log(deleted); // null
```

## API

### `set(key: string, value: string): void`

Stores a value securely.

- **key**: The key to store the value under (must be a string)
- **value**: The value to store (must be a string)

### `get(key: string): string | null`

Retrieves a value from secure storage.

- **key**: The key to retrieve (must be a string)
- **Returns**: The stored value as a string, or `null` if not found

### `delete(key: string): void`

Deletes a value from secure storage.

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

## Current Implementation

The current implementation uses a simple in-memory dictionary for storage:

```swift
private static var mockStorage: [String: String] = [:]
```

This is intentionally simple for initial testing and development.

## Future Enhancements

### macOS Keychain Integration

The mock storage can be replaced with actual macOS Keychain storage using the Security framework:

```swift
import Security

// Example keychain implementation (not included yet)
public static func setItem(_ key: String, value: String) {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecValueData as String: value.data(using: .utf8)!
    ]

    SecItemDelete(query as CFDictionary)
    SecItemAdd(query as CFDictionary, nil)
}
```

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
