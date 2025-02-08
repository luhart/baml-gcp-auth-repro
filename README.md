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
  --service-account 1004940581046-compute@developer.gserviceaccount.com \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=sematic-cloud,GOOGLE_CLOUD_LOCATION=us-west1" \
  --allow-unauthenticated
```