# GroupIB FP Wrapper

A cross-platform wrapper for the GroupIB Fraud Protection (FP) SDK that provides a unified interface across iOS, Android, web, and desktop platforms.

## Features

- ✅ **Cross-platform**: Works on iOS, Android, web, and desktop
- ✅ **Type-safe**: Full TypeScript support with comprehensive type definitions
- ✅ **Auto-configuration**: Automatically enables safe capabilities that don't require permissions
- ✅ **Platform detection**: Automatically detects platform and uses appropriate implementation
- ✅ **Stub implementations**: Provides stub implementations for web and desktop for development purposes
- ✅ **Simple API**: Default export object with consistent methods across platforms

## Usage

### Basic Usage

```typescript
import GroupIBFP from '@libs/GroupIBFP';
import type { UserMetadata } from '@src/types/onyx';

// Initialize the SDK
GroupIBFP.initialize();

// Set session ID when user session starts
GroupIBFP.setSessionId('user-session-id-12345');

// Set user login information
const userMetadata: UserMetadata = {
    email: 'user@example.com',
    // ... other user data
};
GroupIBFP.setLogin(userMetadata);

// Send custom events
GroupIBFP.sendEvent('payment_initiated');
GroupIBFP.sendEvent('login_attempt');

// Set custom attributes
GroupIBFP.setAttribute('user_type', 'premium');
GroupIBFP.setAttribute('device_trust_score', '85');
```

### Advanced Usage

```typescript
import GroupIBFP from '@libs/GroupIBFP';
import { FPAttributeFormat } from 'group-ib-fp';

// Initialize the SDK
GroupIBFP.initialize();

// Set attributes with different formats
GroupIBFP.setAttribute('transaction_amount', '1000.00', FPAttributeFormat.ClearText);
GroupIBFP.setAttribute('user_id', 'user123', FPAttributeFormat.Hash);

// Send events for different user actions
GroupIBFP.sendEvent('profile_updated');
GroupIBFP.sendEvent('password_changed');
GroupIBFP.sendEvent('suspicious_activity_detected');
```

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| iOS | ✅ Full Support | All safe capabilities enabled automatically |
| Android | ✅ Full Support | All safe capabilities enabled automatically |
| Web | ⚠️ Stub Implementation | Logs operations but doesn't perform actual fraud protection |
| Desktop | ⚠️ Stub Implementation | Falls back to web implementation |

## API Reference

### Methods

```typescript
// Initialize the SDK with platform-specific configuration
initialize(): void

// Set session ID for user session tracking
setSessionId(sessionId: string): void

// Set user login information
setLogin(userMetadata: UserMetadata): void

// Set custom attributes with optional format
setAttribute(attributeTitle: string, attributeValue: string, format?: FPAttributeFormat): void

// Send custom events (shorthand for setAttribute with 'event_type')
sendEvent(eventName: string): void
```

### Configuration

The SDK automatically uses configuration from `CONFIG.GROUP_IB_FP`:

```typescript
// Configuration is automatically loaded from CONFIG
CONFIG.GROUP_IB_FP = {
    CID: {
        ios: 'your-ios-customer-id',
        android: 'your-android-customer-id',
    },
    BACK_URL: 'https://your-target-url.com',
    GID_URL: 'https://your-global-id-url.com', // Android only
};
```

### Types

```typescript
import type { UserMetadata } from '@src/types/onyx';
import { FPAttributeFormat } from 'group-ib-fp';

// FPAttributeFormat values:
// - FPAttributeFormat.ClearText
// - FPAttributeFormat.Hash
```

## iOS Capabilities

The following iOS capabilities are automatically enabled:

### Auto-Enabled Safe Capabilities
- **Swizzle** - Runtime method injection (required for other capabilities)
- **Call** - Logs call events (incoming/outgoing/VoIP)
- **DeviceStatus** - Proximity sensor data
- **Capture** - Screenshot/screen recording detection
- **Audio** - Audio output source monitoring
- **Proxy** - VPN/Proxy detection
- **Apps** - Installed applications detection
- **Keyboard** - Software keyboard information
- **WebView** - WKWebView tracking and JavaScript injection
- **PreventScreenshots** - Prevents screenshots (use carefully)
- **Security** - Jailbreak and reverse engineering tool detection
- **PortScan** - GoldDigger malware detection
- **Cellular** - SIM card parameters
- **Location** - Device location (requires permission)
- **Network** - Network information (requires permission)

## Android Capabilities

The following Android capabilities are automatically enabled:

### Auto-Enabled Safe Capabilities
- **ActivityCollection** - User interaction and navigation tracking
- **MotionCollection** - Device sensor data (requires ActivityCollection)
- **AccessPointsCollection** - Wi-Fi access points data
- **CellsCollection** - Cellular network data
- **Location** - Device location data
- **GlobalIdentification** - Global device identification

## Common Use Cases

### 1. User Authentication Flow
```typescript
// When user starts login
GroupIBFP.sendEvent('login_started');

// When login succeeds
GroupIBFP.setLogin(userMetadata);
GroupIBFP.sendEvent('login_success');

// Set session ID
GroupIBFP.setSessionId(sessionId);
```

### 2. Transaction Monitoring
```typescript
// Before transaction
GroupIBFP.sendEvent('transaction_initiated');
GroupIBFP.setAttribute('transaction_amount', amount.toString());
GroupIBFP.setAttribute('payment_method', paymentMethod);

// After transaction
GroupIBFP.sendEvent('transaction_completed');
```

### 3. Security Events
```typescript
// Suspicious activity detection
GroupIBFP.sendEvent('suspicious_activity');
GroupIBFP.setAttribute('risk_score', riskScore.toString());

// Failed attempts
GroupIBFP.sendEvent('login_failed');
GroupIBFP.setAttribute('failure_reason', reason);
```

## Important Notes

1. **Automatic Initialization**: The SDK initializes automatically with CONFIG values
2. **Platform Detection**: Automatically uses appropriate implementation for each platform
3. **Error Handling**: All errors are logged but don't throw exceptions
4. **Web/Desktop**: Stub implementations for development and testing
5. **Session Tracking**: Use `setSessionId()` for proper session correlation
6. **Event Naming**: Use descriptive event names for better fraud detection

## Troubleshooting

### Common Issues

1. **Missing CONFIG**: Ensure `CONFIG.GROUP_IB_FP` is properly configured
2. **Capabilities failing**: Check platform-specific capability requirements
3. **No events received**: Verify target URL configuration
4. **Session correlation**: Ensure `setSessionId()` is called after login

### Debug Logging

All operations are automatically logged through the app's logging system with `[GroupIB FP]` prefix for easy filtering.

## Security Considerations

- **User Privacy**: Only collect necessary data for fraud prevention
- **Session Management**: Properly manage session IDs for user privacy
- **Event Naming**: Use non-sensitive event names
- **Data Minimization**: Only send required attributes for fraud detection