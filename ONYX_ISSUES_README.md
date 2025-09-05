# Onyx Issues Creation Scripts

This directory contains scripts to automatically create GitHub issues from the `onyxrefs.txt` file, which contains references to Onyx.connect usage throughout the codebase. These scripts are specifically designed for the [Expensify/App repository](https://github.com/Expensify/App).

## Files

- `create_onyx_issues.sh` - Main script that creates GitHub issues (supports dry-run mode)
- `onyxrefs.txt` - Input file containing Onyx.connect references
- `ONYX_ISSUES_README.md` - This documentation file

## Prerequisites

1. **GitHub CLI installed and authenticated**
   ```bash
   # Install GitHub CLI (if not already installed)
   brew install gh

   # Authenticate with GitHub
   gh auth login
   ```

   **Note**: The scripts are hardcoded to target the `Expensify/App` repository. You must have write access to this repository for the scripts to work.

2. **File format**: The `onyxrefs.txt` file should follow this format:
   ```
   ***path/to/file.ts
   >>> Line 27: ONYXKEYS.SOME_KEY
   >>> Line 45: ONYXKEYS.ANOTHER_KEY

   ***path/to/another/file.ts
   >>> Line 12: ONYXKEYS.DIFFERENT_KEY
   ```

## Usage

The script supports both dry-run mode and actual issue creation:

```bash
# Show help
./create_onyx_issues.sh --help

# Dry run (recommended first step) - shows what would be created
./create_onyx_issues.sh --dry-run
# or
./create_onyx_issues.sh -d

# Create actual issues
./create_onyx_issues.sh
```

### 1. Dry Run (Recommended first step)

Run the script with the `--dry-run` flag to see what issues would be created:

```bash
./create_onyx_issues.sh --dry-run
```

This will show you:
- How many parent and sub-issues would be created
- The titles of all issues that would be created
- Which files would be processed

### 2. Create Issues

Once you're satisfied with the dry-run output, create the actual issues by running the script without flags:

```bash
./create_onyx_issues.sh
```

This will:
- Create parent issues for each file (format: "Refactor {file-path} Onyx.connect references")
- Link each parent issue to the main deprecation issue [#507850](https://github.com/Expensify/Expensify/issues/507850)
- Create sub-issues for each Onyx.connect reference (format: "Remove Onyx.connect reference: {onyx-key} in {file-path}")
- Link sub-issues to their parent issues using GitHub's native sub-issue functionality
- Provide a summary of created issues

### 3. Set Project Status on Parent Issues

This is a manual step!

1. Use the link at the end of the output from Step 2 to see all the newly created issues
2. For all the parent "module" issues starting with the word "Refactor..."
3. Set the project status to "To do"

## Troubleshooting

### Common Issues

1. **"GitHub CLI is not authenticated"**
   - Run `gh auth login` and follow the prompts

2. **"onyxrefs.txt file not found"**
   - Ensure the file exists in the current directory
   - Check the file name and path

3. **API Rate Limiting**
   - The scripts include built-in rate limiting
   - If you still hit limits, wait a few minutes and try again

4. **Permission Errors**
   - Ensure you have write permissions to the Expensify/App repository
   - Ensure you have read access to the Expensify/Expensify repository (for linking to the main deprecation issue)
   - Check that your GitHub token has the necessary scopes

5. **Main Issue Linking Failures**
   - If you see "Failed to link parent issue to main deprecation issue"
   - This may be due to insufficient permissions to access Expensify/Expensify repository
   - The parent and sub-issues will still be created and linked to each other
   - You can manually link parent issues to [#507850](https://github.com/Expensify/Expensify/issues/507850) if needed



### Debugging

To debug issues:
1. Run the script with `--dry-run` first to validate the input file
2. Check GitHub CLI authentication: `gh auth status`
3. Verify repository access: `gh repo view`
4. Check the script output for specific error messages

## File Format Details

The input file (`onyxrefs.txt`) must follow this exact format:

- Lines starting with `***` indicate a new file and create parent issues
- Lines starting with `>>>` indicate Onyx.connect references and create sub-issues
- Empty lines are ignored
- Each `>>>` line should contain the line number and the Onyx key reference
