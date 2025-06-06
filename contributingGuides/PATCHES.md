# Contributing Patches

The `patches/` directory is used to store custom modifications to third-party libraries.

To ensure patches remain maintainable and traceable over time, follow the guidelines below when adding or modifying any patch file.

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
- E/App issue: <Please create an E/App issue for each introduced patch. Link it here and if patch won't be removed in the future (no upstream PR exists) explain why>
- PR introducing patch: <Link to E/App (or Mobile-Expensify) PR that added the patch>
```

To find the issue template visit [NewPatchAdded.md](./../.github/ISSUE_TEMPLATE/NewPatchAdded.md)

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
