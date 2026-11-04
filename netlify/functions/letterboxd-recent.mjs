
import Parser from "rss-parser";

const parser = new Parser();

export default async () => {
  try {
    const feed = await parser.parseURL(
      "https://letterboxd.com/pabl0235/rss/"
    );

    const movies = feed.items.slice(0, 5).map((item) => {
      // Letterboxd often includes poster images in its RSS HTML.
      const html = item.content || item.contentSnippet || "";
      const imageMatch = html.match(
        /<img[^>]+src=["']([^"']+)["']/i
      );

      return {
        title: item.title || "Untitled movie",
        link: item.link || null,
        date: item.pubDate || null,
        description: item.contentSnippet || "",
        image: imageMatch ? imageMatch[1] : null
      };
    });

    return Response.json(
      { movies },
      {
        headers: {
          "Cache-Control": "public, max-age=3600"
        }
      }
    );

  } catch (error) {
    console.error(
      "Letterboxd feed error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return Response.json(
      { error: "Could not retrieve recent Letterboxd movies." },
      { status: 502 }
    );
  }
};
