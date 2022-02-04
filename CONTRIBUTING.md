# Contributing to Expensify
Welcome! Thanks for checking out the new Expensify app and for taking the time to contribute!

## Getting Started
If you would like to become an Expensify contributor, the first step is to read this document in its entirety. The second step is to review the README guidelines [here](https://github.com/Expensify/App/blob/main/README.md) to understand our coding philosophy and for a general overview of the code repository (i.e. how to run the app locally, testing, storage, our app philosophy, etc). Please read both documents before asking questions, as it may be covered within the documentation.

#### Test Accounts
You can create as many accounts as needed in order to test your changes directly from [the app](https://new.expensify.com/). An initial account can be created when logging in for the first time, and additional accounts can be created by opening the "New Chat" or "Group Chat" pages via the Global Create menu, inputting a valid email or phone number, and tapping the user's avatar.

**Note**: When testing chat functionality in the app please do this between accounts you or your fellow contributors own - **do not test chatting with Concierge**, as this diverts to our customer support team. Thank you.

##### Generating Multiple Test Accounts
You can generate multiple test accounts by using a `+` postfix, for example if your email is test@test.com, you can create multiple New Expensify accounts connected to the same email address by using test+123@test.com, test+456@test.com, etc.

#### Working on beta features

Some features are locked behind beta flags while development is ongoing. As a contributor you can work on these beta features locally by overriding the [`Permissions.canUseAllBetas` function](https://github.com/Expensify/App/blob/5e268df7f2989ed04bc64c0c86ed77faf134554d/src/libs/Permissions.js#L10-L12) to return `true`.

## Code of Conduct
This project and everyone participating in it is governed by the Expensify [Code of Conduct](https://github.com/Expensify/App/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contributors@expensify.com](mailto:contributors@expensify.com).

## Restrictions
At this time, we are not hiring contractors in Crimea, North Korea, Russia, Iran, Cuba, or Syria.

## Asking Questions
If you have any general questions, please ask in the #expensify-open-source Slack channel. To request an invite to the channel, just email contributors@expensify.com with the subject `Slack Channel Invite` and include a link to your Upwork profile. We'll send you an invite! Note: The Expensify team will not be able to respond to direct messages in Slack.

If you are hired for an Upwork job and have any job-specific questions, please ask in the GitHub issue or pull request. This will ensure that the person addressing your question has as much context as possible.

## Reporting Vulnerabilities
If you've found a vulnerability, please email security@expensify.com with the subject `Vulnerability Report` instead of creating an issue.

## Payment for Contributions
We hire and pay external contributors via Upwork.com. If you'd like to be paid for contributing, please create an Upwork account, apply for an available job in [GitHub](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22), and finally apply for the job in Upwork once your proposal gets selected in GitHub. If you think your compensation should be increased for a specific job, you can request a reevaluation by commenting in the Github issue where the Upwork job was posted. 

Payment for your contributions will be made no less than 7 days after the pull request is deployed to production to allow for regression testing. If a regression occurs, payment will be issued 7 days after all regressions are fixed. If you have not received payment after 8 days of the PR being deployed to production and there being no regressions, please email contributors@expensify.com referencing the GH issue and your GH handle. 

New contributors are limited to working on one job at a time, however experienced contributors may work on numerous jobs simultaneously. 

## Finding Jobs
There are two ways you can find a job that you can contribute to:

#### Finding a job that Expensify posted
This is the most common scenario for contributors. The Expensify team posts new jobs to the Upwork job list [here](https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&sort=recency&user_location_match=2) (you must be signed in to Upwork to view jobs). Each job in Upwork has a corresponding GitHub issue, which will include instructions to follow. You can also view open jobs by searching for issues in GitHub with the [`Help Wanted` label](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22).

#### Proposing a job that Expensify hasn’t posted

It’s possible that you found a bug or enhancement that we haven’t posted to the [GitHub repository](https://github.com/Expensify/App/issues?q=is%3Aissue). This is an opportunity to propose a job, and (optionally) a solution. If it's a valid job proposal that we choose to implement by deploying it to production — either internally or via an external contributor — then we will compensate you $250 for identifying and proposing the improvement.
- Note: If you get assigned the job you proposed **and** you complete the job, this $250 for identifying the improvement is *in addition to* the reward you will be paid for completing the job.
- Note about proposed improvements: Expensify has the right not to pay the $250 reward if the suggested improvement is already planned. Currently, Expensify plans to implement all features of the old Expensify app in New Expensify.

Please follow these steps to propose a job:

1. Check to ensure an issue does not already exist for this topic in the [New Expensify Issue list](https://github.com/Expensify/App/issues). Please use your best judgement by searching for similar titles and issue descriptions.
2. If your bug or enhancement matches an existing issue, please feel free to comment on that GitHub issue with your findings if you think it will help solve the issue.
4. If there is no existing GitHub issue or Upwork job, check if the issue is happening on prod (as opposed to only happening on dev)
5. If the issue is just in dev then it means it's a new issue and has not been deployed to production. In this case, you should try to find the offending PR and comment in the issue tied to the PR and ask the assigned users to add the `DeployBlockerCash` label. If you can't find it, follow the reporting instructions in the next item, but note that the issue is a regression only found in dev and not in prod.
6. If the issue happens in production then report the issue(s) in the [#expensify-open-source](https://github.com/Expensify/App/blob/main/CONTRIBUTING.md#asking-questions) Slack channel, prefixed with `BUG:` or `Feature Request:`. Please use the templates for bugs and feature requests that are bookmarked in #expensify-open-source. View [this guide](https://github.com/Expensify/App/blob/main/HOW_TO_CREATE_A_PLAN.md) for help creating a plan when proposing a feature request. 
7. After review in #expensify-open-source, if you've provided a quality proposal that we choose to implement, a GitHub issue will be created and your Slack handle will be included in the original post after `Issue reported by:`
8. If an external contributor other than yourself is hired to work on the issue, you will also be hired for the same job in Upwork. No additional work is needed. If the issue is fixed internally, a dedicated job will be created to hire and pay you after the issue is fixed. 
9. Payment will be made 7 days after code is deployed to production if there are no regressions. If a regression is discovered, payment will be issued 7 days after all regressions are fixed. 

>**Note:** Our problem solving approach at Expensify is to focus on high value problems and avoid small optimizations with results that are difficult to measure. We also prefer to identify and solve problems at their root. Given that, please ensure all proposed jobs fix a specific problem in a measurable way with evidence so they are easy to evaluate. Here's an example of a good problem/solution:
>
>**Problem:** The app start up time has regressed because we introduced "New Feature" in PR #12345 and is now 1042ms slower because `SomeComponent` is re-rendering 42 times.
>
>**Solution:** Start up time will perceptibly decrease by 1042ms if we prevent the unnecessary re-renders of this component.

## Working on Expensify Jobs
*Reminder: For technical guidance please refer to the [README](https://github.com/Expensify/App/blob/main/README.md)*.

#### Make sure you can test on all platforms
* Expensify requires that you can test the app on iOS, MacOS, Android, Web, and mWeb.
* You'll need a Mac to test the iOS and MacOS app.
* In case you don't have one, here's a helpful [document](https://docs.google.com/document/d/1TD8A-SQbBN2EsnF98cEib2wiERK68fux2P0LGSkobrg/edit?usp=sharing) on how you might test all platforms on a Windows/Linux device.

#### Check GitHub for existing proposals from other users

1. Expensify reviews all solution proposals on a first come first serve basis. If you see other contributors have already proposed a solution, you can still provide a solution proposal and we will review it. We look for the earliest provided, best proposed solution that addresses the job.

#### Make sure you can reproduce the problem
2. Use your test account(s) to reproduce the problem by following the steps in the GitHub issue.
3. If you cannot reproduce the problem, pause on this step and add a comment to the issue explaining where you are stuck or that you don't think the issue can be reproduced.

#### Propose a solution for the job
4. After you reproduce the issue, make a proposal for your solution and post it as a comment in the corresponding GitHub issue (linked in the Upwork job). Your solution proposal should include a brief technical explanation of the changes you will make.
    - Note: If you post a proposed solution in an issue that has not been tagged with the `External` label, Expensify has the right to use your proposal to fix said issue, without providing compensation for your solution.
    - Note: Before submitting a proposal on an issue, be sure to read any other existing proposals. Any new proposal should be substantively different from existing proposals.
5. Pause at this step until someone from the Contributor-Plus team and / or someone from Expensify provides feedback on your proposal (do not create a pull request yet).
6. If your solution proposal is accepted, Expensify will hire you on Upwork and assign the GitHub issue to you.

#### Begin coding your solution in a pull request
7. When you are ready to start, fork the repository and create a new branch.
8. Before you begin writing any code, please be aware that we require all commits to be [signed](https://docs.github.com/en/github/authenticating-to-github/signing-commits). The easiest way to do that is to [generate a new GPG key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key) and [add it to your GitHub account](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account). Once you've done that, you can automatically sign all your commits by adding the following to your `.gitconfig`:
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
9. [Open a pull request](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork), and make sure to fill in the required fields.
10. An Expensify engineer and a member from the Contributor-Plus team will be assigned to your pull request automatically to review.
11. Daily updates on weekdays are highly recommended. If you know you won’t be able to provide updates for > 1 week, please comment on the PR or issue how long you plan to be out so that we may plan accordingly. We understand everyone needs a little vacation here and there. Any issue that doesn't receive an update for 1 full week may be considered abandoned and the original contract terminated.

#### Submit your pull request for final review
12. When you are ready to submit your pull request for final review, make sure the following checks pass:
	1. CLA - You must sign our [Contributor License Agreement](https://github.com/Expensify/App/blob/main/CLA.md) by following the CLA bot instructions that will be posted on your PR
	2. Tests - All tests must pass before a merge of a pull request
	3. Lint - All code must pass lint checks before a merge of a pull request
13. Please never force push when a PR review has already started (because this messes with the PR review history)
14. Please pay attention to the pull request template, especially to how we link PRs with issues they fix. Make sure you don't use GitHub keywords such as `fixes` in your PR description, as this can break our current automated steps for issue management. Follow the PR template format carefully.
15. Upon submission of a PR, please include a numbered list of explicit testing steps for each platform (Web, Desktop, iOS, Android, and Mobile Web) to confirm the fix works as expected and there are no regressions.
16. Please add a screenshot of the app running on each platform (Web, Desktop, iOS, Android, Mobile Web). If you are unable to build to iOS/OSX due to using a Windows machine, please let the reviewers know so they can double check that platform themselves.

#### Timeline expectations and asking for help along the way
- If you have made a change to your pull request and are ready for another review, leave a comment that says "Updated" on the pull request  itself.
- Please keep the conversation in GitHub, and do not ping individual reviewers in Slack or Upwork to get their attention.
- Pull Request reviews can sometimes take a few days. If your pull request has not been addressed after four days please let us know via the #expensify-open-source Slack channel.
- On occasion, our engineers will need to focus on a feature release and choose to place a hold on the review of your PR. Depending on the hold length, our team will decide if a bonus will be applied to the job.    

#### Important note about JavaScript Style
- Read our official [JavaScript and React style guide](STYLE.md). Please refer to our Style Guide before asking for a review.
- We have nothing against Prettier or any other automatic style fixers, but we generally don't use them here at Expensify. Do not use Prettier. The style changes these tools enforce don't always align with the ones we recommend and require in our eslint configs and can result in uncessary changes for our reviewers. Ignoring this advice will ultimately make your changes take longer to review as we will ask you to undo any style changes that are not related to the important changes you are making.
