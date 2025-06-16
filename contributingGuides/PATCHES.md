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

- Reason: <Why this patch is needed>
- Upstream PR/issue: <link or 🛑 if not raised. If no upstream issue or PR exists, explain why>
- E/App issue: <link or 🛑 if none>
- PR Introducing Patch: <link to internal PR that added the patch>
```

### Example

```md
# `react-native-pdf` patches

### [react-native-pdf+6.7.3+002+fix-incorrect-decoding.patch](react-native-pdf+6.7.3+002+fix-incorrect-decoding.patch)

- Reason: If the file name contains accented characters, the PDF load fails.
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR Introducing Patch: [#50043](https://github.com/Expensify/App/pull/50043)
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
