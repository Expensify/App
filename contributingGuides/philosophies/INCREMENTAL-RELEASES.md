# Small Incremental Releases Philosophy
This philosophy guides our approach to breaking down large projects into smaller, independently shippable releases that deliver value early and often.

#### Related Philosophies
- [Overengineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)
- [Preoptimizing Philosophy](/contributingGuides/philosophies/PREOPTIMIZING.md)

#### Terminology
- **Incremental Release** - A small, independently shippable unit of work that delivers tangible value
- **Release Stage** - A logical grouping of work that can stand alone if needed
- **Dependencies** - Work that must be completed before other work can begin
- **ROI** - Return on Investment, the value delivered versus the cost to implement
- **Shippable** - Ready to be deployed to users in a functional state

## Rules

### - Large projects MUST be broken into small incremental releases
Big projects are rarely "one and done". They involve a series of releases, each building foundation for the next. Break projects into the smallest bites that can be incrementally deployed for customers to get value and provide early feedback.

### - Each release MUST be independently shippable
It MUST be possible to pause indefinitely after each release without serious trouble. Like building lego towers, each should stand on its own, even if you intend to link them later.

### - Releases MUST be results-driven
Each release MUST produce clearly defined output that tangibly solves a meaningful problem. If it's a feature, ensure at least one real user can find, understand, enable, and use it. A secret feature or hidden API is not a result.

### - Releases SHOULD be minimally defined
Each release SHOULD achieve the least it possibly can while still accomplishing something meaningful. Resist merging releases together - it's faster to do two small, obvious releases than one large, less-obvious release.

### - Problem decomposition MUST precede solution planning
Before planning releases, decompose the problem into isolated, independent parts. This is the most difficult and valuable part of planning - don't skimp here.

### - Dependencies MUST be clearly identified and prioritized
Organize work by dependency relationships. Identify which problems are linked versus which stand alone. Early releases MUST solve dependencies required by later releases.

## Problem Decomposition Process

### - Master the problem completely
Take time to fully understand the problem domain to a greater level of detail than anyone else. Be tenacious - accept nothing less than total mastery and certainty of its importance.

### - Simplify the language
Reduce complex or ambiguous language down to plain, straightforward terms until everybody agrees unambiguously on the problem's nature.

### - Go straight to the source
Don't trust others to speak for stakeholders. Find whoever is experiencing the problem and ask them to explain it in their own words. Cross-reference multiple perspectives.

### - Challenge core assumptions
Question the most "obvious" assumptions - the axioms others accept as truth. The more everyone believes it's true, the more important to question it.

## Release Planning Process

### - Organize by dependency
Identify which problems need to be solved in particular order versus which stand alone. Map dependency trees clearly.

### - Prioritize by ROI
Sort problems based on value delivered versus cost to solve. Focus on high-value, low-cost wins early when possible.

### - Group by theme
Humans work best on similar problems. Group by technology platform, customer type, or other logical themes. Give each theme a clear name.

### - Eliminate non-critical scope
As problems are defined, discard parts that aren't as important or urgent. Reduce scope as much as possible by throwing out non-critical elements.

## Release Prioritization Framework

### CRITICAL
Required for the current release. You will realistically delay the release until this is done.

### HIGH
"Nice to have" for current release, but "must have" for the next release.

### MEDIUM
"Nice to have" for next release, but "must have" for the release after.

### LOW
"Nice to have" for 2 releases from now, but "must have" for 3 releases out.

### FUTURE
Related items you don't want to forget but aren't closely tracking yet.

## Implementation Guidelines

### - Put priority in issue titles
Include priority level in GitHub titles (e.g., "CRITICAL: Implement user authentication").

### - Group tasks by priority
Organize all work by priority level so teams can focus on highest priority items first.

### - Ensure team alignment
Make sure everyone knows what is top priority and works on that first.

### - Continuously re-evaluate
As you learn more about solutions, continuously re-evaluate the problem to identify further decomposition opportunities.

## Examples

### ❌ Monolithic Release Approach
**Project**: New expense reporting system
**Monolithic approach**: Build complete system with:
- User authentication
- Expense submission
- Approval workflows  
- Reporting dashboard
- Mobile app
- Integrations with 5 external systems

**Problems**: 
- 6-month development cycle with no user feedback
- High risk if any component fails
- No value delivered until everything is complete

### ✅ Incremental Release Approach
**Project**: New expense reporting system

**Release 1**: Basic expense submission (web only)
- Users can submit expenses manually
- Admin can approve/reject in simple interface
- **Value**: Immediate replacement of paper/email process

**Release 2**: Receipt capture
- Users can photograph receipts
- Basic OCR for expense details
- **Value**: Reduces manual data entry

**Release 3**: Approval workflows
- Multi-level approval routing
- Email notifications
- **Value**: Automates approval process for larger organizations

**Release 4**: Reporting dashboard
- Basic expense reports and analytics
- Export capabilities
- **Value**: Provides visibility into spending patterns

Each release delivers immediate value while building toward the complete vision.
