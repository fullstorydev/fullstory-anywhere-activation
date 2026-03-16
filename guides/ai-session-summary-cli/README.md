# Generate AI Session Summaries with the Anywhere: Activation CLI

Use the Anywhere: Activation CLI to get started with AI-powered session summaries for support triage, sales prep, and product insight. This guide is a companion to the [AI Session Summary API](https://developer.fullstory.com/anywhere/activation/ai-session-summary-api/) documentation and walks through the same workflow using CLI commands instead of raw API calls.

## Prerequisites

- [Anywhere: Activation CLI](https://github.com/fullstorydev/fullstory-anywhere-activation/tree/main/projects/cli#fullstory-anywhere-activation-cli)
- Fullstory API key with Admin or Architect role.
- [Activation credits](https://help.fullstory.com/hc/en-us/articles/33633977965719-Activation-Quota) for testing; 1000 Activations per month are available with Enterprise and Advanced plans.

## Overview

The AI Session Summary workflow uses Fullstory session data and a configurable summary profile to generate natural-language or structured summaries of user sessions. You can generate plain text summaries for quick review or structured JSON output for integration with support tools.

**Plain text** returns a human-readable narrative.

```
The user navigated to the billing settings page and attempted to update their
payment method. They encountered an error on the card validation step and
retried twice before visiting the help documentation page for payment issues.
The session ended on the help center article without completing the update.
```

**Structured JSON** returns machine-readable fields.

```json
{
  "primary_goal": "Update payment method in billing settings",
  "issues_encountered": [
    "Card validation error on payment update form",
    "Retry failed twice with the same error"
  ],
  "final_action": "Visited help documentation for payment issues",
  "reason_for_termination_suggestion": "User likely abandoned the task after failing to resolve the payment error",
  "help_pages_visited": ["https://help.example.com/billing/payment-methods"]
}
```

## Use Cases

| Use Case          | Description                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Support Triage    | Summarize a user's session before responding to a ticket so agents quickly understand the issue. |
| Sales Preparation | Summarize a prospect's recent sessions to understand product interest before a call.             |
| Product Insight   | Summarize sessions that match a specific quality to identify common friction points.             |
| QA Review         | Summarize sessions where errors occurred to quickly assess impact and reproduction steps.        |

## Install and Configure the CLI

If this is your first time, install the CLI and configure an API key.

1. Download and install the CLI from the [releases](https://github.com/fullstorydev/fullstory-anywhere-activation/releases) page.
2. Run the `fs key:add` command to add your first API key.
3. When prompted, **enter the org ID** (e.g. o-DeM0-na1) and hit enter.
4. Copy the link shown and open in your browser. This will take you to the Settings > Integrations > API Keys page in Fullstory.
5. Click the **Create key** button and follow instructions. Select the **Architect** permission.
6. Copy the provided API key, **paste the API key** in the terminal, and hit enter.
7. Run `fs user` to list users and verify the key was entered succesfully.

## Create a Basic Support Summary Profile

A summary profile defines the pre-prompt and post-prompt that guide the AI when generating a summary. The [basic-support-summary.json](../../profiles/basic-support-summary.json) file contains a basic summary profile.

1. Run `fs profile:create` to create a summary profile interactively.
2. Enter the **profile name** as `Support Summary`.
3. Type `Y` or enter to **configure LLM prompts**.
4. Paste the following **pre-prompt** text and hit enter: `You are a support agent assistant. Analyze the following session data to understand the user's issue.`
5. Paste the following **pre-prompt** text and hit enter: `Based on the session, identify the primary user goal, any errors encountered, and the steps leading to the final critical issue. List any help documentation pages visited.`
6. For the remaining questions, type `N` or enter to accept the defaults.

If you need to find the profile again, run `fs profile` to list all summary profiles in the org.

## Generate a Text Summary

To generate a summary, you'll need a session ID and optionally the profile ID.

1. View a session replay in Fullstory and copy the URL.
2. Run `fs session:summary 'URL'` where `URL` is the replay URL from above. The URL must be wrapped in single quotes because of special characters.
3. **Choose summary profile** and use the arrow keys to select the **Support Summary** profile created earlier and hit enter.

The session summary will be printed as plain text.

```
Here's an analysis of the user session:

**Primary User Goal:** The user's primary goal appears to be purchasing merchandise from the CarGo online store. They are repeatedly attempting to add items to their cart.

**Errors Encountered:** The user consistently encounters an issue where items are not being added to their cart. After clicking "Add to cart" on various product pages, the user is immediately redirected to the cart page, which displays an "Empty Cart Message". This indicates a failure in the "Add to cart" functionality. The user also clicks on "Sold out" items.

**Steps Leading to the Final Critical Issue:**

1.  **Product Browsing:** The user navigates through product collections (collections/all) and product detail pages.
2.  **"Add to Cart" Clicks:** The user repeatedly clicks the "Add to cart" button on various product pages (Cargo Dad Hat, Cargo Sticker, Women's Jacket, Men's Jacket, Duffel Bag).
3.  **Cart Page Redirection:** After each "Add to cart" click, the user is redirected to the cart page.
4.  **Empty Cart Message:** The cart page consistently displays an "Empty Cart Message," indicating that the items are not being added to the cart.
5.  **Dead Clicks:** The user clicks on "Add to cart" on the Men's Jacket and Cargo Dad Hat, but the items are not added to the cart.
6.  **Sold Out Items:** The user clicks on "Sold out" items.

**Help Documentation Pages Visited:** None. The session data does not indicate the user consulted any help documentation.

**In summary, the critical issue is that the "Add to cart" functionality is not working correctly. The user is unable to add any items to their cart, preventing them from completing a purchase.**
```

## Create a Structured Support Summary Profile

For machine-readable output, use a profile with a `response_schema`. The [structured-support-summary.json](../../profiles/structured-support-summary.json) file defines the same prompts with a JSON schema.

1. Download the [structured-support-summary.json](../../profiles/structured-support-summary.json) file.
2. Run `fs profile:create --file FILE` where `FILE` is the downloaded file (e.g. ~/Downloads/structured-support-summary.json).
3. Enter the **profile name** as `Structured Support Summary` and hit enter.
4. Run `fs profile`. You should have a new **Structured Support Summary** profile.

## Generate a Structured Summary

Generate a structured summary using the new profile.

1. Run `fs session:summary 'URL'` where `URL` is the replay URL from earlier.
2. **Choose summary profile** and use the arrow keys to select the **Structured Support Summary** profile and hit enter.

The session summary will be printed as JSON.

```json
{
  "final_action": "The user clicked 'Add to cart' for the 'womens-jacket-copy' product.",
  "help_pages_visited": [],
  "issues_encountered": [
    "The user repeatedly attempts to add items to their cart, but the cart remains empty.",
    "The user encounters 'Sold out' messages for some items.",
    "The user clicks 'Add to cart' multiple times without success."
  ],
  "primary_goal": "The user is trying to purchase items from the Cargomerch Shopify store.",
  "reason_for_termination_suggestion": "The user likely abandoned the session due to repeated failures to add items to the cart, possibly due to technical issues or items being out of stock."
}
```

Structured output is useful for populating support ticket fields or triggering automated workflows.

## Next Steps

- Read the [AI Session Summary API](https://developer.fullstory.com/anywhere/activation/ai-session-summary-api/) documentation for full API details.
- Explore additional [CLI commmands](../../projects/cli/README.md) by running `fs` or with the `--help` flag for any commmand.
- Experiment with additional profiles in the [`profiles/`](../../profiles) directory for sales, QA, and other use cases.
