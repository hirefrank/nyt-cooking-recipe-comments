import { config } from "dotenv";
import { OpenAI } from "openai";
import { parse } from "@std/csv/parse";

// Load environment variables from .env file
await config({ export: true });

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const model = "gpt-4o-mini";

// Load CSV file
const inputFilePath = './cleaned_recipe_comments.csv'; // Change to your CSV file path
const outputFilePath = './analysis/classified_recipe_comments.csv'; // Output file for results

async function classifyComment(commentBody: string) {
  const prompt = `Classify the following recipe comment into one or more of the following themes:
    1. Personalization and Adaptability
    2. Health-Conscious Cooking
    3. Community Engagement
    4. Cultural Awareness
    5. Recipe Evolution

    Comment: "${commentBody}"

    Respond with the relevant theme numbers as a comma-separated list if more than one theme applies.`;

  const response = await openai.chat.completions.create({
    model: model,
    max_tokens: 5000,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  const classification = response.choices[0].message.content || "";
  return classification.trim();
}

// Define the structure of our CSV row
interface CommentRow {
  CommentID: string;
  UserDisplayName: string;
  CommentBody: string;
  CreateDate: string;
  Recommendations: string;
  RecipeID: string;
}

async function classifyComments() {
  const csvContent = await Deno.readTextFile(inputFilePath);
  const csvData = parse(csvContent, {
    skipFirstRow: true,
    separator: "||",
    columns: ["CommentID", "UserDisplayName", "CommentBody", "CreateDate", "Recommendations", "RecipeID"],
  }) as CommentRow[];

  const classifiedData = [];
  for (const row of csvData) {
    if (row.CommentBody && row.CommentBody.trim() !== "") {
      const classification = await classifyComment(row.CommentBody);
      classifiedData.push([
        row.CommentID,
        row.RecipeID,
        classification
      ]);
      console.log(`Classified comment ID ${row.CommentID} with themes: ${classification}`);
    } else {
      console.warn(`Skipping empty comment for ID ${row.CommentID}`);
    }
  }

  const content = [
    ["CommentID", "RecipeID", "Classification"],
    ...classifiedData
  ];

  await Deno.writeTextFile(outputFilePath, content.map(row => row.join("||")).join("\n"));
}

// Call the function without a limit
await classifyComments();
console.log("Recipe comment classification completed.");