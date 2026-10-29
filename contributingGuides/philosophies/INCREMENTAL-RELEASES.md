# Small Incremental Releases Philosophy
This philosophy guides our approach to breaking down large projects into smaller, independently releases that deliver value early and often.

#### Related Philosophies
- [Over-engineering Philosophy](/contributingGuides/philosophies/OVERENGINEERING.md)
- [Optimization Philosophy](/contributingGuides/philosophies/OPTIMIZATION.md)

#### Terminology
- **Incremental Release** - A small, independently unit of work that delivers tangible value
- **Release Stage** - A logical grouping of work that can stand alone if needed
- **Dependencies** - Work that must be completed before other work can begin
- **ROI** - Return on Investment, the value delivered versus the cost to implement

## Rules

### - Large projects MUST be broken into small incremental releases
Big projects are rarely "one and done". They involve a series of releases, each building a foundation for the next. Break projects into the smallest pieces that can be incrementally deployed for customers to get value and provide early feedback. It MUST be possible to pause indefinitely after each release without serious trouble.

### - Releases MUST have a descriptive name
Each release MUST have a descriptive name of the feature that will be released, instead of a generic v2 appended to the name.

#### Examples
✅ GOOD: Release 1: Add ungrouped Accounting > Unapproved cash
❌ BAD: Suggested Search: Accounting Workflows v1


### - Releases MUST include adding help documentation and training the team
Each release MUST come with a set of help documentation and training the team on the new feature.
### - Releases SHOULD be minimally scoped
Each release SHOULD achieve the least it possibly can while still accomplishing something meaningful. Resist merging releases together - it's faster to do two small, obvious releases than one large, less-obvious release. They are easier to write, easier to test, easier to review, and easier to revert.

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
