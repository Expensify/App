This directory contains utility files which enable some visual features of the
[React Buddy](https://plugins.jetbrains.com/plugin/17467-react-buddy/) plugin.
Files in the directory should be committed to source control.

React Buddy palettes describe reusable components and building blocks. `React Palette` tool window becomes available
when an editor with React components is active. You can drag and drop items from the tool window to the code editor or
JSX Outline. Alternatively, you can insert components from the palette using code generation
action (`alt+insert` / `⌘ N`).

Add components to the palette using `Add to React Palette` intention or via palette editor (look for the corresponding
link in `palette.tsx`). There are some ready-to-use palettes for popular React libraries which are published as npm
packages and can be added as a dependency:

```jsx
import AntdPalette from "@react-buddy/palette-antd";
import ReactIntlPalette from "@react-buddy/palette-react-intl";

export const PaletteTree = () => (
  <Palette>
    <AntdPalette/> 
    <ReactIntlPalette/>
    <Category name="App templates">
      <Component name="Card">
        <Variant name="Loading">
          <Card title="Card title">
            <Skeleton loading={true} avatar active>
                Card content
            </Skeleton>
          </Card>
        </Variant>
      </Component>
      <Component name="Form">
        <Variant proto={FormTemplate}/>
      </Component>
    </Category>
  </Palette>
)
```

React Buddy explicitly registers any previewed component in the `previews.tsx` file so that you can specify required
props.

```jsx
<ComponentPreview path="/Page">
    <Page title={'Hello'}/>
</ComponentPreview>
```

You can add some global initialization logic for the preview mode in `useInitital.ts`,
e.g. implicitly obtain user session:

```typescript
export const useInitial: () => InitialHookStatus = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        async function login() {
            const response = await loginRequest(DEV_LOGIN, DEV_PASSWORD);
            if (response?.status !== 200) {
                setError(true);
            }
            setLoading(false);
        }
        login();
    }, []);
    return { loading, error };
};
```
