## How to create a plan - Contributor version

### Preamble 
If you’re new to working with Expensify, it’s important to know the philosophy behind the design of Expensify’s products and the processes that wrap around them.
- Problems are identified and defined before solutions are proposed
- Features are not added to satisfy personal preferences
- Features are added thoughtfully and minimally

It’s also important to be familiar with our existing documentation including our [CONTRIBUTING.md](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md) and [README.md](https://github.com/Expensify/App/blob/main/README.md)

## Step 1: Define the problem
What is the problem that needs solving? 
- Be broad
- Define who experiences the problem
- Does this affect the customer experience? How so? 
- How many customers would be affected by this?
- Define why it is a problem
- Resist the temptation to reverse-engineer a Solution into a matching Problem.  (ie. Problem: We don’t have a car. Solution: Buy a car) 
- There may be more than one problem, so define all of them
- Keep the language simple - Reduce every word down to its most plain and straightforward manner.  Avoid jargon. If you use abbreviations, include the full spelling the first time.
- Tear apart your statements and have others tear them apart for you until everybody agrees unambiguously as to the nature of the problem. If needed, continue the discussion in #expensify-open-source.

Identify which problems are actually independent and can be solved by themselves, versus which are actually a series of dependent but otherwise separate problems that can be solved one at a time.

The broader and better contextualized the problem definition, the greater opportunity for discovering radical, out-of-the-box solutions. The odds of achieving something are dramatically improved by clearly defining what it is. Take at least as much care perfecting your problem definition as you do the solution, because the perfect solution to the wrong problem is typically an awful solution to the right one.

## Step 2: Workshop the solutions
Draft as many solutions as you can for each problem, including any existing workarounds - “Do nothing” is always a potential solution. Be as creative or audacious as you want when workshopping potential solutions.

Once you have your solutions, it’s time to decide on the preferred solution (alternate solutions may be included at a later stage). Aspects that may promote one solution to “preferred” status:
- ROI - the current value of the problem, versus the cost of your solution
- Work involved - is one solution just as effective but would take half the time to create?
- Adding or moving “things” - does one solution have less consumer impact?
- Future-proofing - does one solution have more longevity or pave the way for future development?
- Independence - does a solution rely on a different problem to be solved first? Does it rely on another piece to be done later?

If you are finding the solution to be difficult, go back and beat harder on the problem to break it up into smaller pieces. Keep repeating until you have a general list of prioritized stages, with early stages solving the dependencies required by later stages, each of which is extremely well defined, with a reasonably obvious preferred solution.

## Step 3: Write out each problem and solution (P/S statement)
Have a trusted peer or two proof your P/S statement and help you ensure it is well-defined. If you're in need of a peer to proof, post in #expensify-open-source to ask for help. Refine it and then share with another peer or two until you have a clear, understandable P/S statement. The more complex the problem and solution, the more people should review it. Keep going back to step 1 if needed.

## Step 4: Propose it
Once you have a well-defined problem and solution, post your problem and solution as separate comments in ​​#expensify-open-source in Slack and be prepared to answer questions and defend your choices. Also, be prepared to hear better solutions that may completely change your P/S statement. 

Depending on the complexity of the P/S Statement, an internal Design Doc may be required (Expensify employees will take it from there).
