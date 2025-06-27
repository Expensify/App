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

   **Sub-Issue Feature**: The script uses GitHub's native sub-issue functionality, which requires the `GraphQL-Features: sub_issues` header in API calls.

   **Project Assignment**: Issues are automatically assigned to [Expensify organization project #208](https://github.com/orgs/Expensify/projects/208). This requires your GitHub token to have the `read:project` scope. If you don't have this scope, issues will still be created but you'll need to manually add them to the project.

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
- Create sub-issues for each Onyx.connect reference (format: "Remove Onyx.connect reference: {onyx-key} in {file-path}")
- Link sub-issues to their parent issues using GitHub's native sub-issue functionality
- Provide a summary of created issues

## What the Scripts Do

### Parent Issues
- **Title**: `Refactor {file-path} Onyx.connect references`
- **Assignee**: `tgolen`
- **Labels**: `Engineering`, `Improvement`
- **Project**: Expensify organization project #208 (if token has proper scopes)
- **Body**: Contains context about the refactoring effort, references to the main deprecation issue, and TDD instructions
- **Purpose**: Track the overall refactoring effort for each file

### Sub-Issues
- **Title**: `Remove Onyx.connect reference: {onyx-key} in {file-path}`
- **Assignee**: `tgolen`
- **Labels**: `Engineering`, `Improvement`
- **Project**: Expensify organization project #208 (if token has proper scopes)
- **Body**: Contains specific details about the reference to be removed, including TDD instructions
- **Purpose**: Track individual Onyx.connect references that need to be refactored

### Issue Linking
- Uses GitHub's native sub-issue functionality via the `addSubIssue` GraphQL mutation
- Creates proper parent-child relationships between issues
- Sub-issues appear directly in the parent issue's interface
- Provides a clean, native GitHub experience for issue hierarchy

## Error Handling

The script includes comprehensive error handling:
- Checks for GitHub CLI authentication
- Validates file existence
- Handles API failures gracefully
- Provides informative error messages
- Includes rate limiting to avoid hitting GitHub API limits
- Uses simplified GitHub CLI commands for better reliability
- Follows DRY principles with modular, reusable functions
- Maintainable code structure with separated concerns

## Rate Limiting

The scripts include built-in rate limiting:
- 1 second delay between issue creations
- 0.5 second delay between linking operations
- This prevents hitting GitHub API rate limits

## Example Output

```
Starting to process onyxrefs.txt...
Repository: Expensify/App

Creating parent issue: Refactor src/libs/ActiveClientManager/index.ts Onyx.connect references
Created parent issue #123 with ID: MDU6SXNzdWUxMjM0NTY3ODk=
Note: Cannot add to project 208 - requires 'read:project' token scope
      You can manually add issues at: https://github.com/orgs/Expensify/projects/208

Creating sub-issue: Remove Onyx.connect reference: ONYXKEYS.ACTIVE_CLIENTS in src/libs/ActiveClientManager/index.ts
Created sub-issue #124 with ID: MDU6SXNzdWUxMjM0NTY3OTA=
Note: Cannot add to project 208 - requires 'read:project' token scope
      You can manually add issues at: https://github.com/orgs/Expensify/projects/208

Linking sub-issue to parent...
Linked sub-issue to parent issue

================== SUMMARY ==================
Finished processing onyxrefs.txt
Parent issues created: 1
Sub-issues created: 1
Issue links created: 1
Total issues created: 2

All issues assigned to: tgolen
All issues labeled with: Engineering, Improvement
You can view all created issues at: https://github.com/Expensify/App/issues
==============================================
```

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
   - Ensure you have write permissions to the repository
   - Check that your GitHub token has the necessary scopes

5. **Project Assignment Issues**
   - If you see "Cannot add to project 208 - requires 'read:project' token scope"
   - Update your GitHub token scopes at: https://github.com/settings/tokens
   - Add the `read:project` scope to your token
   - Or manually add created issues to the project at: https://github.com/orgs/Expensify/projects/208

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

## Customization

The script follows DRY (Don't Repeat Yourself) principles with modular functions:

### Issue Template Customization
- **Common Elements**: Modify `get_parent_issue_reference()` and `get_tdd_instructions()` functions
- **Parent Issue Bodies**: Edit the `build_parent_issue_body()` function
- **Sub-Issue Bodies**: Edit the `build_sub_issue_body()` function

### Other Customizations
1. **Issue Titles**: Modify the title templates in the main processing section
2. **Assignee**: Change `--assignee tgolen` in the `create_issue()` function
3. **Labels**: Modify `--label "Engineering,Improvement"` in the `create_issue()` function
4. **Rate Limiting**: Adjust the `sleep` delays if needed

## Support

If you encounter issues:
1. Check this README for common solutions
2. Run the script with `--dry-run` to validate your input
3. Verify GitHub CLI setup and authentication
4. Check the GitHub API status if you're experiencing widespread issues
