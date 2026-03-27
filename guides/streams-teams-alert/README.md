# Build a Real-time Microsoft Teams Alert with Anywhere: Activation Streams

Use Fullstory Anywhere: Activation Streams to alert a Microsoft Teams channel in real-time when behavioral patterns of interest occur. Anywhere: Activation Streams improves upon the hourly reporting of existing [Fullstory alerts](https://help.fullstory.com/hc/en-us/articles/360020828653-Introduction-to-Metric-Segment-and-Opportunities-Alerts) to provide faster notifications for time-sensitive use cases while also allowing more control over message content and formatting through Field Mapping.

## Prerequisites

- Admin or Architect role in Fullstory (required to configure Streams).
- Activation credits for testing; 1000 Activations per month are available with Enterprise and Advanced plans.
- A Microsoft Teams workspace where you have permission to manage channel connectors.
- A Teams channel with an [Incoming Webhook](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) connector configured and a webhook URL targeting your alert channel.

## Use Cases

| Use Case           | Description                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Suspicious Visit   | Notify a security channel in real-time when a page visit originates from a known suspicious IP address.                         |
| Sales Outreach     | Notify the sales channel for timely outreach when identified visitors return to pricing or demo pages.                          |
| Keyword Monitoring | Notify support, customer success, or product manager channels when specific keywords are mentioned in form submissions.         |
| VIP Response       | Notify customer success when identified high-value customers show signs of frustration and offer proactive white glove service. |

## Workflow

1. An end user begins interacting with your website or mobile app.
2. Fullstory begins capture and evaluates Stream trigger conditions.
3. Once a match occurs, Fullstory sends an HTTP POST directly to the Teams Incoming Webhook URL.
4. Teams renders an alert in your designated channel.

## Configure the Destination

### Create a Teams Incoming Webhook

1. In the Teams client, navigate to the channel where you want to receive alerts.
2. Select **More options** ••• on the right side of the channel name.
3. Select **Manage channel**.
4. Select **Edit** next to Connectors.
5. Search for **Incoming Webhook** and select **Add**.
6. In the Incoming Webhook dialog, select **Add**.
7. Provide a name for the webhook (e.g., `Fullstory Alerts`) and optionally upload an image.
8. Select **Create**.
9. **Copy** the generated webhook URL that looks like this: `https://xxxxx.webhook.office.com/webhookb2/xxxxx@xxxxx/IncomingWebhook/xxxxx/xxxxx`
10. Select **Done**. The webhook is now active in the Teams channel.

Keep the webhook URL private; it is the credential for posting to that channel. Review the [Teams Incoming Webhooks documentation](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) for full setup details.

## Configure a Fullstory Stream

### Create a Defined Event

Before creating the Stream, create a [Defined Event](https://help.fullstory.com/hc/en-us/articles/360051664454-Define-Events-in-Fullstory) that best matches your use case. The Stream will use the Defined Event in the Stream Definition so that only matching sessions trigger the Teams alert.

1. In Fullstory, go to **Settings** > **Data Management** > **Events**.
2. Click **Create Event**.
3. Update the Event Defintion to be any of the following use cases.

#### Suspicious Visit

1. Click **Select an event...** and select **Visited URL**
2. Click **is** and select **any** to allow any URL to be matched.
3. Click the Refine Event button immediately to the right of **any** and search for **IP address**.
4. Add previously identified IP address (e.g., `203.0.113.42`). Use the **or** button to add multiple. If you have a long list, use the kebab icon to **Bulk edit** and add up to 500.
5. **Name** the event (e.g. `Suspicious Visit`) and click **Save**.

#### Keyword Monitoring

1. Click **Select an event...** and select **Changed**
2. Click **Element** and select **text**.
3. Add your keyword in the **Type something** input box. Use the **or** button to add multiple. If you have a long list, use the kebab icon to **Bulk edit** and add up to 500.
4. **Name** the event (e.g. `Keyword Entered`) and click **Save**.

#### VIP Response

1. Click **Select an event...** and select **Visited URL**
2. Click **is** and select **any** to allow any URL to be matched.
3. Click the Refine Event button immediately to the right of **any** and scroll to **User Properties**.
4. Add the user's email address (or similar property). Use the **or** button to add multiple. If you have a long list, use the kebab icon to **Bulk edit** and add up to 500. Depending on your configuration, you can also scroll to find **Customer User Properties** that may be integrated with Fullstory.
5. **Name** the event (e.g. `VIP Visit`) and click **Save**.

### Create the Stream

Create a Stream that sends messages to Teams. This Stream definition consumes 1 activation unit for every 100 successful deliveries.

1. In Fullstory, go to **Settings** > **Anywhere** > **Activation**.
2. Click **Create Stream**.
3. **Name** the Stream (e.g., `Sample Teams Alert`).
4. In **Destination**, paste the webhook URL you copied previously into the **API Endpoint URL** input field.
5. In **Definition**, click **Select an event** and choose **Custom Event**.
6. Click **Any API Event** and select your previously created Defined Event found in the **Defined** section.
7. In **Field Mapping**, click **JSON** and paste one of the following depending on your use case.
8. Click **Send Test** and verify the message is received in your Teams channel. Once the message is verified, click **Save**.

#### Suspicious Visit

```json
{
  "text": [
    "concat",
    "**Suspicious IP Detected**\n\nIP Address: ",
    ["var", "event.0.ip_address"],
    "\n\n[Fullstory Session](",
    ["var", "event.0.app_url_event"],
    ")"
  ]
}
```

#### Keyword Monitoring

```json
{
  "text": [
    "concat",
    "**Keyword Entered**\n\nKeyword(s): ",
    ["var", "event.0.target_text"],
    "\n\n[Fullstory Session](",
    ["var", "event.0.app_url_event"],
    ")"
  ]
}
```

#### VIP Visit

```json
{
  "text": [
    "concat",
    "**VIP Visit Detected**\n\nUser: ",
    ["var", "event.0.user_email"],
    "\n\n[Fullstory Session](",
    ["var", "event.0.app_url_event"],
    ")"
  ]
}
```

If you're using a Custom User Property, replace `user_email` with the property itself (e.g. `loyalty_tier`).

## Testing

1. Visit your website where Fullstory is deployed. Use a browser in incognito mode to create a new session.
2. Perform the actions relevant to the use case you configured.
3. Open your Teams channel and confirm the alert was received.
4. Click the **Fullstory Session** link in the alert to verify the session replay URL opens correctly.

## Next Steps

- Use the [Adaptive Card examples](./adaptive-cards-json.md) instead of text-based messages.
- Explore more message combinations using the [Message Card Playground](https://amdesigner.azurewebsites.net/) and [Streams Advanced JSON Mapping](https://developer.fullstory.com/anywhere/activation/streams/#advanced-json-mapping).
- Review Stream [events](https://developer.fullstory.com/anywhere/activation/streams/#event) to create new Streams or enhance single event Streams with more events to create patterns.
