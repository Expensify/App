# Expensify App

## Repository Overview

### Technology Stack
- **Framework**: React Native
- **Language**: TypeScript
- **State Management**: React Native Onyx
- **Navigation**: React Navigation
- **Platforms**: iOS, Android, Web

## HybridApp Architecture (Critical Context)

**IMPORTANT**: The mobile application is built from the Mobile-Expensify submodule, not directly from the App repository.
**IMPORTANT**: NewDot refers to the new Expensify App, OldDot or Expensify Classic refers to our Old expensify app and website

### Key Integration Points
- App (NewDot) and Mobile-Expensify (OldDot) are combined into a single mobile application
- The HybridApp module (`@expensify/react-native-hybrid-app`) manages transitions between OldDot and NewDot
- Build process merges dotenv configurations from both repositories
- Environment variables from Mobile-Expensify take precedence over App variables
- Mobile builds **must** be initiated from the Mobile-Expensify directory

### Build Modes
- **Standalone**: Pure NewDot application (web)
- **HybridApp**: Combined OldDot + NewDot (mobile apps)
- Controlled via `STANDALONE_NEW_DOT` environment variable

## Core Architecture & Structure

### Entry Points
- `src/App.tsx`: Main application component with provider hierarchy
- `src/Expensify.tsx`: Core application logic and initialization
- `src/HybridAppHandler.tsx`: Manages HybridApp transitions and authentication
- `index.js`: React Native entry point

### Provider Architecture
The application uses a nested provider structure for context management:
1. **SplashScreenStateContextProvider**: Manages splash screen visibility
2. **InitialURLContextProvider**: Handles deep linking
3. **ThemeProvider**: Theme management
4. **LocaleContextProvider**: Internationalization
5. **OnyxListItemProvider**: Data layer provider
6. **SafeAreaProvider**: Device safe areas
7. **PopoverContextProvider**: Global popover state
8. **KeyboardProvider**: Keyboard state management

### Data Layer
- **Onyx**: Custom data persistence layer for offline-first functionality
- **ONYXKEYS.ts**: Centralized key definitions for data store
- Supports optimistic updates and conflict resolution

## Key Features & Modules

### Core Functionality
1. **Expense Management**
   - Receipt scanning and SmartScan
   - Expense creation and editing
   - Distance tracking
   - Per diem support
   - Split expenses

2. **Reporting**
   - Report creation and submission
   - Approval workflows
   - Report fields and custom attributes
   - Bulk operations

3. **Workspace/Policy Management**
   - Policy creation and configuration
   - Member management
   - Categories, tags, and tax rates
   - Accounting integration settings
   - Approval workflows

4. **Travel**
   - Trip management
   - Travel booking integration
   - Travel policy enforcement

5. **Search & Filtering**
   - Advanced search with filters
   - Saved searches
   - Search parser (Peggy-based)

6. **Payment & Cards**
   - Expensify Card management
   - Bank account connections (Plaid)
   - Payment methods
   - Company cards integration
   - Wallet functionality

7. **Accounting Integrations**
   - QuickBooks Online
   - Xero
   - NetSuite
   - Sage Intacct
   - QuickBooks Desktop
   - Generic accounting connections

8. **Communication**
   - Chat functionality
   - Task management
   - Mentions and notifications
   - Thread organization

9. **Invoice Management**
   - Invoice creation and sending
   - Invoice rooms

## Navigation & Routing

### Structure
- `src/SCREENS.ts`: Screen name constants
- `src/ROUTES.ts`: Route definitions and builders
- `src/NAVIGATORS.ts`: Navigator configuration

### Key Navigators
- **ProtectedScreens**: Authenticated app screens
- **PublicScreens**: Login and onboarding screens
- **RHP (Right Hand Panel/Pane)**: Settings and details panel
- **Central Pane**: Main content area
- **LHN (Left Hand Navigation)**: Report list and navigation
- **RHP**: Contextual panels and settings

## State Management

### Onyx Keys Organization
- **Session**: Authentication and user session
- **Personal Details**: User profiles and preferences
- **Reports**: Chat and expense reports
- **Transactions**: Expense transactions
- **Policy**: Workspace configuration
- **Forms**: Form state management

### Action Modules (`src/libs/actions/`)
Major action categories:
- `App.ts`: Application lifecycle
- `IOU.ts`: Money requests and expenses
- `Report.ts`: Report management
- `Policy/`: Workspace operations
- `User.ts`: User account operations
- `Session.ts`: Authentication
- `Search.ts`: Search operations
- `Travel.ts`: Travel features

## Build & Deployment

### CI/CD Workflows
Key GitHub Actions workflows:
- `deploy.yml`: Production deployment
- `preDeploy.yml`: Staging deployment
- `testBuild.yml`: PR test builds
- `test.yml`: Unit tests
- `typecheck.yml`: TypeScript validation
- `lint.yml`: Code quality checks
- `e2ePerformanceTests.yml`: Performance testing

## Related Repositories

### Mobile-Expensify (Submodule)
- **Path**: `App/Mobile-Expensify/`
- **Purpose**: Legacy OldDot application and mobile build source
- **Critical**: All mobile builds originate from this directory
- Contains platform-specific code for iOS and Android
- Manages the HybridApp integration layer

### expensify-common
- **Purpose**: Shared libraries and utilities
- Contains common validation, parsing, and utility functions
- Used across multiple Expensify repositories

## Development Practices

### React Native Best Practices
Use the `/react-native-best-practices` skill when working on performance-sensitive code, native modules, or release preparation. This ensures code respects established best practices from the start, resulting in more consistent code, fewer review iterations, and better resilience against regressions.

The skill provides guidance on:
- **Performance**: FPS optimization, virtualized lists (FlashList), memoization, atomic state, animations
- **Bundle & App Size**: Barrel imports, tree shaking, bundle analysis, R8 shrinking
- **Startup (TTI)**: Hermes mmap, native navigation, deferred work
- **Native Modules**: Turbo Module development, threading model, Swift/Kotlin/C++ patterns
- **Memory**: JS and native memory leak detection and patterns
- **Build Compliance**: Android 16KB page alignment (Google Play requirement)
- **Platform Tooling**: Xcode/Android Studio profiling and debugging setup

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Linter
- **Prettier**: Automatic formatting
- **Patch Management**: patch-package for dependency fixes

### Testing
- **Unit Tests**: Jest with React Native Testing Library
- **E2E Tests**: Custom test runner
- **Performance Tests**: Reassure framework

## Special Considerations

### Offline-First Architecture
- All features work offline
- Optimistic updates with rollback
- Queue-based request handling
- Conflict resolution strategies

### Mobile-Specific Notes
- Push notifications via Airship
- Mapbox integration for location features
- Camera and gallery access

### Security
- Content Security Policy enforcement
- Two-factor authentication support

## Documentation Resources

### Help Documentation
- **NewDot Help**: https://help.expensify.com/new-expensify/hubs/
- **OldDot/Expensify Classic Help**: https://help.expensify.com/expensify-classic/hubs/

## Development Setup Requirements

## Command Reference

### Common Tasks
```bash
# Install dependencies
npm install

# Clean build artifacts
npm run clean

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test
```

### Platform Builds
```bash
# iOS build
npm run ios

# Android build
npm run android

# Web build
npm run web
```

## Development Environment

### Dev Server
- **Location**: Runs on HOST machine (not in VM)
- **URL**: `https://dev.new.expensify.com:8082/`
- **Start command**: `npm run web`
- **VM is only for**: Backend services (Auth, Bedrock, Integration-Server, Web-Expensify)

### Browser Testing
Use the `/playwright-app-testing` skill to test and debug the App in a browser. Use this skill after making frontend changes to verify your work, or when the user requests testing.

## Architecture Decisions

### React Native New Architecture
- Fabric renderer enabled
- TurboModules for native module integration
- Hermes JavaScript engine

### State Management Choice
- Custom Onyx library for offline-first capabilities
- Optimistic updates as default pattern
- Centralized action layer for API calls
- Direct key-value storage with automatic persistence

### Navigation Strategy
- React Navigation for cross-platform consistency
- Custom navigation state management
- Deep linking support

## Known Integration Points

### With Mobile-Expensify
- Session sharing via HybridApp module
- Navigation handoff between apps
- Shared authentication state
- Environment variable merging

### With Backend Services
- RESTful API communication
- WebSocket connections via Pusher
- Real-time synchronization
