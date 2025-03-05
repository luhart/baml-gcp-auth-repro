// Learn more about clients at https://docs.boundaryml.com/docs/snippets/clients/overview

// Custom OpenAI-generic client for Moondream
// client<llm> MoondreamClient {
//   provider "openai-generic"
//   options {
//     base_url "https://api.moondream.ai/v1"
//     model "moondream-2B"
//     api_key env.MOONDREAM_API_KEY
//     supports_streaming false
//   }
// }

client<llm> GeminiClient {
  provider vertex-ai
  options {
    model "gemini-2.0-flash"
    location us-west1
  }
}

