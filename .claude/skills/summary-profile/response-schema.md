# Response Schema Reference

The `response_schema` field in a Summary Profile defines the structure of the AI's output. It uses a subset of OpenAPI schema syntax with Fullstory-specific conventions.

## Constraints

- Types must be **CAPITALIZED**: `STRING`, `NUMBER`, `INTEGER`, `BOOLEAN`, `ARRAY`, `OBJECT`
- Do **not** include `$schema` or `$id` fields — they are not supported
- The root schema should be type `OBJECT` with `properties`

## Schema fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | The data type. One of: `STRING`, `NUMBER`, `INTEGER`, `BOOLEAN`, `ARRAY`, `OBJECT` |
| `title` | string | Optional display name for the schema or property |
| `description` | string | Describes the property's purpose — guides the AI on what to generate |
| `items` | OpenapiSchema | Schema for array elements. Required when `type` is `ARRAY` |
| `properties` | map of OpenapiSchema | Named sub-properties. Required when `type` is `OBJECT` |
| `required` | array of strings | Property names that must appear in the output |
| `nullable` | boolean | Whether the field can be `null` |
| `enum` | array of strings | Fixed set of allowed values (use with `STRING` type) |
| `format` | string | Optional format hint (e.g., `"enum"` when using enum values) |

## Type reference

### STRING

A text value.

```json
{
  "type": "STRING",
  "description": "A concise summary of the user's main objective."
}
```

### NUMBER

A floating-point number.

```json
{
  "type": "NUMBER",
  "description": "Confidence score from 0.0 to 1.0."
}
```

### INTEGER

A whole number.

```json
{
  "type": "INTEGER",
  "description": "Number of errors encountered during the session."
}
```

### BOOLEAN

A true/false value.

```json
{
  "type": "BOOLEAN",
  "description": "Whether the user completed their primary goal."
}
```

### ARRAY

An ordered list. Must include `items` to define the element schema.

```json
{
  "type": "ARRAY",
  "description": "A list of issues the user encountered.",
  "items": {
    "type": "STRING",
    "description": "A description of a single issue."
  }
}
```

### OBJECT

A structured object with named properties.

```json
{
  "type": "OBJECT",
  "properties": {
    "name": {
      "type": "STRING",
      "description": "The feature name."
    },
    "engaged": {
      "type": "BOOLEAN",
      "description": "Whether the user interacted with this feature."
    }
  },
  "required": ["name", "engaged"]
}
```

## Enum fields

Use `enum` to constrain a STRING property to a fixed set of values. This is useful for categorization fields like sentiment, priority, or status.

```json
{
  "type": "STRING",
  "description": "Overall user sentiment during the session.",
  "enum": ["positive", "neutral", "negative"],
  "format": "enum"
}
```

## Complete examples

### Flat schema — support summary

From [structured-support-summary.json](/profiles/structured-support-summary.json):

```json
{
  "type": "OBJECT",
  "properties": {
    "primary_goal": {
      "type": "STRING",
      "description": "A summary of the user's main objective during the session."
    },
    "issues_encountered": {
      "type": "ARRAY",
      "description": "A list of problems or errors the user faced.",
      "items": {
        "type": "STRING",
        "description": "A description of a single issue."
      }
    },
    "final_action": {
      "type": "STRING",
      "description": "The last significant action the user took before the session ended."
    },
    "reason_for_termination_suggestion": {
      "type": "STRING",
      "description": "A suggested reason for why the user ended their session."
    },
    "help_pages_visited": {
      "type": "ARRAY",
      "description": "A list of URLs for help or documentation pages the user visited.",
      "items": {
        "type": "STRING",
        "description": "The URL of a help page."
      }
    }
  },
  "required": [
    "primary_goal",
    "issues_encountered",
    "final_action",
    "reason_for_termination_suggestion",
    "help_pages_visited"
  ]
}
```

### Nested schema — QA review with array of issue objects

```json
{
  "type": "OBJECT",
  "properties": {
    "session_quality_score": {
      "type": "INTEGER",
      "description": "Overall session quality from 1 (poor) to 5 (excellent)."
    },
    "issues": {
      "type": "ARRAY",
      "description": "List of issues found during the session.",
      "items": {
        "type": "OBJECT",
        "properties": {
          "category": {
            "type": "STRING",
            "description": "The type of issue.",
            "enum": ["ui_bug", "error", "performance", "usability", "accessibility"],
            "format": "enum"
          },
          "severity": {
            "type": "STRING",
            "description": "How severe the issue is.",
            "enum": ["low", "medium", "high", "critical"],
            "format": "enum"
          },
          "description": {
            "type": "STRING",
            "description": "What happened and where in the session it occurred."
          },
          "page_url": {
            "type": "STRING",
            "description": "The URL where the issue was observed.",
            "nullable": true
          }
        },
        "required": ["category", "severity", "description"]
      }
    },
    "recommendation": {
      "type": "STRING",
      "description": "A brief recommendation for the product team based on the issues found."
    }
  },
  "required": ["session_quality_score", "issues", "recommendation"]
}
```

## Tips

- **Always include `description`** on every property — it's the primary way to guide the AI on what to generate for each field.
- **Use `required`** to ensure critical fields always appear in the output. Omitted fields may be skipped if the AI doesn't find relevant data.
- **Use `enum` for categories** — sentiment, priority, status, or any field with a known set of values. This produces cleaner, more consistent output.
- **Keep schemas flat when possible.** Nesting adds complexity. Only use nested objects when the data naturally has sub-structure (e.g., a list of issues each with multiple attributes).
- **Test with real sessions.** Schema design is iterative — run your profile against a few real sessions to verify the AI produces useful output for each field.
