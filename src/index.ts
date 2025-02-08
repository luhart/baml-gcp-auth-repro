import { fetch } from "bun";
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { b } from "./baml_client";

// Placeholder for baml function
async function testBaml() {
  const result = await b.ExtractResume(
    "John Doe\n\nEducation\n- University of California, Berkeley\n  - B.S. in Computer Science\n  - 2020\n\nSkills\n- Python\n- Java\n- C++"
  );
  return result;
}

const app = new Elysia()
  .use(swagger({ path: "/docs" }))
  .use(cors())
  .post("/test-local/baml", async () => {
    try {
      const result = await testBaml();
      return { result, success: true };
    } catch (error) {
      return { error, success: false };
    }
  })
  .post("/test-gcp/baml", async () => {
    const debug = { metadata: {} };
    try {
      // Metadata server checks
      const metadataChecks = {
        'project-id': '/computeMetadata/v1/project/project-id',
        'service-account': '/computeMetadata/v1/instance/service-accounts/default/email',
        'token': '/computeMetadata/v1/instance/service-accounts/default/token'
      };

      interface MetadataResponse {
        [key: string]: string;
      }

      const metadata: MetadataResponse = {};

      for (const [key, path] of Object.entries(metadataChecks)) {
        const response = await fetch(`http://metadata.google.internal${path}`, {
          headers: { 'Metadata-Flavor': 'Google' }
        });
        metadata[key] = await response.text();
        debug.metadata = metadata;
      }

      // Test direct Vertex AI access
      interface TokenResponse {
        access_token: string;
      }
      const tokenData = JSON.parse(metadata['token']) as TokenResponse;
      const token = tokenData.access_token;
      const projectId = metadata['project-id'];
      const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-west1';
      
      // Test Vertex AI (No BAML)
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

      const vertexResponse = await response.json();
      
      // Test BAML Vertex AI Client
      const result = await testBaml();
      return { result, vertexResponse, success: true };
    } catch (error) {
      return { error, debug, success: false };
    }
  })
  .listen(8080);

console.log(`running at ${app.server?.hostname}:${app.server?.port}`);
