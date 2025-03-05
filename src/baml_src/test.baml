
class Person {
  name string
  age int
}


function ExtractPerson(text_input: string) -> Person {
  // see clients.baml
  client GeminiClient

  // The prompt uses Jinja syntax. Change the models or this text and watch the prompt preview change!
  prompt #"
    Parse the following text and return a structured representation of the data in the schema below.

    Text:
    ---
    {{ text_input }}
    ---

    {# special macro to print the output instructions. #}
    {{ ctx.output_format }}

    JSON:
  "#
}

test Test1 {
  functions [ExtractPerson]
  args {
    text_input #"
      My name is John Doe and I am 30 years old.
    "#
  }
}