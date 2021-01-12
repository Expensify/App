# Contributing to Expensify.cash
Welcome! Thanks for checking out Expensify.cash and for taking the time to contribute!

## Getting Started
This guide is specifically for external contributors. For a general overview of the repo, check out our README located [here](https://github.com/Expensify/Expensify.cash/blob/master/README.md). The part of the README to pay particular attention to is how to [run the app](https://github.com/Expensify/Expensify.cash#local-development) locally using our production API.

#### Test Accounts
You can create as many accounts as needed in order to test your changes directly from [expensify.cash](https://expensify.cash/). An initial account can be created when logging in for the first time and additional accounts can be invited by entering a valid email or phone in the "Find or start a chat" input then tapping the avatar.

## Code of Conduct
This project and everyone participating in it is governed by the Expensify [Code of Conduct](https://github.com/Expensify/Expensify.cash/blob/master/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contributors@expensify.com](mailto:contributors@expensify.com).

## Asking Questions
The best way to ask questions is to join our #expensify-contributors Slack channel. To request an invite to the channel, just email contributors@expensify.com with the subject "Slack Channel Invite" and we'll send you an invite! Please do not create issues to ask questions.

## Reporting Vulnerabilities
If you've found a vulnerability, please email security@expensify.com with the subject `Vulnerability Report` instead of creating an issue.

## Filing Issues
If you'd like to create a new issue, please first make sure the issue does not exist in the [issue list](https://github.com/Expensify/Expensify.cash/issues). When creating a new issue, please include all the required information on the issue template.

## Payment for Contributions
We are currently managing payment via Upwork. If you'd like to be paid for your contributions, please apply to fix the issue from our [Upwork issue list](https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&sort=recency&user_location_match=2). Each issue in this repo will also link out to the associated Upwork job.

## Submitting a Pull Request
#### Proposing a Change
1. **Before writing any code**, please post a proposal of the solution you plan to implement as a comment in the GH issue. This should include a brief technical explanation of the changes you will make.
1. Wait for Expensify to review and provide feedback on the proposal within the GH issue, and assign the GH issue to you. Please do not move forward with creating a Pull Request until your proposal is approved
1. Fork this repository and create a new branch
1. ‼️ **Before you start writing any code** ️‼️, please be aware that we require all commits to be [signed](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/signing-commits). The easiest way to do that is to [generate a new GPG key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-gpg-key) and [add it to your Github account](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-gpg-key-to-your-github-account). Once you've done that, you can automatically sign all your commits by adding the following to your `.gitconfig`:
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
1. [Open a PR](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork). Be sure to fill in all the required information on the PR template.
1. An Expensify engineer will be automatically assigned to review your PR
1. You will need all checks to pass:
	1. CLA - You must sign our [Contributor License Agreement](https://github.com/Expensify/Expensify.cash/blob/master/CLA.md) by following the CLA bot instructions that will be posted on your PR
	1. Tests - All tests must pass before a merge of a pull request
	1. Lint - All code must pass lint checks before a merge of a pull request

#### Testing
Upon submission of a PR, please include a numbered list of explicit testing steps for each platform (Web, Desktop, iOS, and Android) to confirm the fix works as expected and there are no regressions.

#### Review Tips

### Getting Attention
- If you have made a change and are ready for another review the best way to get your reviewer's attention is to leave a comment that says "Updated" on the PR itself.
- Please do NOT ping individual reviewers in the Slack channel to get their attention and keep the conversation in GitHub whenever possible.
- Patience is a virtue. Reviews can sometimes take place over the course of several days. If your PR has not been addressed after 3 days please leave a comment on the PR. If the PR goes without a response for another day please let us know via Slack.

### JavaScript Style
- We have nothing against Prettier or any other automatic style fixers, but we generally don't use them here at Expensify. Do not use Prettier. The style changes these tools enforce don't always align with the ones we recommend and require in our eslint configs and can result in uncessary changes for our reviewers. Ignoring this advice will ultimately make your changes take longer to review as we will ask you to undo any style changes that are not relating to the important changes you are making.
