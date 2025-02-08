# BAML GCP AUTH Issues :( Using Vertex AI


### This works

Locally with `gcloud auth application-default login`  

```bash
bun install && bun run baml-generate && bun run dev
```

### This doesn't work

```bash
gcloud run deploy baml-vertex \
  --source . \
  --region us-west1 \
  --platform managed \
  --service-account $SERVICE_ACCOUNT \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT,GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION" \
  --allow-unauthenticated
```