import { fetch } from "bun";
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { b } from "./baml_client";

// Placeholder for baml function
async function testBaml() {
  const result = b.ExtractPerson(
    "My name is John Doe and I am 30 years old."
  );
  return result;
}

const app = new Elysia()
  .use(swagger({ path: "/docs" }))
  .use(cors())
  // This works locally auth'd with `gcloud auth application-default login`
  // .post("/test-local/baml", async () => {
  //   try {
  //     const result = await testBaml();
  //     return { result, success: true };
  //   } catch (error) {
  //     return { error, success: false };
  //   }
  // })
  .post("/test-gcp/baml", async () => {
    const debug = { metadata: {} };
    let vertexResponse;
    let result;
    try {
      // // Metadata server checks
      // const metadataChecks = {
      //   'project-id': '/computeMetadata/v1/project/project-id',
      //   'service-account': '/computeMetadata/v1/instance/service-accounts/default/email',
      //   'token': '/computeMetadata/v1/instance/service-accounts/default/token'
      // };

      // interface MetadataResponse {
      //   [key: string]: string;
      // }

      // const metadata: MetadataResponse = {};

      // for (const [key, path] of Object.entries(metadataChecks)) {
      //   const response = await fetch(`http://metadata.google.internal${path}`, {
      //     headers: { 'Metadata-Flavor': 'Google' }
      //   });
      //   metadata[key] = await response.text();
      //   debug.metadata = metadata;
      // }

      // // Test direct Vertex AI access
      // interface TokenResponse {
      //   access_token: string;
      // }
      // const tokenData = JSON.parse(metadata['token']) as TokenResponse;
      // const token = tokenData.access_token;
      // const projectId = metadata['project-id'];
      // const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-west1';
      
      // const response = await fetch(
      //   `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-2.0-flash-001:streamGenerateContent`, 
      //   {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({
      //       contents: [{
      //         role: 'user',
      //         parts: [{ text: 'Hello, how are you?' }]
      //       }]
      //     })
      //   }
      // );

      // vertexResponse = await response.json();
      
      // Test BAML Vertex AI Client
      result = await testBaml();
      return { result, vertexResponse, success: true };
    } catch (error) {
      return { error, debug, success: false, result, vertexResponse };
    }
  })
  .listen(8080);

console.log(`running at ${app.server?.hostname}:${app.server?.port}`);
