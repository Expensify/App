# AI Agent Development Guide

This guide provides specific instructions for AI agents working on the Expensify App codebase. For general project setup, architecture, and development guidelines, please refer to the [README.md](README.md) and the [contributingGuides](contributingGuides/) folder.

## Key Principles for AI Development

1. **Data Flow Understanding**
   - Always follow the data flow pattern described in the README's [Philosophy section](README.md#philosophy)
   - Use Onyx for state management as the single source of truth
   - Never modify Onyx data directly from UI components - use Actions instead

2. **Code Organization**
   - Place platform-specific code in dedicated files/folders
   - Use the appropriate file extensions for platform-specific code:
     - `index.native.js` for mobile
     - `index.ios.js`/`index.android.js` for platform-specific native code
     - `index.website.js` for web
     - `index.desktop.js` for desktop
   - Keep shared code in `index.js`

3. **Internationalization**
   - Always use the translation system for user-facing text
   - Use the `withLocalize` HOC for components needing translations
   - Follow the pluralization rules for translations
   - Use longer, more complex strings in translation files to accommodate different language structures

4. **Security Considerations**
   - Follow the security rules outlined in the README's [Security section](README.md#security)
   - Never hardcode sensitive information
   - Always validate user permissions before allowing actions

5. **Performance Optimization**
   - Use Onyx derived values for expensive computations
   - Follow the guidelines in the README's [Onyx derived values section](README.md#onyx-derived-values)
   - Consider offline-first principles when implementing features

## Common Tasks

### Adding New Features
1. Review existing similar features for patterns
2. Follow the data flow pattern:
   - Server -> Pusher event -> Action -> Onyx -> UI
   - UI -> Action -> Server
3. Implement platform-specific code in appropriate files
4. Add translations for all user-facing text
5. Add appropriate security checks

### Modifying Existing Features
1. Locate the relevant Onyx keys in `ONYXKEYS.js`
2. Check the Actions that manage the data
3. Review the UI components that consume the data
4. Ensure changes maintain the data flow pattern
5. Update translations if text changes

### Debugging
1. Use the debugging tools mentioned in the README's [Debugging section](README.md#debugging)
2. For web development, use the exposed Onyx object in the console
3. For performance issues, use the Release Profiler as described in the README

## Best Practices

1. **Code Style**
   - Follow the style guide in [STYLE.md](STYLE.md)
   - Keep platform-specific code isolated
   - Write pure functions for data transformations

2. **Testing**
   - Write unit tests for new features
   - Follow the testing guidelines in the README's [Running the tests section](README.md#running-the-tests)

3. **Documentation**
   - Document complex logic
   - Add comments for platform-specific code
   - Update translations when adding new text

4. **Error Handling**
   - Handle missing or incomplete data gracefully
   - Implement proper error states in UI
   - Use appropriate error messages from translations

## Common Pitfalls to Avoid

1. **Direct Onyx Manipulation**
   - Never call `Onyx.set()` or `Onyx.merge()` from UI components
   - Always use Actions to modify Onyx data

2. **Platform-Specific Code**
   - Don't use platform-specific code in shared files
   - Don't duplicate platform-specific logic

3. **Internationalization**
   - Don't hardcode text
   - Don't assume text order in translations
   - Don't forget to handle pluralization

4. **Performance**
   - Don't perform expensive computations in render methods
   - Don't create unnecessary Onyx subscriptions
   - Don't ignore offline-first principles

Remember to always refer to the [README.md](README.md) for the most up-to-date project information and guidelines.