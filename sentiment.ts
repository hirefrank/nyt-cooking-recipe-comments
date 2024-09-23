interface Comment {
  CommentID: string;
  UserDisplayName: string;
  CommentBody: string;
  CreateDate: string;
  Recommendations: string;
  RecipeID: string;
}

// A simple lexicon of positive and negative words
const positiveWords = new Set(['delicious', 'great', 'love', 'amazing', 'excellent', 'perfect', 'best', 'fantastic']);
const negativeWords = new Set(['bad', 'terrible', 'awful', 'worst', 'disappointing', 'bland', 'mediocre']);

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const words = text.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach(word => {
    if (positiveWords.has(word)) score++;
    if (negativeWords.has(word)) score--;
  });

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

function parseCSV(content: string): Comment[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    const comment: Partial<Comment> = {};
    headers.forEach((header, index) => {
      comment[header as keyof Comment] = values[index];
    });
    return comment as Comment;
  });
}

async function main() {
  const content = await Deno.readTextFile("cleaned_recipe_comments.csv");
  const comments = parseCSV(content);

  const sentiments = comments.map(comment => ({
    RecipeID: comment.RecipeID,
    Sentiment: analyzeSentiment(comment.CommentBody),
  }));

  const sentimentCounts = sentiments.reduce((acc, {RecipeID, Sentiment}) => {
    if (!acc[RecipeID]) acc[RecipeID] = {positive: 0, negative: 0, neutral: 0};
    acc[RecipeID][Sentiment]++;
    return acc;
  }, {} as Record<string, {positive: number, negative: number, neutral: number}>);

  console.log("Sentiment Analysis Results:");
  Object.entries(sentimentCounts).forEach(([recipeID, counts]) => {
    console.log(`\nRecipe ${recipeID}:`);
    console.log(`Positive: ${counts.positive}`);
    console.log(`Negative: ${counts.negative}`);
    console.log(`Neutral: ${counts.neutral}`);
  });
}

main();
