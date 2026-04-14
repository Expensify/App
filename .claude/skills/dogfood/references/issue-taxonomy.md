# Issue Taxonomy (Mobile)

Reference for categorizing issues found during mobile dogfooding.

## Severity Levels

| Severity     | Definition                                                                |
| ------------ | ------------------------------------------------------------------------- |
| **critical** | Blocks a core workflow, causes data loss, or crashes/freeze loops the app |
| **high**     | Major feature broken or unusable, no practical workaround                 |
| **medium**   | Feature works with notable friction or partial failure; workaround exists |
| **low**      | Minor cosmetic or polish issue                                            |

## Categories

### Visual / UI

- Layout broken, clipped, overlapped, or unreadable text
- Safe-area/notch overlap issues
- Incorrect dark/light appearance rendering
- Missing assets/icons
- Animation glitches or flicker

### Functional

- Buttons/controls do nothing or trigger wrong action
- Flows fail (create/edit/delete/submit)
- Navigation dead-ends or wrong destination
- State loss after background/foreground transitions
- Deep link opens wrong screen or fails

### UX

- Confusing hierarchy or navigation labels
- Missing loading/progress feedback
- Unclear error handling or no recovery affordance
- Excessive steps for common tasks
- Inconsistent behavior between similar screens

### Content

- Typos, incorrect copy, placeholder text
- Wrong labels/help text
- Truncated text with no affordance
- Inconsistent terminology across screens

### Performance

- Slow startup or route transitions
- Input lag or gesture jank
- Scroll hitches/frame drops
- Notable battery/thermal symptoms during basic usage

### Diagnostics / Logs

- Native crashes or repeated fatal exceptions
- Repeated warnings correlated with broken behavior
- Unhandled runtime errors visible during repro

### Permissions / Platform

- Permission prompt flow broken or loops forever
- Denied permissions not handled gracefully
- Platform-specific regressions (iOS-only or Android-only)
- Background/foreground lifecycle regressions

### Accessibility

- Missing labels or incorrect accessibility names
- Focus order/navigation issues for assistive tech
- Low contrast or unreadable text scaling
- Touch targets too small for reliable interaction

## Exploration Checklist

1. Visual scan: capture screenshot; verify layout/safe areas/text/icon rendering.
2. Interactions: press controls, open menus/modals, validate expected response.
3. Forms/input: test valid/invalid/empty/boundary input.
4. Navigation: traverse all top-level sections and return paths.
5. App states: loading/empty/error/offline/permission-denied/background-resume.
6. Logs/diagnostics: inspect app logs when behavior is suspicious.
7. Platform parity: verify critical flows on each requested platform.
8. Accessibility basics: labels, touch target sizes, readability/contrast.
