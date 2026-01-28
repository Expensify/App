# Import static assets

This document explains how to work with lazy-loaded icons and illustrations in the Expensify App. The lazy loading system helps reduce initial bundle size by deferring the loading of icon and illustration assets until they're needed.

## Overview

The app uses a chunk-based lazy loading system for:
- **Illustrations**: Large, decorative SVG images used in empty states, onboarding, and feature showcases
- **Expensify Icons**: Smaller icon assets used throughout the UI

Both systems follow similar patterns but are handled separately to optimize bundle splitting.

## Architecture

### Core Components

1. **Loader Modules** (`IllustrationLoader.ts`, `ExpensifyIconLoader.ts`)
   - Handle chunk loading and caching
   - Provide functions to load individual assets or entire chunks
   - Implement error handling and retry logic

2. **Chunk Files** (`chunks/illustrations.chunk.ts`, `chunks/expensify-icons.chunk.ts`)
   - Contain all SVG imports for their respective asset types
   - Provide lookup functions (`getIllustration`, `getExpensifyIcon`)

3. **React Hooks** (`useLazyAsset.ts`)
   - Provide convenient React hooks for component usage
   - Handle loading states, error states, and fallbacks
   - Support loading multiple assets at once

### How It Works

1. **Chunk Loading**: When an asset is requested, the entire chunk is loaded via dynamic `import()` with webpack chunking
2. **Caching**: Once loaded, chunks are cached in memory to avoid redundant network requests
3. **Error Handling**: Failed loads fall back to `PlaceholderIcon` to prevent UI breakage

## Usage Patterns

### Pattern 1: Loading Multiple Assets (Recommended)

Use this pattern when you need multiple icons/illustrations in a component. The chunk is loaded once and all assets are available.

```tsx
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

function MyComponent() {
    // Load multiple illustrations at once
    const illustrations = useMemoizedLazyIllustrations(['Building', 'FolderOpen', 'Tag']);

    return (
        <View>
            <Icon src={illustrations.Building} />
            <Icon src={illustrations.FolderOpen} />
            <Icon src={illustrations.Tag} />
        </View>
    );
}
```
### Pattern 2: Loading Expensify Icons

Same pattern as illustrations, but for Expensify icons:

```tsx
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

function NavigationBar() {
    const icons = useMemoizedLazyExpensifyIcons(['Home', 'Inbox', 'MoneySearch']);

    return (
        <View>
            <Icon src={icons.Home} />
            <Icon src={icons.Inbox} />
            <Icon src={icons.MoneySearch} />
        </View>
    );
}
```

### Pattern 3: Loading a Single Asset

For single assets, use `useMemoizedLazyAsset` with the loader function:

```tsx
import {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';

function EmptyState() {
    const {asset} = useMemoizedLazyAsset(
        () => loadIllustration('Building'),
        PlaceholderIcon // Optional fallback
    );

    return <Icon src={asset} />;
}
```

**Note**: The multi-asset hooks (Pattern 1 and 2) are generally preferred as they're more efficient when loading multiple assets.

## Available Asset Names

### Illustrations

Check `src/components/Icon/chunks/illustrations.chunk.ts` for the complete list. Common examples:
- `Building`
- `FolderOpen`
- `Tag`
- `Coins`
- `Rules`
- `CompanyCard`
- `Workflows`
- `InvoiceBlue`
- `PerDiem`
- `HandCard`
- `Telescope`
- `ExpensifyCardImage`
- And many more...

### Expensify Icons

Check `src/components/Icon/chunks/expensify-icons.chunk.ts` for the complete list. Common examples:
- `Home`
- `Inbox`
- `MoneySearch`
- `Buildings`
- `Receipt`
- `CreditCard`
- `User`
- `Gear`
- And many more...

## Adding New Assets

### Adding a New Illustration

1. **Add the import** to `src/components/Icon/chunks/illustrations.chunk.ts`:
   ```ts
   import MyNewIllustration from '@assets/images/my-new-illustration.svg';
   ```

2. **Add to the Illustrations object**:
   ```ts
   const Illustrations = {
       // ... existing illustrations
       MyNewIllustration,
   };
   ```

3. **Add to the switch statement** in `getIllustration()` (optional, but recommended for type safety):
   ```ts
   function getIllustration(illustrationName: string): unknown {
       switch (illustrationName) {
           // ... existing cases
           case 'MyNewIllustration':
               return MyNewIllustration;
           default:
               return (Illustrations as Record<string, unknown>)[illustrationName];
       }
   }
   ```

### Adding a New Expensify Icon

1. **Add the import** to `src/components/Icon/chunks/expensify-icons.chunk.ts`:
   ```ts
   import MyNewIcon from '@assets/images/my-new-icon.svg';
   ```

2. **Add to the ExpensifyIcons object**:
   ```ts
   const ExpensifyIcons = {
       // ... existing icons
       MyNewIcon,
   };
   ```

## Migration Guide

### Migrating Existing Code

If you're migrating existing code from direct loading to lazy loading:

#### Step-by-Step Migration Process

1. **Identify Direct Imports**
   - Search for imports from `@components/Icon/Illustrations` or `@components/Icon/Expensicons`
   - Run `npm run check-lazy-loading` to automatically detect all files that need migration


2. **Replace with Lazy Loading**

   **Before (Direct):**
   ```tsx
   import {Building} from '@components/Icon/Illustrations';

   function Component() {
       return <Icon src={Building} />;
   }
   ```

   **After (Lazy - Single Asset):**
   ```tsx
   import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

   function Component() {
       const illustrations = useMemoizedLazyIllustrations(['Building']);
       return <Icon src={illustrations.Building} />;
   }
   ```

   **Before (Multiple Direct Imports):**
   ```tsx
   import {Building, Tag, Coins} from '@components/Icon/Illustrations';

   function Component() {
       return (
           <View>
               <Icon src={Building} />
               <Icon src={Tag} />
               <Icon src={Coins} />
           </View>
       );
   }
   ```

   **After (Lazy - Multiple Assets):**
   ```tsx
   import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

   function Component() {
       const illustrations = useMemoizedLazyIllustrations(['Building', 'Tag', 'Coins']);
       return (
           <View>
               <Icon src={illustrations.Building} />
               <Icon src={illustrations.Tag} />
               <Icon src={illustrations.Coins} />
           </View>
       );
   }
   ```

3. **Handle Namespace Imports**

   **Before (Namespace Import):**
   ```tsx
   import * as Expensicons from '@components/Icon/Expensicons';

   function Component() {
       return <Icon src={Expensicons.Home} />;
   }
   ```

   **After (Lazy):**
   ```tsx
   import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';

   function Component() {
       const icons = useMemoizedLazyExpensifyIcons(['Home']);
       return <Icon src={icons.Home} />;
   }
   ```