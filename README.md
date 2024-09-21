# NYT Cooking Top 50 Recipe Comments Scraper

This project is a Deno-based script that scrapes the "most helpful" comments from New York Times Cooking's top 50 recipes and saves them as CSV files. These recipes are part of "Our 50 Greatest Hits, According to You" collection, which was compiled for the 10th anniversary of NYT Cooking. The collection includes recipes that have received five-star ratings, topped charts, gone viral, and sparked lively discussions in the comments section.

The full list of these top 50 recipes can be found [here](https://cooking.nytimes.com/68861692-nyt-cooking/118176098-best-nyt-cooking-recipes).

## Features

- Fetches the "most helpful" comments for the predefined list of NYT Cooking's top 50 recipe URLs
- Focuses on sampling the most relevant comments as determined by NYT Cooking's readers
- Handles pagination to retrieve all "most helpful" comments for each recipe
- Parses comment data and saves it in CSV format
- Implements rate limiting to avoid overwhelming the NYT API

## Note on Data Sampling

This script specifically retrieves comments labeled as "most helpful" by NYT Cooking. This approach provides a focused sample of user feedback, capturing the most impactful or relevant comments for each recipe. While this doesn't include all comments, it offers a curated selection that represents the community's most valued insights and experiences with each recipe.

## Requirements

- Deno runtime

## Installation

### Installing Deno

1. **macOS or Linux:**
   Open a terminal and run:
   ```
   curl -fsSL https://deno.land/x/install/install.sh | sh
   ```

2. **Windows:**
   Open PowerShell and run:
   ```
   iwr https://deno.land/x/install/install.ps1 -useb | iex
   ```

3. **Using package managers:**
   - Homebrew (macOS):
     ```
     brew install deno
     ```
   - Chocolatey (Windows):
     ```
     choco install deno
     ```

After installation, restart your terminal or command prompt.

Verify the installation by running:
```
deno --version
```

## Usage

1. Clone the repository
2. Run the script using the predefined Deno task:
```
deno task fetch
```

This command uses the task defined in `deno.json`, which is equivalent to running:
```
deno run -A main.ts
```

The script will create a separate CSV file for each recipe, named `comments_[recipeId].csv`.

## File Structure

- `main.ts`: The main script containing all the logic
- `deno.json`: Configuration file for Deno tasks and settings
- `README.md`: This file

## Note

This script is for educational purposes only. Please respect the New York Times' terms of service and use their official API for production purposes.