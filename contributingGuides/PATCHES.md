# Contributing Patches

The `patches/` directory is used to store custom modifications to third-party libraries.

To ensure patches remain maintainable and traceable over time, follow the guidelines below when adding or modifying any patch file.

---

## 🛠️ Creating a Patch

To create a patch for a third-party library that you've modified:

1. Make your changes to the library code in the `node_modules/<edited-library>` directory
2. Run the following command to generate the patch file:

```
npx patch-package <edited-library> --append "<short-patch-description>" --patch-dir ./patches/<edited-library>
```

For example:
```
npx patch-package react-native-pdf --append "fix-pdf-rendering-on-ios" --patch-dir ./patches/react-native-pdf
```

This will create a patch file in the `patches/` directory. After creating the patch:

- Create or update the `details.md` file in the library's patch directory
- Document the patch according to the [`details.md` format](#-detailsmd-format)

> 📝 **Note**
>
> The `--patch-dir` option should only be specified when the target library has a dedicated subdirectory within the `./patches` directory.
> If no such subdirectory exists, omit this option from the command.

---

## 🗂️ Folder Structure

Each library with patch (or patches) should have its own directory inside `patches/`. Each directory should contain:

- One `details.md` file documenting the patches
- One or more `.patch` files

Example:

```
patches/
├── react-native-pdf/
│ ├── details.md
│ ├── react-native-pdf+6.7.3+001+initial.patch
│ ├── react-native-pdf+6.7.3+002+fix-incorrect-decoding.patch
```

---

## 🏷️ Patch Naming

Patch filenames must follow this format:

```
<library-name>+<version>+<3-digit-patch-number>+<short-description>.patch
```


Examples:

- `react-native+0.74.3+001+fix-runtime-crash.patch`
- `react-native-pdf+6.7.3+002+fix-incorrect-decoding.patch`

Patch numbers must be incremental (`001`, `002`, etc.) and scoped per-library version.

---

## 📝 `details.md` Format

Each patch must be listed and explained in the `details.md` file within the same directory.

### Template

```md
# `<library-name>` patches

### [<patch-name>.patch](<patch-name>.patch)

- Reason:
  
    ```
    Please explain why the patch is necessary
    ```
  
- Upstream PR/issue: <Please create an upstream PR fixing the patch. Link it here and if no upstream issue or PR exists, explain why>
- E/App issue: <Please create an E/App issue ([template](./../.github/ISSUE_TEMPLATE/NewPatchTemplate.md)) for each introduced patch. Link it here and if patch won't be removed in the future (no upstream PR exists) explain why>
- PR introducing patch: <Link to E/App (or Mobile-Expensify) PR that added the patch>
```

### Example

```md
# `react-native-pdf` patches

### [react-native-pdf+6.7.3+001+update-podspec-to-support-new-arch.patch](react-native-pdf+6.7.3+001+update-podspec-to-support-new-arch.patch)

- Reason:

    ```
    This patch updates the react-native-pdf.podspec to ensure compatibility with React Native's New Architecture on iOS by replacing manual dependency declarations
    with Meta's recommended `install_modules_dependencies` function
    ```

- Upstream PR/issue: https://github.com/wonday/react-native-pdf/pull/803
- E/App issue: 🛑 TODO
- PR Introducing Patch: https://github.com/Expensify/App/pull/13767
```

## ✅ Patch Submission Checklist

Before opening a PR, please ensure:

- [ ] The patch file is placed in `patches/<library>/`
- [ ] The filename uses the correct naming format: `<library>+<version>+<patch-number>+<short-description>.patch`
- [ ] A `details.md` file exists in the same directory as the patch
- [ ] The patch is listed and documented in `details.md`
- [ ] All fields in `details.md` are filled in:
    - Reason
    - Upstream PR/issue
    - E/App issue
    - PR Introducing Patch
- [ ] The validation script passes on CI (verifies that all patches are documented in `details.md`)
