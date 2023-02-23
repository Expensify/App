# TestRail Navigation and Process for C+

## Context
C+ are responsible for finding the appropriate location for a new or updated regression test case before the proposed test steps are posted by the Contributor who fixed the bug. This document is intended to give a short overview on how to navigate TestRail and best practices on choosing the correct location for the proposed steps. 
As a C+ member, you will have view-only access to Expensify's TestRail account in order to complete this task.     

## Navigating TestRail
- Expensify's TestRail account is broken down into four projects, for the purpose of this task, we will use the project titled, `NewDot - New Expensify (New Format)`. Click on this project. 
- Within the project, you will find six headers that showcase the sub-categories of this project. You will click on `Test Suites and Cases`.
- You will then be showed the various Test Suites and Cases available, click on `New Expensify`.
- You now will have the overview of our various test cases that our outsourced QA team, Applause, run every day. On the right hand side, you will see a list of folders that detail different scenarios we house tests under. Clicking on one of these folders will then bring you to the list of specific test cases we currently have for the scenario in question. 
- Clicking on one of the test cases will then take you to the overview of the steps taken by Applause to ensure everything works as expected. You will notice the expected behaviors are identified by the action word, `Verify`. 

## Process for TestRail
- Before proposing regression test steps, the C+ should first head to TestRail and identify which available scenario the bug in question best belongs in (e.g. A bug identified in the flow for updating preferred pronouns would fall under Account Settings). 
- Following, the C+ will then determine if there's an existing test case under the scenario that we can update to encompass the new steps that will be proposed OR if we need to create a new test case to accommodate the proposed steps.
- Once determined, the C+ will post a comment in the original GH issue which scenario the bug belongs under, why they think it belongs there, and if the test steps can fall under a current test case or if a new test case needs to be created. Please provide your reasoning for your decision in the comment and tag the BZ member to gut-check.
  - If the BZ member agrees with the C+'s recommendation, they'll give a thumbs up on the comment. If not, a discussion will be held on where they think it might fit better, etc.
  - There's a chance we will agree to not update/create a test case for the bug in question, depending on the bug. 
- Once we've come to agreement where the test will live, the C+ will tag the Contributor whose PR solved the bug in a comment giving them the green light to propose test steps.
  - If we're updating a current test case, the C+ will post what the current steps are in the GH for the Contributor to find where they can best insert their proposed test steps.
  - If we're creating a new test case, the C+ will make note of it for the Contributor.
- Once the Contributor has provided proposed test steps, the C+ will review to ensure:
  - The language style matches the language style in TestRail (e.g. action items use the term `Verify`)
  - The steps are clear, logical, concise, and void of any assumed knowledge
  - (For updating a current test case) the steps are logically placed in the test case
  - If changes are needed, the C+ and Contributor will discuss what changes should be done in order to make them appropriate
- After confirming the above, the C+ will give a thumbs up to the steps proposed, and comment that they're ready to go and tag the BZ member on the issue
- The BZ member will then create and link the GH updating our TestRail steps into the original issue, and move forward with payment.
 
