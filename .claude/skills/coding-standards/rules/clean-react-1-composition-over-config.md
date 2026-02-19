---
ruleId: CLEAN-REACT-PATTERNS-1
title: Favor composition over configuration
---

## [CLEAN-REACT-PATTERNS-1] Favor composition over configuration

### Reasoning

When features are implemented by adding configuration to components — whether boolean flags, optional content props, or large prop interfaces — the component must be modified every time a consumer needs different behavior. This increases coupling, surface area, and regression risk at scale. Composition treats features as independent building blocks: a Provider manages shared state, sub-components (blocks) render independently via context or direct props, and consumers add/remove features by including or excluding blocks. The component never changes. This applies equally to simple widgets and complex multi-feature UIs.

Reference: [Composition Pattern Guide](https://composition-pattern-starter.vercel.app/comparison)

### Incorrect

#### Incorrect (configuration — boolean flags)

- Features controlled by boolean flags
- Adding a new feature requires modifying the component's API and internals

```tsx
<Table
  data={items}
  columns={columns}
  shouldShowSearchBar
  shouldShowHeader
  shouldEnableSorting
  shouldShowPagination
  shouldHighlightOnHover
/>

type TableProps = {
  data: Item[];
  columns: Column[];
  shouldShowSearchBar?: boolean;    // Could be <Table.SearchBar />
  shouldShowHeader?: boolean;       // Could be <Table.Header />
  shouldEnableSorting?: boolean;    // Configuration for header behavior
  shouldShowPagination?: boolean;   // Could be <Table.Pagination />
  shouldHighlightOnHover?: boolean; // Configuration for styling behavior
};
```

#### Incorrect (configuration — content props)

- Optional content props control which UI elements appear
- Each optional prop maps 1:1 to a conditional render block inside the component
- Adding a new element (e.g., badge) requires modifying the component's props AND internals

```tsx
<BaseWidgetItem
    icon={icon}
    iconBackgroundColor={theme.widgetIconBG}
    iconFill={theme.widgetIconFill}
    title={translate(translationKey, {count})}
    subtitle={subtitle}
    ctaText={translate('homePage.forYouSection.begin')}
    onCtaPress={handler}
/>

// Inside the component — conditional rendering controlled by props:
function BaseWidgetItem({icon, iconBackgroundColor, title, subtitle, ctaText, onCtaPress, iconFill}: BaseWidgetItemProps) {
    return (
        <View>
            <View style={styles.getWidgetItemIconContainerStyle(iconBackgroundColor)}>
                <Icon src={icon} fill={iconFill ?? theme.white} />
            </View>
            <View>
                {!!subtitle && <Text style={styles.widgetItemSubtitle}>{subtitle}</Text>}  // ❌ Prop exists solely for this conditional
                <Text style={styles.widgetItemTitle}>{title}</Text>
            </View>
            <Button text={ctaText} onPress={onCtaPress} />
        </View>
    );
}
```

#### Incorrect (configuration — ReactNode slot props)

- Passing JSX via named props is still configuration — the component must know about each slot
- Adding a new slot (e.g., `badgeComponent`) requires modifying the component's props AND internals
- Each slot prop often drags along associated style/behavior props (`leftComponentStyle`, `shouldShowRightComponent`)
- The consumer can't reorder, wrap, or compose slots — the component controls layout

```tsx
<MenuItem
    title="Settings"
    leftComponent={<Avatar source={avatarURL} />}
    rightComponent={<Badge count={unreadCount} />}
    furtherDetailsComponent={<CustomDetails />}
/>

type MenuItemProps = {
    title: string;
    leftComponent?: ReactNode;            // Positional slot configured via prop
    rightComponent?: ReactNode;           // Another positional slot
    furtherDetailsComponent?: ReactElement; // Yet another slot
};

// Inside the component — each slot is a conditional render:
function MenuItem({title, leftComponent, rightComponent, furtherDetailsComponent}: MenuItemProps) {
    return (
        <View style={styles.row}>
            {!!leftComponent && <View style={styles.left}>{leftComponent}</View>}
            <Text>{title}</Text>
            {!!rightComponent && rightComponent}
            {!!furtherDetailsComponent && <View style={styles.details}>{furtherDetailsComponent}</View>}
        </View>
    );
}
```

#### Incorrect (configuration — monolithic prop interface)

- All features threaded through props
- Every piece of state and behavior configured from outside
- Adding a new feature (e.g., a new tab, a new button) requires expanding the prop interface

```tsx
<SettingsDialog
    isOpen={isOpen}
    onClose={onClose}
    title="Settings"
    description="Manage your preferences"
    tabs={tabs}
    activeTab={activeTab}
    onTabChange={handleTabChange}
    onSave={handleSave}
    onReset={handleReset}
    values={formValues}
    onChange={handleChange}
    // ... props grow with every feature
/>
```

#### Incorrect (configuration — config-array driven rendering)

- Statically-known items encoded as data instead of declared as JSX
- The generic component must handle every possible config shape
- Business logic leaks into data declarations (filters, conditionals)
- Adding behavior means expanding the config schema, not adding a component

```tsx
// A) Basic: statically-known actions encoded as a config array
<Actions actions={[
    {icon: 'Plus', isMenu: true, menuItems: [...]},
    {icon: 'TextFormat', onPress: onFormat},
    {icon: 'Emoji', onPress: onEmoji},
]} />
```

```tsx
// B) With embedded conditionals (worse): business logic mixed into data declarations
const todoItems = [
    {
        key: 'submit',
        count: submitCount,
        icon: Send,
        translationKey: '...',
        handler: handleSubmit,
    },
    {
        key: 'approve',
        count: approveCount,
        icon: ThumbsUp,
        translationKey: '...',
        handler: handleApprove,
    },
].filter((item) => item.count > 0);

{todoItems.map(({key, icon, ...rest}) => (
    <BaseWidgetItem key={key} icon={icon} {...rest} />
))}
```

#### Incorrect (configuration — render function props)

- Render functions are configuration disguised as flexibility — the component still owns each slot
- Each `render*` prop is an alternative to a composable child component
- The component must call each function and manage the fallback logic
- Adding a new renderable area means adding a new `render*` prop to the interface

```tsx
<Section
    title="Features"
    renderSubtitle={() => (
        <View>
            <Text style={styles.subtitle}>Advanced features for your workspace</Text>
            <Badge type="new" />
        </View>
    )}
    overlayContent={() => isLoading && <LoadingOverlay />}
/>

// Inside the component — render functions called inline:
function Section({title, renderSubtitle, renderTitle, overlayContent}: SectionProps) {
    return (
        <View>
            {renderTitle ? renderTitle() : <Text>{title}</Text>}
            {renderSubtitle ? renderSubtitle() : null}
            {children}
            {overlayContent?.()}
        </View>
    );
}
```

### Correct

#### Correct (composition — boolean features)

- Features expressed as composable children
- Parent stays stable; add features by adding children

```tsx
<Table data={items} columns={columns}>
  <Table.SearchBar />
  <Table.Header />
  <Table.Body />
</Table>
```

#### Correct (composition — compound component)

- UI elements are composable children the consumer includes or omits
- Adding a new element (e.g., Subtitle, Badge) never changes existing sub-components
- Each sub-component is a small, focused function with its own styles

```tsx
// Implementation — each sub-component owns its behavior:

function Container({children, onPress, accessibilityLabel}: {children: React.ReactNode; onPress?: () => void; accessibilityLabel?: string}) {
    const styles = useThemeStyles();
    const content = <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>{children}</View>;

    if (onPress) {
        return (
            <PressableWithFeedback onPress={onPress} accessibilityLabel={accessibilityLabel} accessibilityRole="button">
                {content}
            </PressableWithFeedback>
        );
    }
    return content;
}

function WidgetIcon({src, backgroundColor, fill}: {src: IconAsset; backgroundColor: string; fill?: string}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    return (
        <View style={styles.getWidgetItemIconContainerStyle(backgroundColor)}>
            <Icon src={src} width={variables.iconSizeNormal} height={variables.iconSizeNormal} fill={fill ?? theme.white} />
        </View>
    );
}

function Content({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    return <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter]}>{children}</View>;
}

function Title({children, numberOfLines}: {children: React.ReactNode; numberOfLines?: number}) {
    const styles = useThemeStyles();
    return <Text style={styles.widgetItemTitle} numberOfLines={numberOfLines}>{children}</Text>;
}

function Subtitle({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    return <Text style={styles.widgetItemSubtitle}>{children}</Text>;
}

function Action({onPress, isLoading, children}: {onPress: () => void; isLoading?: boolean; children: string}) {
    const styles = useThemeStyles();
    return <Button text={children} onPress={onPress} success small isLoading={isLoading} style={styles.widgetItemButton} />;
}

const WidgetItem = {Container, Icon: WidgetIcon, Content, Title, Subtitle, Action};
export default WidgetItem;
```

```tsx
// Usage — consumer decides what to render:
<WidgetItem.Container>
    <WidgetItem.Icon src={icon} backgroundColor={theme.widgetIconBG} fill={theme.widgetIconFill} />
    <WidgetItem.Content>
        <WidgetItem.Title>{translate(translationKey, {count})}</WidgetItem.Title>
    </WidgetItem.Content>
    <WidgetItem.Action onPress={handler}>{beginText}</WidgetItem.Action>
</WidgetItem.Container>

// Need a subtitle? Add it — no changes to any existing sub-component:
<WidgetItem.Container>
    <WidgetItem.Icon src={icon} backgroundColor={theme.widgetIconBG} fill={theme.widgetIconFill} />
    <WidgetItem.Content>
        <WidgetItem.Subtitle>{subtitle}</WidgetItem.Subtitle>
        <WidgetItem.Title>{title}</WidgetItem.Title>
    </WidgetItem.Content>
    <WidgetItem.Action onPress={handler}>{beginText}</WidgetItem.Action>
</WidgetItem.Container>
```

#### Correct (composition — Provider + Blocks)

- Provider manages shared state, sub-components render independently
- Each block connects to state through context — no props between blocks
- Features are optional building blocks: add by including, remove by excluding

```tsx
<Settings.Provider>
    <Settings.Trigger>
        <Button>Open Settings</Button>
    </Settings.Trigger>

    <Settings.Dialog>
        <Settings.Header title="Settings" description="Manage your preferences" />

        <Settings.Content>
            {/* Form content */}
        </Settings.Content>

        <Settings.Footer>
            <Settings.ResetButton />
            <Settings.SaveButton />
        </Settings.Footer>
    </Settings.Dialog>
</Settings.Provider>

// No props between blocks — context manages everything
// Adding a new section doesn't change the Provider or other blocks
```

#### Correct (composition — declarative JSX over config arrays)

- Each item is explicit JSX — visible in the component tree
- Conditional rendering is standard JSX (`{count > 0 && ...}`), not data-level filtering
- No generic component needs to interpret a config schema
- Adding/removing items means adding/removing JSX, not expanding a data structure

```tsx
// Each item declared as JSX — self-contained, type-safe, independently modifiable
<ForYouSection.Container>
    {submitCount > 0 && (
        <WidgetItem.Container onPress={handleSubmit}>
            <WidgetItem.Icon src={Send} backgroundColor={theme.widgetIconBG} />
            <WidgetItem.Content>
                <WidgetItem.Title>{translate('homePage.forYouSection.submit', {count: submitCount})}</WidgetItem.Title>
            </WidgetItem.Content>
            <WidgetItem.Action onPress={handleSubmit}>{beginText}</WidgetItem.Action>
        </WidgetItem.Container>
    )}
    {approveCount > 0 && (
        <WidgetItem.Container onPress={handleApprove}>
            <WidgetItem.Icon src={ThumbsUp} backgroundColor={theme.widgetIconBG} />
            <WidgetItem.Content>
                <WidgetItem.Title>{translate('homePage.forYouSection.approve', {count: approveCount})}</WidgetItem.Title>
            </WidgetItem.Content>
            <WidgetItem.Action onPress={handleApprove}>{beginText}</WidgetItem.Action>
        </WidgetItem.Container>
    )}
</ForYouSection.Container>
```

#### Correct (composition — compound component slots over ReactNode props)

- Each slot is a composable child — visible in the JSX tree, independently testable
- Adding a new slot (e.g., `<MenuItem.Badge>`) never changes existing sub-components
- No associated style props needed — each sub-component owns its own styling
- The consumer has full control over composition, ordering, and conditional rendering

```tsx
// Consumer controls what appears and where — each slot is explicit JSX
<MenuItem.Container onPress={onNavigate}>
    <MenuItem.Left>
        <Avatar source={avatarURL} />
    </MenuItem.Left>
    <MenuItem.Content>
        <MenuItem.Title>Settings</MenuItem.Title>
        <MenuItem.Description>Manage your preferences</MenuItem.Description>
    </MenuItem.Content>
    <MenuItem.Right>
        <Badge count={unreadCount} />
    </MenuItem.Right>
</MenuItem.Container>
```

#### Correct (composition — children slots over render functions)

- Each area declared as JSX — the consumer decides what renders, not the component
- Conditional rendering is standard JSX, not function call fallback chains
- Adding a new area means creating a new sub-component, not expanding the parent's prop interface
- Each sub-component is an independent render unit — better for React Compiler memoization

```tsx
// Each area is a composable child — no render functions needed
<Section>
    <Section.Title>Features</Section.Title>
    <Section.Subtitle>
        <Text style={styles.subtitle}>Advanced features for your workspace</Text>
        <Badge type="new" />
    </Section.Subtitle>
    <Section.Content>
        {children}
    </Section.Content>
    <Suspense fallback={<Section.Skeleton />}>
        <Section.Overlay />
    </Suspense>
</Section>
```

---

### Review Metadata

#### Condition

Flag when ANY of these are true:

**Case 1 — Boolean flag configuration:**
- A component uses boolean/flag props (matching the Case 1 search patterns) that cause `if/else` or ternary branching inside the component body
- These flags control feature presence, layout strategy, or behavior within the component
- These features could instead be expressed as composable child components

**Case 2 — Content prop configuration:**
- An optional content prop's **sole purpose** is to conditionally render a UI element
- The test: if removing the prop would only remove a `{!!prop && <Element />}` or `{prop ? <Element /> : null}` block and nothing else, the element should be a composable child instead
- This applies when **adding new optional content props** to new or existing components — not when modifying existing conditional rendering during a bug fix
- A named `ReactNode` or `ReactElement` prop whose purpose is to render UI in a specific position within the component (e.g., `leftComponent?: ReactNode`, `footerContent?: ReactNode`, `titleComponent?: ReactElement`)
- The test: the component wraps the prop in a conditional render (`{!!prop && <Wrapper>{prop}</Wrapper>}`) or renders it directly — the slot could instead be a compound component child

**Detection steps for Case 2:**
1. In the diff, search for conditional rendering patterns: `{!!prop &&`, `{prop &&`, `{prop ? <...> : null}`
2. For each match, identify the variable used in the condition (e.g., `subtitle` in `{!!subtitle && <Text>...`)
3. Check the component's type definition — is this prop optional (`subtitle?: string`)?
4. Search the entire component body for other uses of this prop — is the prop used **only for conditional rendering**? (Note: a prop may appear in multiple conditional render blocks and still be a violation — the test is whether ALL uses are solely `{!!prop && <Element />}` or `{prop ? <Element /> : null}` patterns, not whether it appears in only one place.)
5. If yes to both (optional + sole purpose is conditional render) → flag as Case 2 violation

**Case 3 — Monolithic prop interface:**
- A component receives a large set of props that collectively configure its appearance and behavior (e.g., dialog with `isOpen`, `title`, `tabs`, `activeTab`, `onTabChange`, `onSave`, `onReset`, `values`)
- These props could be broken into independent composable blocks: Provider manages state, sub-components render independently
- The component becomes a "configuration object consumer" rather than a composition of building blocks

**Case 4 — Config-array driven rendering:**
- Statically-known items (finite, fixed at development time) are encoded as a data array of config objects
- The array is `.map()`'d through a generic component to produce JSX
- Each item has distinct behavior or props that could be expressed as individual JSX elements or dedicated components
- Business logic is mixed into the array (conditional entries via `&&`, `.filter()`)
- **Important**: Using compound components inside `.map()` over a static array does not resolve the violation — the fix is to inline each item as distinct JSX, not to improve the mapped component's API. The anti-pattern is the static config array itself, not the component being mapped.

**Case 5 — Render function props:**
- A component accepts `render*` function props (e.g., `renderTitle`, `renderSubtitle`, `renderFooter`) that return JSX
- The component calls these functions to fill specific areas of its layout
- Each render function corresponds to an area that could be a compound component child instead
- The component manages fallback logic between the render function and a default prop (e.g., `renderTitle ? renderTitle() : <Text>{title}</Text>`)

In all cases, the rule applies to: **new components**, **new features added to existing components**, **refactorings that create new components still following configuration patterns**, and **new consumers of existing config-heavy components**.

**Consumer vs. Creator:** New code that consumes a component with a known configuration-heavy API (many props controlling what/how to render) SHOULD be flagged. Each new consumer cements the config pattern and makes future refactoring harder. The fix is to advocate for a compositional wrapper or refactor — not to silently adopt the old pattern. Flag new consumers at the same severity as the component creator.

**DO NOT flag if:**
- Props are domain identifiers used for data fetching (e.g., `reportID`, `policyID`, `transactionID`)
- Props are event handlers for abstract actions (e.g., `onPress`, `onChange`, `onSelectRow`)
- Props are **purely presentational** (e.g., `style`, `testID`, `numberOfLines`, `fill`, `iconFill`). A prop is presentational ONLY if removing it would change appearance but NOT structure, content, or layout strategy. Props that select between rendering strategies (e.g., `shouldUseAspectRatio` toggling layout modes, `shouldShowX` toggling element visibility) or control which content appears are NOT presentational — they are behavioral flags (Case 1).
- The component already uses composition and child components for features
- The optional prop is used for logic beyond just conditional rendering (e.g., computing derived values, passed to callbacks, used in multiple places within the component)
- The component is a thin wrapper around a platform primitive (e.g., wrapping `TextInput`, `ScrollView`, `Pressable`) — these naturally pass through configuration props
- Items come from **runtime data** (API responses, user-generated content, Onyx collections) — dynamic data must be mapped
- The array is used with **list components** (e.g., `FlatList`, `SectionList`, or custom wrappers) — these require data arrays by design
- Items are truly **homogeneous** (same shape, same behavior, only values differ) and the count is **unbounded** (e.g., list of chat messages, search results)
- The array is a **framework requirement** (e.g., React Navigation screen config, form validation rules)
- The `ReactNode` prop is `children` itself — `children` is the foundation of composition, not configuration
- The render function is a **list component callback** (`renderItem` on `FlatList`, `SectionList`, `DraggableList`) — these are framework requirements
- The render function receives **per-item runtime data** from a dynamic collection (e.g., `renderSuggestionMenuItem(item, index)`) — this is list-style rendering, not slot configuration

**Search Patterns** (hints for reviewers):
- **Case 1**: `should\w+`, `can\w+`, `enable`, `disable` (boolean flag prefixes in prop types)
- **Case 2**: `{!!`, `&&\s*<`, `?\s*<`, `: null`, combined with optional prop markers (`?:` in type definitions); named `ReactNode` or `ReactElement` optional props (`\w+\?:\s*(React\.)?React(Node|Element)`)
- **Case 3**: Components where props collectively configure appearance AND behavior — look for a mix of state props, handler props, and content/slot props in the same type definition
- **Case 4**: `\.map\(` combined with array literal `= \[` in the same component; `actions={[`, `items={[`, `options={[` (config arrays passed as props); `.filter(` on array literals (conditional items)
- **Case 5**: `render\w+\??\s*:` in type definitions (render function props); `render\w+\s*\??\s*\(` in component bodies (render function calls)
