# Optimization Philosophy
This philosophy guides our approach to optimization by focusing on proven problems rather than hypothetical issues across all aspects of development and processes.

#### Related Philosophies
- [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)

#### Terminology
- **Optimization** - making something faster, more flexible, or more capable than it needs to be to solve the exact problems agreed upon
- **Pre-optimizing** - Optimizing a solution before identifying actual problems
- **Bottleneck** - A confirmed point in the process that limits overall results
- **Measuring** - Collecting actual data about process performance or outcomes

## Rules

### - Optimizations MUST be based on measured problems
Do not optimize processes or solutions unless you have:
- Identified a specific problem through user reports, metrics, or observation
- Measured the issue with appropriate tools or data collection
- Confirmed the optimization target is actually a bottleneck

Optimizations can be added later if and when they become necessary.

### - Optimizations MUST be measured before and after implementation
When implementing process improvements:
- Establish baseline measurements before optimization
- Implement the optimization
- Measure the actual improvement gained
- Document the results achieved


## When to Optimize
### - Known issues
When we have concrete data about existing usage patterns that indicate the current approach will fail. This is distinct from pre-optimizing because it's based on actual, measurable constraints rather than hypothetical "what if" scenarios.
- Existing customer data volumes that would break the system
- Known need to expand the feature in the foreseeable future

### - User-reported issues
When users report that processes are slow, confusing, or inefficient in specific scenarios.

### - Metrics indicate problems
When monitoring shows:
- Increased completion times
- Higher error rates
- Resource bottlenecks
- User satisfaction declining
