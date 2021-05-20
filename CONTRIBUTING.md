# Contributing to Expensify.cash
Welcome! Thanks for checking out Expensify.cash and for taking the time to contribute!

## Getting Started
If you would like to become an Expensify.cash contributor, the first step is to read this document in it's entirety. The second step is to review the README guidelines [here](https://github.com/Expensify/Expensify.cash/blob/main/README.md) for a general overview of the code repository (i.e. how to run the app locally, testing, storage, etc). Please read both documents before asking questions, as it may be covered within the documentation.

#### Test Accounts
You can create as many accounts as needed in order to test your changes directly from [expensify.cash](https://expensify.cash/). An initial account can be created when logging in for the first time, and additional accounts can be invited by entering a valid email or phone in the "Find or start a chat" input then tapping the avatar.

## Code of Conduct
This project and everyone participating in it is governed by the Expensify [Code of Conduct](https://github.com/Expensify/Expensify.cash/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contributors@expensify.com](mailto:contributors@expensify.com).

## Restrictions
At this time, we are not hiring contractors in Crimea, North Korea, Russia, Iran, Cuba, or Syria.

## Asking Questions
If you have any general questions, please ask in the #expensify-open-source Slack channel. To request an invite to the channel, just email contributors@expensify.com with the subject `Slack Channel Invite` and we'll send you an invite! The Expensify team will not be able to respond to direct messages in Slack.

If you are hired for an Upwork job and have any job-specific questions, please ask in the GitHub issue or pull request. This will ensure that the person addressing your question has as much context as possible.

## Reporting Vulnerabilities
If you've found a vulnerability, please email security@expensify.com with the subject `Vulnerability Report` instead of creating an issue.

## Payment for Contributions
We hire and pay external contributors via Upwork.com. If you'd like to be paid for contributing, please create an Upwork account and apply for a job in the [Upwork issue list](https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&sort=recency&user_location_match=2). Payment for your contributions will be made no less than 7 days after the pull request is merged to allow for regression testing. We hire one contributor for each Upwork job. New Expensify.cash contributors are limited to working on one job at a time, however experienced contributors may work on numerous jobs simultaneously. If you have not received payment after 8 days of the PR being deployed to production, please email contributors@expensify.com referencing the GH issue and your GH handle.

## Finding Expensify.cash Jobs
There are two ways you can find an Expensify.cash job that you can contribute to:

#### Finding a job that Expensify posted
This is the most common scenario for contributors. The Expensify team posts Expensify.cash jobs to the Upwork job list [here](https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&sort=recency&user_location_match=2). Each job in Upwork has a corresponding GitHub issue, which will include instructions to follow.

#### Proposing a job that Expensify hasn’t posted

In this scenario, it’s possible that you found a bug or enhancement that we haven’t posted to the [Upwork job list](https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&sort=recency&user_location_match=2) or [Github repository](https://github.com/Expensify/Expensify.cash/issues?q=is%3Aissue). This is an opportunity to propose a job, and (optionally) a solution. If it's a valid job proposal, we will compensate you for the solution and give an additional bonus of $150 for proactively proposing the job. In this case, please take the following steps:

    1. Check to ensure an issue does not already exist in the Expensify.cash Issue list or Upwork job list. Please use your best judgement to search for similar titles and issue descriptions.
    2. If your bug or enhancement matches an existing issue, please feel free to comment on that GitHub issue with your findings if you think it’ll help solve a problem.
    3. If there is no existing issue or Upwork job, create a new GitHub issue in the Expensify.cash repo.
    4. Make sure to fill out all the required information fields in the issue template.
    5. Add the `AutoAssignerTriage` label to your issue.
    6. Optional: If you would like to solve the bug or enhancement that you are proposing, please add a comment on your issue with a solution proposal.
    7. Pause on this step until a member of the Expensify team responds on your issue with next steps.

>**Note:** Our problem solving approach at Expensify is to focus on high value problems and avoid small optimizations with results that are difficult to measure. We also prefer to identify and solve problems at their root. Given that, please ensure all proposed jobs fix a specific problem in a measurable way with evidence so they are easy to evaluate. Here's an example of a good problem/solution:
>
>**Problem:** The app start up time has regressed because we introduced "New Feature" in PR #12345 and is now 1042ms slower because `SomeComponent` is re-rendering 42 times.
>
>**Solution:** Start up time will perceptibly decrease by 1042ms if we prevent the unnecessary re-renders of this component.

## Working on Expensify.cash Jobs
*Reminder: For technical guidance please refer to the [README](https://github.com/Expensify/Expensify.cash/blob/main/README.md)*.

#### Express interest for the job on Upwork.com

1. If you are interested in working on a job posted in Upwork, click **Submit a Proposal** in Upwork to express your interest to the Expensify team.

#### Make sure you can reproduce the problem
2. Use your test account(s) to reproduce the problem by following the steps in the GitHub issue.
3. If you cannot reproduce the problem, pause on this step and add a comment to the issue explaining where you are stuck.

#### Propose a solution for the job
4. After you reproduce the issue, make a proposal for your solution and post it as a comment in the corresponding GitHub issue (linked in the Upwork job). Your solution proposal should include a brief technical explanation of the changes you will make.
5. Pause at this step until Expensify provides feedback on your proposal (do not begin coding or creating a pull request yet).
6. If your solution proposal is accepted, Expensify will hire you on Upwork and assign the GitHub issue to you.

#### Begin coding your solution in a pull request
7. When you are ready to start, fork the repository and create a new branch.
8. Before you begin writing any code, please be aware that we require all commits to be [signed](https://docs.github.com/en/github/authenticating-to-github/signing-commits). The easiest way to do that is to [generate a new GPG key](https://docs.github.com/en/github/authenticating-to-github/generating-a-new-gpg-key) and [add it to your Github account](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account). Once you've done that, you can automatically sign all your commits by adding the following to your `.gitconfig`:
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
10. An Expensify engineer will be assigned to your pull request automatically to review.
11. Provide daily updates until reaching completion of your PR.

#### Submit your pull request for final request
12. When you are ready to submit your pull request for final review, make sure the following checks pass:
	1. CLA - You must sign our [Contributor License Agreement](https://github.com/Expensify/Expensify.cash/blob/main/CLA.md) by following the CLA bot instructions that will be posted on your PR
	2. Tests - All tests must pass before a merge of a pull request
	3. Lint - All code must pass lint checks before a merge of a pull request
13. Please never force push when a PR review has already started (because this messes with the PR review history)
14. Upon submission of a PR, please include a numbered list of explicit testing steps for each platform (Web, Desktop, iOS, and Android) to confirm the fix works as expected and there are no regressions.
15. Please add a screenshot of the app running on each platform (Web, Desktop, iOS, Android, Mobile Web). If you are unable to build to iOS/OSX due to using a Windows machine, please let the reviewers know so they can double check that platform themselves. 

#### Timeline expectations and asking for help along the way
- If you have made a change to your pull request and are ready for another review, leave a comment that says "Updated" on the pull request  itself.
- Please keep the conversation in GitHub, and do not ping individual reviewers in Slack or Upwork to get their attention.
- Pull Request reviews can sometimes take a few days. If your pull request has not been addressed after four days please let us know via the #expensify-open-source Slack channel.

#### Important note about JavaScript Style
- Read our official [JavaScript and React style guide](STYLE.md). Please refer to our Style Guide before asking for a review.
- We have nothing against Prettier or any other automatic style fixers, but we generally don't use them here at Expensify. Do not use Prettier. The style changes these tools enforce don't always align with the ones we recommend and require in our eslint configs and can result in uncessary changes for our reviewers. Ignoring this advice will ultimately make your changes take longer to review as we will ask you to undo any style changes that are not relating to the important changes you are making.
