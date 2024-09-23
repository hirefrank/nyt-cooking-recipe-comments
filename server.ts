import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

interface Comment {
  CommentID: string;
  UserDisplayName: string;
  CommentBody: string;
  CreateDate: string;
  Recommendations: string;
  RecipeID: string;
}

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Recipe Comments Visualization</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <canvas id="commentsChart" width="800" height="400"></canvas>
    <script>
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            new Chart(document.getElementById('commentsChart'), {
                type: 'bar',
                data: {
                    labels: data.map(d => d.RecipeID),
                    datasets: [{
                        label: '# of Comments',
                        data: data.map(d => d.CommentCount),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)'
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Comments per Recipe'
                    }
                }
            });
        });
    </script>
</body>
</html>
`;

function parseCSV(content: string): Comment[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).filter(line => line.trim() !== '').map(line => {
    const values = line.split(',');
    const comment: Partial<Comment> = {};
    headers.forEach((header, index) => {
      comment[header.trim() as keyof Comment] = values[index]?.trim() ?? '';
    });
    return comment as Comment;
  });
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === "/") {
    return new Response(html, {
      headers: { "content-type": "text/html" },
    });
  } else if (url.pathname === "/data") {
    const content = await Deno.readTextFile("cleaned_recipe_comments.csv");
    const comments = parseCSV(content);

    const commentCounts = comments.reduce((acc, comment) => {
      const recipeID = comment.RecipeID;
      acc[recipeID] = (acc[recipeID] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(commentCounts).map(([RecipeID, CommentCount]) => ({
      RecipeID,
      CommentCount,
    }));

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  } else {
    return new Response("Not Found", { status: 404 });
  }
}

console.log("Server running on http://localhost:8000");
await serve(handler, { port: 8000 });