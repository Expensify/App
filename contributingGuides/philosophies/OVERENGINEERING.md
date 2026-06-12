# Over-engineering Philosophy
This philosophy guides our approach to solving problems efficiently without adding unnecessary complexity or features beyond the stated requirements.

#### Related Philosophies
- [Pre-optimizing Philosophy](/contributingGuides/philosophies/OPTIMIZATION.md)

#### Terminology
- **Over-engineering**,**Over-solving**,**Scope creep**  - Building more than what is required to solve the stated problem

## Rules

### Solutions MUST address only the stated problem
When implementing a solution, focus exclusively on solving the specific problem at hand. Do not add extra features, data structures, or processing steps that are not explicitly required.

### Example
Solution: Store user's name for display
❌ BAD: Creating a comprehensive user profile system
✅ GOOD: Just store user's name

### - Implementation SHOULD stop when the problem is solved
Once the requirements are met and the problem is solved, development on that feature or fix MUST stop. There are no bonus points for doing more than what's required.

### Example
Solution: Add a button to show/hide a sidebar
✅ GOOD: Simple toggle with basic transition
❌ BAD: Adding the toggle but also continuing to implement a set of complex transition animations

### - Additional features MUST be clearly marked as future work
If you identify potential improvements or additional features while working on a solution:
- Document them in the out of scope section of the design doc 
- Do not implement them as part of the current work
- Do not leave TODO comments in the code (create a GH to have the work done instead). See How do I handle TODOs in our codebase?

### - Requirements MUST be clarified before expanding scope
If you believe additional work is necessary beyond the stated requirements:
- Stop development
- Start or revisit Slack discussions on whether the extra work is actually needed

### - Simple solutions SHOULD be preferred over complex ones
When multiple approaches can solve the same problem, prefer the simpler solution that:
- Has fewer dependencies
- Requires less code
- Is easier to understand and maintain
- Has fewer potential failure points

### - Code SHOULD not anticipate future requirements
Do not build abstractions, configurations, or flexibility for hypothetical future needs. Implement exactly what is needed today. Future requirements can be addressed when they actually arise.

At the same time, build it so that it can be refactored and won't take a lot of work to unwind it later (ie. don't code yourself into a corner).
