# Build a Real-time Slack Alert with Anywhere: Activation Streams

Use Fullstory Anywhere: Activation Streams to alert a Slack channel in real-time when behavioral patterns of interest occur. Anywhere: Activation Streams improves upon the hourly reporting of existing [Fullstory alerts](https://help.fullstory.com/hc/en-us/articles/360020828653-Introduction-to-Metric-Segment-and-Opportunities-Alerts) to provide faster notifications for time-sensitive use cases while also allowing more control over message content and formatting through Field Mapping.

## Prerequisites

- Admin or Architect role in Fullstory (required to configure Streams).
- Activation credits for testing; 1000 Activations per month are available with Enterprise and Advanced plans.
- A Slack workspace where you have permission to install apps.
- A Slack app with [Incoming Webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks) enabled and a webhook URL targeting your alert channel.

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
3. Once a match occurs, Fullstory sends an HTTP POST directly to the Slack Incoming Webhook URL.
4. Slack renders an alert in your designated channel.

## Configure the Destination

### Create a Slack App and Incoming Webhook

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps) and click **Create New App**.
2. Choose **From scratch**, give the app a name (e.g., `Fullstory Alerts`), and select your workspace. Click **Create App**.
3. In the left sidebar, click **Incoming Webhooks**.
4. Toggle **Activate Incoming Webhooks** to **On**.
5. Click **Add New Webhook**.
6. Select the channel that should receive alerts (e.g., `#fullstory-alerts`) and click **Allow**.
7. **Copy** the generated webhook URL that looks like this `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`

Keep the webhook URL private; it is the credential for posting to that channel. Review [Slack Incoming Webhooks documentation](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks) for full setup details.

## Configure a Fullstory Stream

### Create a Defined Event

Before creating the Stream, create a [Defined Event](https://help.fullstory.com/hc/en-us/articles/360051664454-Define-Events-in-Fullstory) that best matches your use case. The Stream will use the Defined Event in the Stream Definition so that only matching sessions trigger the Slack alert.

1. In Fullstory, go to **Settings** > **Data Management** > **Events**.
2. Click **Create Event**.
3. Update the Event Defintion to be any of the following use cases.

#### Suspicious Visit

1. Click **Select an event...** and select **Visited URL**
2. Click **is** and select **any** to allow any URL to be matched.
3. Click the Refine Event button immediately to the right of **any** and search for **IP address**.
4. Add previously identified IP addresses (e.g., `203.0.113.42`, `198.51.100.7`) using the **or** button to add multiple. If you have a long list, use the kebab icon to **Bulk edit** and add up to 500.
5. **Name** the event (e.g. `Suspicious Visit`) and click **Save**.

### Create the Stream

Create a Stream that sends messages to Slack. This Stream definition consumes 1 activation unit for every 100 successful deliveries.

1. In Fullstory, go to **Settings** > **Anywhere** > **Activation**.
2. Click **Create Stream**.
3. **Name** the Stream (e.g., `Sample Slack Alert`).
4. In **Destination**, paste the webhook URL you copied previously into the **API Endpoint URL** input field.
5. In **Definition**, click **Select an event** and choose **Custom Event**.
6. Click **Any API Event** and select your previously created Defined Event found in the **Defined** section.
7. In **Field Mapping**, click **JSON** and paste one of the following depending on you use case.
8. Click **Send Test** and verify the message is received in your Slack channel. Once the message is verified, click **Save**.

#### Suspicious Visit

```json
{
  "text": [
    "concat",
    "*Suspicious IP Detected*\n",
    "IP Address: ",
    ["var", "event.0.ip_address"],
    "\n<",
    ["var", "event.0.app_url_event"],
    "|Fullstory Session>"
  ]
}
```

## Testing

1. Visit your website where Fullstory is deployed. Use a browser in incognito mode to create new session.
2. Perform the actions relevant to the use case you configured.
3. Open your Slack channel (e.g. `#fullstory-alerts`) and confirm the alert was received.
4. Click the **Fullstory Session** link in the alert to verify the session replay URL opens correctly.

## Next Steps

- Explore more message combinations using Slack's [Block Kit Builder](https://app.slack.com/block-kit-builder/T02FE3LFK#%7B%22blocks%22:%5B%5D%7D) and [Streams Advanced JSON Mapping](https://developer.fullstory.com/anywhere/activation/streams/#advanced-json-mapping).
- Use the [Block Kit example](./block-kit-json.md) of the Suspicious Visit message.
- Review Stream [events](https://developer.fullstory.com/anywhere/activation/streams/#event) to create new Streams or enhance single event Streams with more events to create patterns.
