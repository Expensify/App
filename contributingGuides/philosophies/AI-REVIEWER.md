# AI Reviewer Philosophy
This philosophy guides our approach to AI-assisted code and documentation review, explaining when to use each reviewer and how to respond to their feedback.

#### Terminology
- **AI Reviewer** - Automated agent that analyzes PRs or issues and provides feedback
- **Holistic Reviewer** - A reviewer without predefined rules that provides general feedback
- **Smart Linter** - The code-inline-reviewer; a rule-based reviewer with predefined patterns
- **Rule Violation** - Specific pattern that triggers rule-based reviewer feedback

## Guiding Principles

These are recommendations for working effectively with AI reviewers, not strict requirements.

### Treat AI feedback as suggestions
AI reviewers provide automated feedback to assist human reviewers, but their output is not infallible. Contributors and reviewers should evaluate each piece of feedback on its merits rather than blindly accepting or rejecting it.

### Validate AI feedback before requesting changes
When AI reviewers flag potential issues, human reviewers should verify the feedback is accurate and applicable before asking contributors to make changes. This prevents unnecessary work from false positives.

### Report false positives to maintainers
When AI feedback is incorrect or not applicable, reach out to the AI reviewer maintainers to help improve the system. You can either tag them directly in a reply to the reviewer's comment or reach out through Slack. This feedback helps refine the reviewers and prevents the same issues from recurring.

### Keep rule documentation in sync with AI reviewer prompts
When adding or modifying rules in AI reviewer agent files, the corresponding documentation should be updated. The agent files in `.claude/agents/` are the source of truth for specific rules.

## Reviewer Setup

### Available AI Reviewers

**code-inline-reviewer (Smart Linter)**
- Reviews source code PRs for specific, predefined performance violations
- Creates inline comments on lines that violate rules
- See `.claude/agents/code-inline-reviewer.md` for current rule definitions

**Holistic Reviewer**
- Provides general code review without predefined rules
- Catches issues that don't fit into specific rule categories
- Acts as a counterweight to the Smart Linter
- Outputs general code quality feedback and suggestions
- Currently implemented using Codex, configured at the repository level

**helpdot-inline-reviewer**
- Reviews HelpDot documentation PRs for readability, AI readiness, and style compliance
- Creates inline comments for specific violations
- See `.claude/agents/helpdot-inline-reviewer.md` for criteria

**helpdot-summary-reviewer**
- Provides overall quality assessment with scoring for documentation PRs
- Posts a top-level PR comment with summary and recommendations
- See `.claude/agents/helpdot-summary-reviewer.md` for scoring criteria

**deploy-blocker-investigator**
- Investigates deploy blocker issues to identify the causing PR
- Posts findings and recommendations on the issue
- See `.claude/agents/deploy-blocker-investigator.md` for investigation process

### When to Use Each Reviewer

#### Code PRs
Code PRs benefit from the **two-reviewer approach**:

1. **Smart Linter (code-inline-reviewer)**: Catches specific, well-defined performance anti-patterns with consistent, rule-based feedback
2. **Holistic Reviewer**: Catches general code quality issues, design concerns, and anything not covered by specific rules

Together they balance precision (rules) with coverage (holistic review).

#### Documentation PRs
Documentation PRs in the HelpDot system use two complementary reviewers:

1. **helpdot-inline-reviewer**: Line-specific feedback on violations
2. **helpdot-summary-reviewer**: Overall quality assessment with scores

#### Deploy Blocker Issues
When a deploy blocker issue is created:

1. **deploy-blocker-investigator**: Analyzes the issue, identifies the likely causing PR, and recommends resolution

## Working with AI Feedback

### Addressing Valid Feedback
When AI feedback is accurate:
1. Make the suggested changes
2. If the fix differs from the suggestion, explain your approach

### Handling False Positives
When AI feedback is incorrect or not applicable:
1. Evaluate whether the feedback applies to your specific context
2. Reach out to AI reviewer maintainers by tagging them in a reply or through Slack
3. Your feedback helps refine the reviewers and prevent recurring issues

### Escalating to Human Reviewers
Escalate to human reviewers when:
- You're unsure whether AI feedback is valid
- The AI feedback conflicts with other requirements
- The suggested fix would require significant architectural changes

### Examples

#### Appropriate Response to Valid Feedback
**AI Comment**: "PERF-4: This object passed as a prop should be memoized to prevent unnecessary re-renders."

✅ **Good Response**: Wrap the object in `useMemo` or refactor to avoid creating new references.

❌ **Bad Response**: Ignore the feedback without consideration.

#### Appropriate Response to False Positive
**AI Comment**: "PERF-4: This object passed as a prop should be memoized."

**Context**: The parent component is already optimized by React Compiler.

✅ **Good Response**: Tag the AI reviewer maintainers or reach out through Slack with explanation of incorrect suggestion.

❌ **Bad Response**: Apply the change anyway, adding unnecessary complexity.
