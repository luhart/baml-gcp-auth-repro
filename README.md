# BAML Vertex AI Authentication Issue in GCP Cloud Run

## Problem 

Unable to auth using BAML with Vertex AI in Cloud Run. Need to use `AuthStrategy::SystemDefault` ("use the service account from the GCP compute environment by querying the metadata server") and not set `GOOGLE_APPLICATION_CREDENTIALS` because this. The `google-ai` provider via API key is a temporary workaround, but I have some "Business Requirements" that prevent me from doing that lol.

[want to do it this way](https://github.com/BoundaryML/baml/blob/03735feb5b9e70ad6a872e1c5d0837eea43034df/engine/baml-runtime/src/internal/llm_client/primitive/vertex/std_auth.rs#L44)


## Environment

- Platform: Google Cloud Run
- BAML Provider: Vertex AI
- BAML Version: 0.75.0

## Reproduction Steps

To reproduce:

1. Clone this repository
2. Deploy to Cloud Run (make sure service account has access to Vertex AI)
3. Make a POST to the `/test-gcp/baml` endpoint (can just use scalar ui https://https://[YOUR-CLOUD-RUN-URL]/docs)


## Expected Behavior

BAML should successfully authenticate using the metadata server in Cloud Run, as the metadata server is accessible and provides valid tokens that work with Vertex AI directly.


## Actual Behavior

Auth chain fails:

```
running at localhost:8080
Ready condition status changed to True for Revision baml-gcp-auth-repro-00004-fn6 with message: Deploying revision succeeded in 10.55s.
Ready condition status changed to True for Service baml-gcp-auth-repro.
POST 200 2.15 KiB 600 ms Chrome 132.0.0.0 https://[YOUR-CLOUD-RUN-URL]/test-gcp/baml
[DEBUG internal_llm_client::clients::vertex] Neither options.credentials nor options.credentials_content are set, falling back to env vars
[DEBUG internal_llm_client::clients::vertex] Using UseSystemDefault strategy
[DEBUG internal_baml_jinja] Rendering template: 
Parse the following resume and return a structured representation of the data in the schema below.

Resume:
---
{{ resume_text }}
---

{# special macro to print the output instructions. #}
{{ ctx.output_format }}

JSON:
------

[DEBUG baml_runtime::internal::llm_client::primitive::vertex::std_auth] Attempting to auth using SystemDefault strategy
[DEBUG gcp_auth::gcloud_authorized_user] try to print access token via `gcloud`
[DEBUG tracing::span] fetch_token;
[WARN  baml_events] Function ExtractResume:
Client: GeminiClient (<unknown>) - 1ms
---PROMPT---
[chat] user: Parse the following resume and return a structured representation of the data in the schema below.

Resume:
---
John Doe

Education
- University of California, Berkeley
  - B.S. in Computer Science
  - 2020

Skills
- Python
- Java
- C++
---

Answer in JSON using this schema:
{
  name: string,
  // Extract in the same order listed
  education: [
    {
      school: string,
      degree: string,
      year: int,
    }
  ],
  // Only include programming languages
  skills: string[],
}

JSON:

---REQUEST OPTIONS---
---ERROR (Unspecified error code: 2)---
Error {
    context: "Failed to build request",
    source: "Failed to auth - system_default strategy did not resolve successfully",
}
```

## Other info

### 1. Metadata Server Access Works
The test endpoint successfully retrieves tokens from the metadata server:

```typescript
// Metadata server checks
const metadataChecks = {
  'project-id': '/computeMetadata/v1/project/project-id',
  'service-account': '/computeMetadata/v1/instance/service-accounts/default/email',
  'token': '/computeMetadata/v1/instance/service-accounts/default/token'
};

for (const [key, path] of Object.entries(metadataChecks)) {
  const response = await fetch(`http://metadata.google.internal${path}`, {
    headers: { 'Metadata-Flavor': 'Google' }
  });
  result.metadata[key] = await response.text();
}
```

### 2. Direct Vertex AI Access Works so not a permissions issue

Using the token from the metadata server, direct API calls to Vertex AI succeed:

```typescript
const token = JSON.parse(result.metadata['token']).access_token;
const projectId = result.metadata['project-id'];
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-west1';

const response = await fetch(
  `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.0-flash-001:streamGenerateContent`, 
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [{ text: 'Hello' }]
      }]
    })
  }
);
```