# Translation Audit Process - Expensify

## 1. Purpose

LLM-generated translations allow us to scale quickly across languages. The risk is not obvious mistranslation, but subtle instability: inconsistent terminology, workflow ambiguity, fragile templates, or tone drift.

We validate whether the localization system produces:
- Stable terminology
- Clear workflows
- Robust dynamic strings
- Consistent tone

If it does, we ship. If it doesn’t, we fix the system, not individual strings.

## 2. Quality Standard

This is a full application-level validation.

Every string must:
- Make semantic sense.
- Be grammatically correct.
- Align with product intent.
- Remain consistent with system terminology.

## 3. System Awareness (Before Starting)

- `en.ts` is the single source of truth.
- All locale files are generated outputs.
- The base prompt defines global translation rules.
- Locale prompts may add refinements.
- Glossaries lock high-impact terminology.
- Context annotations clarify ambiguous English keys.

You are evaluating the localization system as a whole, not manually rewriting content. Never audit translations without verifying the English source intent.

## 4. Step 1: Terminology Audit

### 4.1 Identify high-impact terms

Focus only on terms that are:
- High-frequency
- Workflow-critical
- Role-defining
- Product-defining
- Financially sensitive

Typical categories:
- Workflow actions (Submit, Approve, Reject)
- Roles (Approver, Owner)
- Core objects (Report, Expense, Policy)
- Statuses (Draft, Pending, Approved)
- Financial actions (Reimburse, Rate)

Build a short working list.

### 4.2 Verify consistency at scale

Use search, not scrolling.

For each key term:
- Search the translated term.
- Search the English source.
- Review all occurrences.

Confirm:
- One canonical translation.
- Stable grammatical role (verb stays verb, noun stays noun).
- Recognizable concept across buttons, statuses, and messages.

If translation depends on context in unpredictable ways → systemic issue.

### 4.3 Glossary decisions

A glossary is introduced or expanded when:
- A term drifts across contexts.
- Synonyms appear unpredictably.
- Meaning ambiguity affects workflows.
- The LLM alternates between variants.
- A product-specific meaning differs from general language usage.

A term belongs in the glossary if it is:
- High-impact
- Recurring
- Product-defining
- Ambiguous without constraint

Do not include:
- Generic UI terms (Save, Error)
- Rare strings
- Stylistic refinements

Each glossary entry must include:
- Source term (exact English)
- Target term (canonical translation)
- Part of speech (if relevant)
- Short usage note (only if needed)

The glossary is a stability mechanism, not a vocabulary list.

**Example : Term: Submit**

Why it belongs in the glossary:
- Appears across multiple workflows (expense, report, approval).
- Can easily drift to synonyms (“Envoyer”, “Transmettre”, “Soumettre”).
- Carries workflow state implications (Draft → Submitted).
- Used as both button label and action description.

Without glossary control, LLMs often alternate between synonyms depending on sentence structure.

Canonical entry:

```xml
<term>
  <sourceTerm>Submit</sourceTerm>
  <targetTerm>Soumettre</targetTerm>
  <partOfSpeech>verb</partOfSpeech>
  <usage>UI workflow action</usage>
</term>
```

## 5. Step 2: Context & Phrasing Audit

Once terminology is stable, evaluate behavior in context. You are checking clarity and robustness inside real workflows.

### 5.1 Dynamic & parameterized strings

Search for:
- Template literals
- Interpolations
- Conditional fragments

For each:
- Read with variables inserted.
- Read without variables.
- Verify agreement (gender, number).
- Ensure natural word order.
- Confirm no broken fragments.

Recurring template fragility → prompt-level issue.

### 5.2 System messages & longer text

Review:
- Confirmation dialogs
- Warnings
- Informational text

Look for:
- English structure leakage
- Over-literal phrasing
- Unnecessary verbosity
- Formality drift

### 5.3 Tone & role differentiation

Confirm:
- Similar actions are phrased consistently.
- Imperatives vs statuses are not mixed.
- Roles, actions, and states are clearly differentiated.
- Tone matches the product domain.

## 6. Classify Issues

All findings must be classified before action.

- **Low:** Clear and acceptable variation.
- **Medium:** Inconsistent but not workflow-breaking.
- **High:** Ambiguous, misleading, or workflow-impacting.

## 7. Step 3- Decide: Approve or Iterate

**Approve when:**
- Terminology is stable.
- No recurring ambiguity patterns remain.
- Dynamic templates are robust.
- Remaining issues are isolated and low-risk.

**Iterate when:**
- Core workflows are inconsistently translated.
- High-impact terms drift.
- Dynamic templates repeatedly fail.
- Prompt or glossary changes introduced regressions.

A targeted re-check is usually sufficient.

## 8. Output of the Audit

Every audit must produce structured outputs.

### 1. Verdict
- Approved
- Approved with notes
- Needs iteration

### 2. Required system changes (if applicable)

The audit may result in:

**A. Glossary creation or expansion**
- Lock high-impact terms.
- Clarify ambiguous roles.
- Stabilize workflow vocabulary.

**B. Prompt adjustments**
Refine the base prompt when:
- Structural leakage is recurring.
- Agreement failures repeat.
- Register drift appears systematically.
- A pattern cannot be fixed by glossary alone.

**C. Context annotations (in locallanguage.ts)**
Add when:
- English key is ambiguous.
- Same word maps to different concepts.
- LLM misinterprets intent due to missing context.

Context annotations clarify before translation not after.

## 9. When to Create a PR

Create a PR when:
- Glossary changes are required.
- Prompt rules must be adjusted.
- Context annotations are added.
- System-level corrections are needed.

PRs must target the system, not manually edited locale files. If no system changes are required, document the verdict and move on.

## 10. Final Checklist

- [ ] High-impact terminology stable
- [ ] Roles and workflows clearly differentiated
- [ ] No action/state confusion
- [ ] Dynamic templates grammatically robust
- [ ] No recurring AI drift patterns
- [ ] Glossary created or updated when needed
- [ ] Prompt refined if systemic issues detected
- [ ] Context annotations added where ambiguity exists

If these are true, ship.
