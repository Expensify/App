# Beta Usage Philosophy
This philosophy guides our approach to beta releases by emphasizing small incremental releases over betas.

#### Related Philosophies
- [Small Incremental Releases Philosophy](/contributingGuides/philosophies/INCREMENTAL-RELEASES.md)
- [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)

#### Terminology
- **Beta** - A mechanism that controls access to new functionality for limited users
- **Beta Feature** - Functionality deployed to production but hidden behind a beta control
- **Beta Control** - A mechanism to enable/disable features for specific users or groups without deploying new code
- **Beta Rollout** - The process of gradually enabling a beta feature for larger audiences

## Rules

### - Betas SHOULD be avoided in favor of small incremental releases
Our primary strategy is shipping small, complete features directly to production rather than releasing large, incomplete features in beta. This approach provides faster feedback, reduces complexity, and delivers value immediately.

Use betas only when:
- The feature cannot be meaningfully decomposed into smaller units
- There are significant business or technical risks that require validation before full release
- Gradual rollout is needed to monitor performance or system impact

### - Beta roll-out MUST have clear removal criteria
Every beta MUST have:
- Specific criteria for removing the beta and fully releasing the feature
- A GH that clearly defines when and how a beta will be removed

### - Betas MUST NOT be used for an excuse to roll out low-quality code
Bad Example: A feature is built with a lot of bugs, but it's OK because it's behind a beta and therefore won't impact users or QA.

## When Beta Controls Are Appropriate

### - Beta MUST be used if a feature requires gradual rollout
When you need to monitor system performance, user adoption, or business metrics as you enable features for larger audiences.
When changes could significantly affect core user workflows and you need to validate the impact with real users before full release.

## Examples

### ❌ Inappropriate Beta Usage
**Scenario**: New expense submission form
**Beta approach**: Put form behind beta control for 6 weeks to "get feedback"
**Problems**:
- Form could be released incrementally (one field improvement at a time)
- Low technical risk doesn't justify beta control
- Extended timeline delays value delivery
- Creates complexity for minimal benefit

### ✅ Appropriate Beta Usage
**Scenario**: New AI-powered expense categorization system
**Beta approach**: Beta control with gradual rollout over 3 weeks
**Justification**:
- Cannot be meaningfully decomposed (AI model needs holistic evaluation)
- High technical risk (AI predictions could impact user trust)
- Need to monitor system performance with AI processing load
- Requires real usage data to validate accuracy

**Rollout plan**:
- 5% of users, monitor accuracy and performance
- 25% of users if metrics meet thresholds
- 100% rollout if success criteria met

**Success criteria**:
- 85% categorization accuracy
- No performance degradation (response times under 200ms)
- Error rate under 1%
- Positive user feedback on suggestions

## Beta Removal Strategy

### - Define removal criteria upfront
Before adding a new beta beta, establish quantifiable criteria for full rollout or feature termination.

Create GHs to track what needs to happen for a given beta.

### - Plan for three outcomes
1. **Removal**: Remove beta control and enable for all users
2. **Iteration**: Modify feature based on beta data, continue gradual rollout
3. **Rollback**: Disable beta control and return to drawing board

### - Monitor graduation metrics continuously
Track key performance indicators throughout the beta period:
- System performance impact
- Error rates and user feedback
- Business metrics (conversions, retention, etc.)

### - Clean up removed betas
Once features graduate to full release:
- Remove beta control code and configuration
- Update documentation to reflect new baseline functionality
- Document lessons learned for future beta processes
