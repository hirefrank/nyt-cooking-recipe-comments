import { walk } from "@std/fs";
import { parse } from "@std/csv/parse";

interface Comment {
  CommentID: string;
  UserDisplayName: string;
  CommentBody: string;
  CreateDate: string;
  Recommendations: string;
  RecipeID: string;
}

function parseComment(record: string[]): Comment {
  return {
    CommentID: record[0] || "",
    UserDisplayName: record[1] || "",
    CommentBody: record[2] || "",
    CreateDate: record[3] || "",
    Recommendations: record[4] || "",
    RecipeID: "",  // We'll set this later based on the filename
  };
}

async function combineCSVs(directory: string): Promise<Comment[]> {
  const allComments: Comment[] = [];

  for await (const entry of walk(directory, { exts: [".csv"] })) {
    if (entry.isFile) {
      const content = await Deno.readTextFile(entry.path);
      const records = parse(content) as string[][];
      const recipeID = entry.name.split("_")[1].split(".")[0];

      // Skip the header row
      for (let i = 1; i < records.length; i++) {
        const comment = parseComment(records[i]);
        comment.RecipeID = recipeID;
        allComments.push(comment);
      }
    }
  }

  return allComments;
}

function parseDate(unixTimestamp: string): string {
  const timestamp = parseInt(unixTimestamp, 10);
  if (isNaN(timestamp)) {
    console.warn(`Invalid date encountered: ${unixTimestamp}`);
    return unixTimestamp; // Return the original string if parsing fails
  }

  // Convert Unix timestamp (seconds) to milliseconds and create a Date object
  const date = new Date(timestamp * 1000);

  // Return the ISO string
  return date.toISOString();
}

function cleanData(comments: Comment[]): Comment[] {
  return comments.map((comment) => ({
    ...comment,
    Recommendations: comment.Recommendations.replace(/[^0-9]/g, ""),
    CreateDate: parseDate(comment.CreateDate),
  }));
}

function basicAnalysis(comments: Comment[]) {
  const commentsPerRecipe: { [key: string]: number } = {};
  const recommendationsPerRecipe: { [key: string]: number[] } = {};
  const commenters: { [key: string]: number } = {};
  const commentLengths: number[] = [];

  comments.forEach((comment) => {
    // Comments per recipe
    commentsPerRecipe[comment.RecipeID] = (commentsPerRecipe[comment.RecipeID] || 0) + 1;

    // Recommendations per recipe
    if (!recommendationsPerRecipe[comment.RecipeID]) {
      recommendationsPerRecipe[comment.RecipeID] = [];
    }
    recommendationsPerRecipe[comment.RecipeID].push(Number(comment.Recommendations) || 0);

    // Most active commenters
    commenters[comment.UserDisplayName] = (commenters[comment.UserDisplayName] || 0) + 1;

    // Comment lengths
    commentLengths.push(comment.CommentBody.length);
  });

  const avgRecommendations = Object.entries(recommendationsPerRecipe).map(([recipeID, recs]) => ({
    recipeID,
    avgRecommendations: recs.reduce((a, b) => a + b, 0) / recs.length,
  }));

  return {
    commentsPerRecipe,
    avgRecommendations,
    topCommenters: Object.entries(commenters).sort((a, b) => b[1] - a[1]).slice(0, 10),
    commentLengthStats: {
      min: Math.min(...commentLengths),
      max: Math.max(...commentLengths),
      avg: commentLengths.reduce((a, b) => a + b, 0) / commentLengths.length,
    },
  };
}

async function main() {
  try {
    const comments = await combineCSVs("csvs");
    const cleanedComments = cleanData(comments);
    const analysis = basicAnalysis(cleanedComments);

    console.log("Top 5 Recipes by Number of Comments:");
    console.log(Object.entries(analysis.commentsPerRecipe).sort((a, b) => b[1] - a[1]).slice(0, 5));

    console.log("\nTop 5 Recipes by Average Recommendations:");
    console.log(analysis.avgRecommendations.sort((a, b) => b.avgRecommendations - a.avgRecommendations).slice(0, 5));

    console.log("\nTop 10 Most Active Commenters:");
    console.log(analysis.topCommenters);

    console.log("\nComment Length Statistics:");
    console.log(analysis.commentLengthStats);

    // Save the cleaned data for further analysis
    await Deno.writeTextFile("cleaned_recipe_comments.csv",
      ['CommentID,UserDisplayName,CommentBody,CreateDate,Recommendations,RecipeID']
        .concat(cleanedComments.map(c =>
          [
            c.CommentID,
            c.UserDisplayName,
            c.CommentBody,
            c.CreateDate,
            c.Recommendations,
            c.RecipeID
          ].map(field => `"${field.replace(/"/g, '""')}"`).join(',')
        )).join("\n")
    );
    console.log("\nCleaned data saved to 'cleaned_recipe_comments.csv'");
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

main();