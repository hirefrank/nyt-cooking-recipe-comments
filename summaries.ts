import { config } from "dotenv";
import { OpenAI } from "openai";
import { walk } from "@std/fs";
import { recipeMapping } from "./recipeMapping.ts";
// Load environment variables from .env file
await config({ export: true });

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY") || "",
});

const model = "gpt-4o-mini";
const csvFolder = "./csvs";
const outputFile = "summaries.md";

async function summarizeCSV(csvContent: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: model,
    max_tokens: 5000,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `You are an expert data analyst and culinary anthropologist. Your task is to analyze a large set of recipe comments from the New York Times Cooking website's top 50 recipes. These comments are from highly-rated recipes that have sparked engaging discussions among readers.

Here's the CSV data you'll be analyzing:
<csv_data>
${csvContent}
</csv_data>

The data is provided in CSV format with the following columns:
- CommentID: Unique identifier for each comment
- UserDisplayName: Name of the user who left the comment
- CommentBody: The full text of the comment
- CreateDate: The date the comment was created (in Unix timestamp format)
- Recommendations: The number of recommendations the comment received

Additionally, you have been provided with a mapping of RecipeID to RecipeTitle. Use this information to identify which recipe each comment is referring to. Here's the recipe mapping:

<recipe_mapping>
${recipeMapping}
</recipe_mapping>

Analyze the following aspects of the comments, taking into account the specific recipes they refer to:

1. Culinary Trends
2. Dietary Patterns
3. User Behavior and Engagement
4. Recipe Evolution
5. Societal Reflections
6. Generational Insights
7. Ingredient and Equipment Trends
8. Seasonal and Occasion-based Patterns

For each point of analysis, provide:

- A concise summary of the trend or insight
- At least one specific example or quote from the comments (you can paraphrase if necessary)
- The title of the recipe the comment refers to
- A brief explanation of why this trend or insight is significant in the broader context of culinary culture

Important: Always include the recipe title when discussing specific comments or trends. Format it like this: [Recipe Title]. For example: "In comments for [Katharine Hepburn's Brownies], users frequently mention..."

Your analysis should be engaging and insightful, suitable for a food-enthusiast audience interested in both cooking and cultural trends. When referencing dates, please convert the Unix timestamps to readable dates for clarity.

Additionally, try to draw connections between different recipes and identify any overarching trends or insights that span multiple recipes. When doing so, mention all relevant recipe titles.

Structure your response as follows:

1. Overall Trends: Provide a brief overview of the major trends you've identified across all recipes.

2. Recipe-Specific Insights: For each of the 8 analysis points, provide insights that are specific to individual recipes. Include at least 3-5 different recipes in your analysis, ensuring you cover a range of dish types (e.g., main courses, desserts, breakfast items).

3. Cross-Recipe Analysis: Discuss any interesting comparisons or contrasts you've found between different recipes. For example, how user behavior differs between simple and complex recipes, or how dietary trends affect different types of dishes.

4. Conclusion: Summarize the most significant findings and their implications for home cooking trends.

Remember to always mention the specific recipe titles when discussing trends or quoting comments. Present your analysis in a clear, well-organized manner, using appropriate headings and subheadings to structure your response.

Begin your analysis now, presenting your findings in the structure outlined above. Use markdown formatting for your response, including appropriate headers, lists, and emphasis where needed.`
      }
    ]
  });

  return response.choices[0].message.content || "";
}

async function processCSVFiles() {
  let summaries = "# Recipe Comment Analysis\n\n";
  const limit = parseInt(Deno.env.get("LIMIT") || "Infinity");
  let processedCount = 0;

  for await (const entry of walk(csvFolder, { exts: [".csv"] })) {
    if (processedCount >= limit) break;

    const csvContent = await Deno.readTextFile(entry.path);
    const summary = await summarizeCSV(csvContent);
    summaries += `## File: ${entry.name}\n\n${summary}\n\n---\n\n`;

    processedCount++;
  }

  await Deno.writeTextFile(outputFile, summaries);
  console.log(`Summaries saved to ${outputFile}`);
  console.log(`Processed ${processedCount} file(s)`);
}

await processCSVFiles();