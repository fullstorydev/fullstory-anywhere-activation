# Contributing

Thanks for your interest in contributing to `fullstory-anywhere-activation`. Contributions can take several forms:

- **New guides** — scenario-driven walkthroughs for building with Fullstory Anywhere: Activation
- **Bug fixes** — corrected code snippets, broken links, outdated steps
- **Improvements** — clearer explanations, additional context, better examples

## Adding a Guide with Claude Code

1. **Fork** the repository and create a feature branch.
2. **Use Claude Code** and the project's `guide-author` agent.
3. **Open a pull request** with a brief description of what the guide covers and why it's useful.

For example, the following prompt can be used to author a Slack-related guide.

```
@"guide-author (agent)", create a Fullstory Streams to Slack integration using the minimal number of steps. Avoid intermediate servers and code where possible; use vendor features already available to complete direct integration versus creating new middleware. The guide's main use case is related to suspicious activity for previously identified IP addresses.  When a user visits any web page that matches an IP in the list, the Stream should send a message to a Slack channel. The message should include relevant details about visit: IP address, web page URL, etc to get a quick sense of the risk level.
```

## Adding a Guide Manually

1. **Fork** the repository and create a feature branch.
2. **Create a directory** under `guides/` using a short, descriptive slug (e.g., `guides/streams-pagerduty-alert/`).
3. **Add a `README.md`** inside your new directory. Follow the structure used by existing guides.
4. **Add code used by your guide** inside your new directory. Test before submitting.
5. **Update the root `README.md`** to add your guide to the index table.
6. **Open a pull request** with a brief description of what the guide covers and why it's useful.

## Guide Standards

- Code snippets should be self-contained and runnable with minimal setup.
- All external URLs should be verified as reachable before submitting.
- Do not include secrets, credentials, or real API keys — use environment variables and `.env` examples.

## Reporting Issues

Open a GitHub Issue for:

- Broken or incorrect code snippets
- Outdated steps (e.g. Fullstory UI or API changes)
- Broken external links
- Unclear instructions
