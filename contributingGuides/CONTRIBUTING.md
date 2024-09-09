# Contributing to Expensify
Welcome! Thanks for checking out the New Expensify app and taking the time to contribute!

## Getting Started
If you would like to become an Expensify contributor, the first step is to read this document in its **entirety**. The second step is to review the README guidelines [here](https://github.com/Expensify/App/blob/main/README.md) to understand our coding philosophy and for a general overview of the code repository (i.e. how to run the app locally, testing, storage, our app philosophy, etc). Please read both documents before asking questions, as it may be covered within the documentation.

#### Test Accounts
You can create as many accounts as needed in order to test your changes directly from [the app](https://new.expensify.com/). An initial account can be created when logging in for the first time, and additional accounts can be created by opening the "New Chat" or "Group Chat" pages via the Global Create menu, inputting a valid email or phone number, and tapping the user's avatar. Do not use Expensify employee or customer accounts for testing.

**Notes**: 

1. When testing chat functionality in the app please do this between accounts you or your fellow contributors own - **do not test chatting with Concierge**, as this diverts to our customer support team. Thank you.
2. A member of our customer onboarding team gets auto-assigned to every new policy created by a non-paying account to help them set up. Please **do not interact with these teams, ask for calls, or support on your issues.** If you do need to test functionality inside the defaultRooms (#admins & #announce) for any issues you’re working on, please let them know that you are a contributor and don’t need assistance. They will proceed to ignore the chat.

##### Generating Multiple Test Accounts
You can generate multiple test accounts by using a `+` postfix, for example if your email is test@test.com, you can create multiple New Expensify accounts connected to the same email address by using test+123@test.com, test+456@test.com, etc.

##### High Traffic Accounts

All internal engineers, contributors, and C+ members are required to test with a “high traffic” account against the staging or production web servers. Use these Google forms to manage your high-traffic accounts. You'll need to authenticate via Google first. 
1. [Make an account high-traffic](https://docs.google.com/forms/d/e/1FAIpQLScpiS0Mo-HA5xHPsvDow79yTsMBgF0wjuqc0K37lTK5fheB8Q/viewform)
2. [Remove a high-traffic account](https://docs.google.com/forms/d/e/1FAIpQLSd9_FDav83pnhhtu1KGAKIpf2yttQ_0Bvq1b9nuFM1-wbL11Q/viewform)


#### Working on beta features
Some features are locked behind beta flags while development is ongoing. As a contributor you can work on these beta features locally by overriding the [`Permissions.canUseAllBetas` function](https://github.com/Expensify/App/blob/5e268df7f2989ed04bc64c0c86ed77faf134554d/src/libs/Permissions.js#L10-L12) to return `true`.

## Code of Conduct
This project and everyone participating in it is governed by the Expensify [Code of Conduct](https://github.com/Expensify/App/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contributors@expensify.com](mailto:contributors@expensify.com).

## Restrictions
At this time, we are not hiring contractors in Crimea, North Korea, Russia, Iran, Cuba, or Syria.

## Slack channels
All contributors should be a member of a shared Slack channel called [#expensify-open-source](https://expensify.slack.com/archives/C01GTK53T8Q) -- this channel is used to ask **general questions**, facilitate **discussions**, and make **feature requests**.

Before requesting an invite to Slack, please ensure your Upwork account is active, since we only pay via Upwork (see [below](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#payment-for-contributions)). To request an invite to Slack, email contributors@expensify.com with the subject `Slack Channel Invites`. We'll send you an invite! 

Note: Do not send direct messages to the Expensify team in Slack or Expensify Chat, they will not be able to respond. 

Note: if you are hired for an Upwork job and have any job-specific questions, please ask in the GitHub issue or pull request. This will ensure that the person addressing your question has as much context as possible.

## Reporting Vulnerabilities
If you've found a vulnerability, please email security@expensify.com with the subject `Vulnerability Report` instead of creating an issue.

## Payment for Contributions
We hire and pay external contributors via [Upwork.com](https://www.upwork.com). If you'd like to be paid for contributing, please create an Upwork account, apply for an available job in [GitHub](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22), and finally apply for the job in Upwork once your proposal gets selected in GitHub. Please make sure your Upwork profile is **fully verified** before applying, otherwise you run the risk of not being paid. If you think your compensation should be increased for a specific job, you can request a reevaluation by commenting in the Github issue where the Upwork job was posted. 

Please add your Upwork profile link in your GitHub Bio to help ensure prompt payment.  If you're using Slack or Expensify for discussions, please add your Upwork profile link **and** your GitHub username in your Slack Title and Expensify Status. 

Payment for your contributions will be made no less than 7 days after the pull request is deployed to production to allow for [regression](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#regressions) testing. If you have not received payment after 8 days of the PR being deployed to production, and there are no [regressions](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#regressions), please add a comment to the issue mentioning the BugZero team member (Look for the melvin-bot "Triggered auto assignment to... (`Bug`)" to see who this is).

New contributors are limited to working on one job at a time, **do not submit proposals for new jobs until your first PR has been merged**. Experienced contributors may work on numerous jobs simultaneously.

Please be aware that compensation for any support in solving an issue is provided **entirely at Expensify’s discretion**. Personal time or resources applied towards investigating a proposal **will not guarantee compensation**. Compensation is only guaranteed to those who **[propose a solution and get hired for that job](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#propose-a-solution-for-the-job)**. We understand there may be cases where a selected proposal may take inspiration from a previous proposal. Unfortunately, it’s not possible for us to evaluate every individual case and we have no process that can efficiently do so. Issues with higher rewards come with higher risk factors so try to keep things civil and make the best proposal you can. Once again, **any information provided may not necessarily lead to you getting hired for that issue or compensated in any way.**

**Important:** Payment amounts are variable, dependent on if there are any [regressions](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#regressions). Your PR will be reviewed by a [Contributor+ (C+)](https://github.com/Expensify/App/blob/main/contributingGuides/HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md) team member and an internal engineer.  All tests must pass and all code must pass lint checks before a merge. 

### Regressions

If a PR causes a regression at any point within the regression period (starting when the code is merged and ending 168 hours (that's 7 days) after being deployed to production): 
- payments will be issued 7 days after all regressions are fixed (ie: deployed to production)
- a 50% penalty will be applied to the Contributor and [Contributor+](https://github.com/Expensify/App/blob/main/contributingGuides/HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md) for each regression on an issue

The 168 hours (aka 7 days) will be measured by calculating the time between when the PR is merged, and when a bug is posted to the #expensify-bugs Slack channel.

## Finding Jobs
A job could be fixing a bug or working on a new feature. There are two ways you can find a job that you can contribute to:

#### Finding a job that Expensify posted
This is the most common scenario for contributors. The Expensify team posts new jobs to the Upwork job list [here](https://www.upwork.com/nx/search/jobs/?nbs=1&q=expensify%20react%20native&sort=recency&user_location_match=2) (you must be signed in to Upwork to view jobs). Each job in Upwork has a corresponding GitHub issue, which will include instructions to follow. You can also view all open jobs in the Expensify/App GH repository by searching for GH issues with the [`Help Wanted` label](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22). Lastly, you can follow the [@ExpensifyOSS](https://twitter.com/ExpensifyOSS) Twitter account to see a live feed of jobs that are posted.

>**Note:** Our problem solving approach at Expensify is to focus on high value problems and avoid small optimizations with results that are difficult to measure. We also prefer to identify and solve problems at their root. Given that, please ensure all proposed jobs fix a specific problem in a measurable way with evidence so they are easy to evaluate. Here's an example of a good problem/solution:
>
>**Problem:** The app start up time has regressed because we introduced "New Feature" in PR #12345 and is now 1042ms slower because `SomeComponent` is re-rendering 42 times.
>
>**Solution:** Start up time will perceptibly decrease by 1042ms if we prevent the unnecessary re-renders of this component.

## Working on Expensify Jobs
*Reminder: For technical guidance, please refer to the [README](https://github.com/Expensify/App/blob/main/README.md)*.

## Posting Ideas
Additionally, if you want to discuss an idea with the open source community without having a P/S statement yet, you can post it in #expensify-open-source with the prefix `IDEA:`. All ideas to build the future of Expensify are always welcome! i.e.: "`IDEA:` I don't have a P/S for this yet, but just kicking the idea around... what if we [insert crazy idea]?".

#### Make sure you can test on all platforms
* Expensify requires that you can test the app on iOS, MacOS, Android, Web, and mWeb.
* You'll need a Mac to test the iOS and MacOS app.
* In case you don't have one, here's a helpful [document](https://github.com/Expensify/App/blob/main/contributingGuides/TESTING_MACOS_AND_IOS.md) on how you might test all platforms on a Windows/Linux device.

#### Check GitHub for existing proposals from other users

1. Expensify reviews all solution proposals on a first come first serve basis. If you see other contributors have already proposed a solution, you can still provide a solution proposal and we will review it. We look for the earliest provided, best proposed solution that addresses the job.

#### Make sure you can reproduce the problem
2. Use your test account(s) to reproduce the problem by following the steps in the GitHub issue.
3. If you cannot reproduce the problem, pause on this step and add a comment to the issue explaining where you are stuck or that you don't think the issue can be reproduced.

#### Propose a solution for the job
4. You can propose solutions on any issue at any time, but if you propose solutions to jobs before the `Help Wanted` label is applied, you do so at your own risk. Proposals will not be reviewed until the label is added and there is always a chance that we might not add the label or hire an external contributor for the job.
5. Contributors should **not** submit proposals on issues when they have assigned issues or PRs that are awaiting an action from them. If so, they will be in violation of Rule #1 (Get Shit Done) in our [Code of Conduct](https://github.com/Expensify/App/blob/main/CODE_OF_CONDUCT.md) and will receive a warning. Multiple warnings can lead to removal from the program. 
6. After you reproduce the issue, complete the [proposal template here](./PROPOSAL_TEMPLATE.md) and post it as a comment in the corresponding GitHub issue (linked in the Upwork job).
    - Note: Before submitting a proposal on an issue, be sure to read any other existing proposals. ALL NEW PROPOSALS MUST BE DIFFERENT FROM EXISTING PROPOSALS. The *difference* should be important, meaningful or considerable.
7. Refrain from leaving additional comments until someone from the Contributor-Plus team and / or someone from Expensify provides feedback on your proposal (do not create a pull request yet).
    - Do not leave more than one proposal.
    - Do not make extensive changes to your current proposal until after it has been reviewed.
    - If you want to make an entirely new proposal or update an existing proposal, please go back and edit your original proposal, then post a new comment to the issue in this format to alert everyone that it has been updated:
    ```
    ## Proposal
    [Updated](link to proposal)
    ```
8. If your proposal is accepted by the Expensify engineer assigned to the issue, Expensify will hire you on Upwork and assign the GitHub issue to you.
9. Once hired, post a comment in the Github issue stating when you expect to have your PR ready for review.

#### Begin coding your solution in a pull request
9. When you are ready to start, fork the repository and create a new branch.
10. Before you begin writing any code, please be aware that we require all commits to be [signed](https://docs.github.com/en/github/authenticating-to-github/signing-commits). The easiest way to do that is to [generate a new GPG key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key) and [add it to your GitHub account](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account). Once you've done that, you can automatically sign all your commits by adding the following to your `.gitconfig`:
    ```
    [commit]
        gpgsign = true
    [user]
        email = <Your GH account email>
        name = <Your Name>
        signingkey = <your_signing_key>
    [gpg]
        program = gpg
    ```
11. [Open a pull request](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork), and make sure to fill in the required fields.
12. An Expensify engineer and a member from the Contributor-Plus team will be assigned to your pull request automatically to review.
13. Daily updates on weekdays are highly recommended. If you know you won’t be able to provide updates within 48 hours, please comment on the PR or issue stating how long you plan to be out so that we may plan accordingly. We understand everyone needs a little vacation here and there. Any issue that doesn't receive an update for 5 days (including weekend days) may be considered abandoned and the original contract terminated.

#### Submit your pull request for final review
14. When you are ready to submit your pull request for final review, make sure the following checks pass:
	1. CLA - You must sign our [Contributor License Agreement](https://github.com/Expensify/App/blob/main/contributingGuides/CLA.md) by following the CLA bot instructions that will be posted on your PR
	2. Tests - All tests must pass before a merge of a pull request
	3. Lint - All code must pass lint checks before a merge of a pull request
15. Please never force push when a PR review has already started (because this messes with the PR review history)
16. Please pay attention to the pull request template, especially to how we link PRs with issues they fix. Make sure you don't use GitHub keywords such as `fixes` in your PR description, as this can break our current automated steps for issue management. Follow the PR template format carefully.
17. Upon submission of a PR, please include a numbered list of explicit testing steps for each platform (Web, Desktop, iOS, Android, and Mobile Web) to confirm the fix works as expected and there are no regressions.
18. Please add a screenshot of the app running on each platform (Web, Desktop, iOS, Android, Mobile Web).

#### Completing the final checklist
19. Once your PR has been deployed to production, a checklist will automatically be commented in the GH issue. You're required to complete the steps that have your name mentioned before payment will be issued.
20. The items requiring your completion consist of: 
    1. Proposing steps to take for a regression test to ensure the bug doesn't occur again (For information on how to successfully complete this, head [here](https://github.com/Expensify/App/blob/main/contributingGuides/REGRESSION_TEST_BEST_PRACTICES.md)).
    2. Identifying and noting the offending PR that caused the bug (if any).
    3. Commenting on the offending PR to note the bug it caused and why (if applicable).
    4. Starting a conversation on if any additional steps should be taken to prevent further bugs similar to the one fixed from occurring again. 
21. Once the above items have been successfully completed, then payments will begin to be issued. 

#### Timeline expectations and asking for help along the way
- If you have made a change to your pull request and are ready for another review, leave a comment that says "Updated" on the pull request  itself.
- Please keep the conversation in GitHub, and do not ping individual reviewers in Slack or Upwork to get their attention.
- Pull Request reviews can sometimes take a few days. If your pull request has not been addressed after four days, please let us know via the #expensify-open-source Slack channel.
- On occasion, our engineers will need to focus on a feature release and choose to place a hold on the review of your PR. 

#### Important note about JavaScript Style
- Read our official [JavaScript and React style guide](https://github.com/Expensify/App/blob/main/contributingGuides/STYLE.md). Please refer to our Style Guide before asking for a review.

#### For external agencies that Expensify partners with
Follow all the above above steps and processes. When you find a job you'd like to work on:
- Post “I’m from [agency], I’d like to work on this job”
  - If no proposals have been submitted by other contributors, BugZero (BZ) team member or an internal engineer will assign the issue to you. 
  - If there are existing proposals, BZ will put the issue on hold. [Contributor+](https://github.com/Expensify/App/blob/main/contributingGuides/HOW_TO_BECOME_A_CONTRIBUTOR_PLUS.md) will review the existing proposals.  If a contributor’s proposal is accepted then the contributor will be assigned to the issue.  If not the issue will be assigned to the agency-employee. 
- Once assigned follow the steps [here](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md#propose-a-solution-for-the-job) to submit your proposal 

#### Guide on Acronyms used within Expensify Communication
During communication with Expensify, you will come across a variety of acronyms used by our team. While acronyms can be useful, they cease to be the moment they are not known to the receiver. As such, we wanted to create a list here of our most commonly used acronyms and what they're referring to. Lastly, please never hesitate to ask in Slack or the GH issue if there are any that are not understood/known!
- **ND/NewDot:** new.expensify.com
- **OD/OldDot:** expensify.com
- **BZ:** Bug Zero (Expensify internal team in charge of managing the GH issues related to our open-source project)
- **LHN:** Left Hand Navigation (Primary navigation modal in Expensify Chat, docked on the left-hand side)
- **OP:** Original Post (Most commonly the post in E/App GH issues that reports the bug)
- **FAB** Floating Action Button (the + Button that is used to launch flows like 'New Chat', 'Request Money')
- **GBR:** Green Brick Road (UX Design Principle that utilizes green indicators on action items to encourage the user down the optimal path for a given process or task) 
- **RBR:** Red Brick Road (UX Design Principle that utilizes red indicators on action items to encourage the user down the optimal path for handling and discovering errors) 
- **VBA:** Verified Bank Account (Bank account that has been verified as real and belonging to the correct business/individual)
- **NAB:** Not a Blocker (An issue that doesn't block progress, but would be nice to not have)
- **IOU:** I owe you (used to describe payment requests between users)
- **OTP:** One-time password, or magic sign-in
- **RHP:** Right Hand Panel (on larger screens, pages are often displayed docked to the right side of the screen)
- **QA:** Quality Assurance
- **GH:** GitHub
- **LGTM:*** Looks good to me
