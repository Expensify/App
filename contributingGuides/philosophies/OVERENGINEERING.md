# Overengineering Philosophy
This philosophy guides our approach to solving problems efficiently without adding unnecessary complexity or features beyond the stated requirements.

#### Terminology
- **Overengineering** - Building more than what is required to solve the stated problem
- **Oversolving** - Adding extra features, data, or steps beyond the minimum viable solution
- **Scope creep** - Gradual expansion of work beyond the original requirements

## Rules

### - Solutions MUST address only the stated problem
When implementing a solution, focus exclusively on solving the specific problem at hand. Do not add extra features, data structures, or processing steps that are not explicitly required.

### - Implementation SHOULD stop when the problem is solved
Once the requirements are met and the problem is solved, development on that feature or fix MUST stop. There are no bonus points for doing more than what's required.

### - Additional features MUST be clearly marked as future work
If you identify potential improvements or additional features while working on a solution:
- Document them as separate issues or proposals
- Clearly label them as "v2" or future enhancements  
- Do not implement them as part of the current work

### - Requirements MUST be clarified before expanding scope
If you believe additional work is necessary beyond the stated requirements:
- Stop development
- Clarify with stakeholders whether the extra work is actually needed
- Get explicit approval from the @generalists team before proceeding with any scope expansion

### - Simple solutions SHOULD be preferred over complex ones
When multiple approaches can solve the same problem, prefer the simpler solution that:
- Has fewer dependencies
- Requires less code
- Is easier to understand and maintain
- Has fewer potential failure points

### - Code SHOULD not anticipate future requirements
Do not build abstractions, configurations, or flexibility for hypothetical future needs. Implement exactly what is needed today. Future requirements can be addressed when they actually arise.

## Examples

### ❌ Overengineered Approach
```typescript
// Problem: Add a button to show/hide a sidebar
// Overengineered: Creating a complex animation system with multiple options
interface SidebarAnimationConfig {
  duration: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'bounce';
  direction: 'left' | 'right' | 'top' | 'bottom';
  callbacks: {
    onStart?: () => void;
    onComplete?: () => void;
    onCancel?: () => void;
  };
}

function createAdvancedSidebarToggle(config: SidebarAnimationConfig) {
  // 50+ lines of complex animation logic
}
```

### ✅ Right-sized Solution
```typescript
// Problem: Add a button to show/hide a sidebar
// Right-sized: Simple toggle with basic transition
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('hidden');
}
```

### ❌ Oversolving Data Requirements
```typescript
// Problem: Store user's name for display
// Overengineered: Creating a comprehensive user profile system
interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    preferredName?: string;
    pronunciation?: string;
  };
  demographics: {
    age?: number;
    location?: string;
    timezone?: string;
  };
  preferences: {
    displayFormat: 'full' | 'first-last' | 'preferred';
    // ... many more fields
  };
}
```

### ✅ Minimal Solution
```typescript
// Problem: Store user's name for display
// Right-sized: Just what's needed
interface User {
  name: string;
}
```
