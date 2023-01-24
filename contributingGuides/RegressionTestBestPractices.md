# Best Practices for Regression Test Proposals

Welcome to the Regression Test Best Practices page! Thanks for taking the time to help us ensure bugs that are squashed don't come back!

---

## Context
We use a third party to run QA on our new application (the one you're helping build!) to catch bugs. When a bug is found, we then create a job available to our community of open-source contributors, and once the bug is successfully squashed, we want to ensure that the bug never comes back - because after all, the whole point of squashing a bug is to ensure it's dead! Therefore, we need to either create a new test case for our QA team to complete and make sure the bug doesn't come back, or update an existing test case to cover this scenario. Our QA tests are broken into various categories that cover the scenario taking place in the User Experience such as starting a new 1:1 chat, requesting money, or updating profile settings. Then we break down the scenario into _exact_ written steps for the QA team to replicate and ensure they get the correct result. This is where you come in!  

## Formatting of regression test step proposals

#### Location and format of the proposal post
1. All proposals for test steps should occur in Slack in the #expensify-bugs channel  
2. All proposals should link the GH issue created for the reported bug 
3. All proposals should give an overview of the bug
4. All proposals should note that it's a Regression Test Proposal
5. All proposals should mention the Expensify employees associated with the issue
6. All proposals should post the proposed steps in the thread of the comment 
7. All proposals should ask for a 👍 or 👎 as confirmation and agreement on the steps outlined in thread

Example: 

**Regression Test Proposal**
  - GitHub link: [here](link GH issue)
  - Bug overview: A white space appeared under the compose box when scrolling up in any conversation
  - Recommendation: Proposed steps in 🧵
  - Assignees: @expensifyemployee1 @expensifyemployee2
  - Do we agree with these steps? 👍 or 👎
  - (In Thread)
    - Step 1
    - Step 2
    - Step 3
    - etc.

#### Writing style of steps
For the test case steps we're asking to be created by the contributor whose PR solved the bug, it'll fall into a category known as bug fix verification. As such, the steps that should be proposed should contain the action element `Verify` and should be tied to the expected behavior in question. 
The steps should be broken out by individual actions taking place with the written style of communicating exact steps someone will replicate. As such, simplicity and succinctness is key. 

Here are some below examples to illustrate the writing style that covers this:
- Bug: White space appears under compose box when scrolling up in any conversation
- Proposed Test Steps:
  - Go to URL https://staging.new.expensify.com/
  - Log in with any account
  - Navigate to any conversation
  - Focus on the compose box and scroll up
  - Verify that no white space appears under the compose box
- Bug: A blank page is shown for an archived room with a message in it
- Proposed Test Steps:
  - Create a workspace if you don't have any
  - Go to members page and remove the other admin ( Expensify setup specialist )
  - Search the announce room and send a message
  - Pin the room and delete the workspace
  - Wait for a few seconds (Reload if the chat is still visible)
  - Verify you are seeing a blank page

---

Once the above proposal has been posted and agreed upon, a member of the Expensify team will then take care of getting it added to the appropriate test suite! If you have any further questions surrounding proposing regression tests, please feel free to ping in #expensify-open-source for further help. 

