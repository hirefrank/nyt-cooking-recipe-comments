const recipeUrls = [
  "https://cooking.nytimes.com/recipes/1021277-sheet-pan-baked-feta-with-broccolini-tomatoes-and-lemon",
  "https://cooking.nytimes.com/recipes/1017359-sheet-pan-chicken-with-potatoes-arugula-and-garlic-yogurt",
  "https://cooking.nytimes.com/recipes/6648-dutch-baby",
  "https://cooking.nytimes.com/recipes/1018731-buttermilk-brined-roast-chicken",
  "https://cooking.nytimes.com/recipes/1014721-shakshuka-with-feta",
  "https://cooking.nytimes.com/recipes/4735-old-fashioned-beef-stew",
  "https://cooking.nytimes.com/recipes/11376-no-knead-bread",
  "https://cooking.nytimes.com/recipes/1016062-red-lentil-soup",
  "https://cooking.nytimes.com/recipes/1020288-jollof-rice",
  "https://cooking.nytimes.com/recipes/1021174-strawberry-spoon-cake",
  "https://cooking.nytimes.com/recipes/3783-original-plum-torte",
  "https://cooking.nytimes.com/recipes/1017577-best-gazpacho",
  "https://cooking.nytimes.com/recipes/1024066-gochujang-buttered-noodles",
  "https://cooking.nytimes.com/recipes/12197-momofukus-bo-ssam",
  "https://cooking.nytimes.com/recipes/1015819-chocolate-chip-cookies",
  "https://cooking.nytimes.com/recipes/1022131-sheet-pan-bibimbap",
  "https://cooking.nytimes.com/recipes/1023609-chile-crisp-fettuccine-alfredo-with-spinach",
  "https://cooking.nytimes.com/recipes/1024075-dumpling-tomato-salad-with-chile-crisp-vinaigrette",
  "https://cooking.nytimes.com/recipes/1022129-coconut-fish-and-tomato-bake",
  "https://cooking.nytimes.com/recipes/1020045-coconut-miso-salmon-curry",
  "https://cooking.nytimes.com/recipes/1020828-lemony-shrimp-and-bean-stew",
  "https://cooking.nytimes.com/recipes/1020453-crisp-gnocchi-with-brussels-sprouts-and-brown-butter",
  "https://cooking.nytimes.com/recipes/1020330-shrimp-scampi-with-orzo",
  "https://cooking.nytimes.com/recipes/1020830-caramelized-shallot-pasta",
  "https://cooking.nytimes.com/recipes/1023012-san-francisco-style-vietnamese-american-garlic-noodles",
  "https://cooking.nytimes.com/recipes/1020583-pork-chops-in-lemon-caper-sauce",
  "https://cooking.nytimes.com/recipes/1020515-southern-macaroni-and-cheese",
  "https://cooking.nytimes.com/recipes/1023047-sticky-coconut-chicken-and-rice",
  "https://cooking.nytimes.com/recipes/1017161-oven-roasted-chicken-shawarma",
  "https://cooking.nytimes.com/recipes/1020486-vinegar-chicken-with-crushed-olive-dressing",
  "https://cooking.nytimes.com/recipes/1021858-birria-de-res-beef-birria",
  "https://cooking.nytimes.com/recipes/1021931-extra-creamy-scrambled-eggs",
  "https://cooking.nytimes.com/recipes/1023675-gochujang-caramel-cookies",
  "https://cooking.nytimes.com/recipes/1024120-limonada-brazilian-lemonade",
  "https://cooking.nytimes.com/recipes/1024325-tinto-de-verano",
  "https://cooking.nytimes.com/recipes/1017937-mississippi-roast",
  "https://cooking.nytimes.com/recipes/1020107-french-onion-grilled-cheese",
  "https://cooking.nytimes.com/recipes/1021031-the-big-lasagna",
  "https://cooking.nytimes.com/recipes/1017724-cheesy-hasselback-potato-gratin",
  "https://cooking.nytimes.com/recipes/1020631-thai-inspired-chicken-meatball-soup",
  "https://cooking.nytimes.com/recipes/1020572-creamy-double-garlic-mashed-potatoes",
  "https://cooking.nytimes.com/recipes/1008-guacamole",
  "https://cooking.nytimes.com/recipes/1024503-marry-me-chicken",
  "https://cooking.nytimes.com/recipes/1024985-black-sesame-rice-krispies-treats",
  "https://cooking.nytimes.com/recipes/1019957-chocolate-lava-cake-for-two",
  "https://cooking.nytimes.com/recipes/10782-katharine-hepburns-brownies",
  "https://cooking.nytimes.com/recipes/1017817-cranberry-curd-tart",
  "https://cooking.nytimes.com/recipes/1022053-croissants",
  "https://cooking.nytimes.com/recipes/1015181-marcella-hazans-bolognese-sauce",
  "https://cooking.nytimes.com/recipes/1018974-peruvian-roasted-chicken-with-spicy-cilantro-sauce",
];

// deno-lint-ignore no-explicit-any
async function fetchComments(url: string, offset: number): Promise<any> {
  const encodedUrl = encodeURIComponent(url);
  const apiUrl = `https://www.nytimes.com/svc/community/V3/requestHandler?cmd=GetCommentsReadersPicks&offset=${offset}&sort=reader&limit=15&url=${encodedUrl}&_=${Date.now()}`;

  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

// deno-lint-ignore no-explicit-any
function parseComments(comments: any[]): string[][] {
  return comments.map(comment => [
    comment.commentID,
    comment.userDisplayName,
    comment.commentBody.replace(/\n/g, ' '),
    comment.createDate,
    comment.recommendations
  ]);
}

async function saveCommentsAsCsv(comments: string[][], filename: string) {
  const csvContent = comments.map(row =>
    row.map(field => {
      if (typeof field === 'string') {
        return `"${field.replace(/"/g, '""')}"`;
      } else {
        return `"${String(field)}"`;
      }
    }).join(',')
  ).join('\n');
  try {
    await Deno.writeTextFile(filename, csvContent);
    console.log(`File ${filename} written successfully.`);
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
  }
}

async function processRecipe(url: string) {
  let offset = 0;
  let allComments: string[][] = [["CommentID", "UserDisplayName", "CommentBody", "CreateDate", "Recommendations"]];

  while (true) {
    const data = await fetchComments(url, offset);
    const comments = data.results.comments;

    if (comments.length === 0) {
      break;
    }

    const parsedComments = parseComments(comments);
    allComments = allComments.concat(parsedComments);
    offset += 15;

    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Extract the recipe number/id from the URL
  const recipeId = url.match(/\/(\d+)-/)?.[1] || 'unknown';
  const filename = `csvs/comments_${recipeId}.csv`;
  await saveCommentsAsCsv(allComments, filename);
  console.log(`Saved comments for ${url} to ${filename}`);
}

async function main() {
  console.log(`Number of URLs in the array: ${recipeUrls.length}`);

  for (const url of recipeUrls) {
    await processRecipe(url);
  }
}

main();