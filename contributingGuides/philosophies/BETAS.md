# Beta Usage Philosophy
This philosophy guides our approach to beta releases by emphasizing small incremental releases over betas.

#### Related Philosophies
- [Small Incremental Releases Philosophy](/contributingGuides/philosophies/INCREMENTAL-RELEASES.md)
- [Overengineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)

#### Terminology
- **Beta** - A mechanism that controls access to new functionality for limited users
- **Beta Feature** - Functionality deployed to production but hidden behind a beta control
- **Beta Control** - A mechanism to enable/disable features for specific users or groups without deploying new code
- **Beta Rollout** - The process of gradually enabling a beta feature for larger audiences

## Rules

### - Betas SHOULD be avoided in favor of small incremental releases
Our primary strategy is shipping small, complete features directly to production rather than releasing large, incomplete features in beta. This approach provides faster feedback, reduces complexity, and delivers value immediately.

### - Betas MUST only be used when incremental release is not possible
Use beta controls only when:
- The feature cannot be meaningfully decomposed into smaller shippable units
- There are significant technical risks that require validation before full release
- Gradual rollout is needed to monitor performance or system impact

### - Beta rollouts MUST be time-boxed and have clear removal criteria
Every beta MUST have:
- A defined maximum duration
- Specific criteria for removing the beta and fully releasing the feature

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

### ✅ Alternative Incremental Approach
**Better approach**: Release form improvements incrementally without beta controls
- Week 1: Improve date picker component
- Week 2: Add receipt attachment preview  
- Week 3: Enhance category selection
Each change delivers immediate value and gets real user feedback.

### ✅ Appropriate Beta Usage
**Scenario**: New AI-powered expense categorization system
**Beta approach**: Beta control with gradual rollout over 3 weeks
**Justification**:
- Cannot be meaningfully decomposed (AI model needs holistic evaluation)
- High technical risk (AI predictions could impact user trust)
- Need to monitor system performance with AI processing load
- Requires real usage data to validate accuracy

**Rollout plan**:
- Week 1: 5% of users, monitor accuracy and performance
- Week 2: 25% of users if metrics meet thresholds
- Week 3: 100% rollout if success criteria met

**Success criteria**:
- 85% categorization accuracy
- No performance degradation (response times under 200ms)
- Error rate under 1%
- Positive user feedback on suggestions

## Beta Removal Strategy

### - Define removal criteria upfront
Before adding a new beta beta, establish quantifiable criteria for full rollout or feature termination.

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
