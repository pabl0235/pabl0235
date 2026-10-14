import { getStore } from "@netlify/blobs";

export default async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "Spotify is not configured." },
      { status: 500 }
    );
  }

  try {
    // 1. Retrieve the refresh token from private server-side storage.
    const store = getStore("spotify-private");
    const refreshToken = await store.get("refresh-token");

    if (!refreshToken) {
      return Response.json(
        { error: "Spotify is not connected. Please connect Spotify first." },
        { status: 401 }
      );
    }

    // 2. Exchange the refresh token for an access token.
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken
        })
      }
    );

    if (!tokenResponse.ok) {
      console.error(
        "Spotify token refresh failed:",
        tokenResponse.status
      );

      return Response.json(
        { error: "Could not refresh Spotify access. Please reconnect." },
        { status: 502 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return Response.json(
        { error: "Spotify did not return an access token." },
        { status: 502 }
      );
    }

    // Save a rotated refresh token if Spotify provides one.
    if (tokenData.refresh_token) {
      await store.set("refresh-token", tokenData.refresh_token);
    }

    // 3. Request the user's top 10 tracks.
    const tracksUrl = new URL(
      "https://api.spotify.com/v1/me/top/tracks"
    );

    tracksUrl.search = new URLSearchParams({
      limit: "10",
      time_range: "short_term"
    }).toString();

    const tracksResponse = await fetch(tracksUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!tracksResponse.ok) {
      console.error(
        "Spotify top tracks request failed:",
        tracksResponse.status
      );

      return Response.json(
        { error: "Could not retrieve top tracks from Spotify." },
        { status: tracksResponse.status === 429 ? 429 : 502 }
      );
    }

    const tracksData = await tracksResponse.json();

    // 4. Return only the fields our portfolio needs.
    const tracks = tracksData.items.map((track, index) => ({
      rank: index + 1,
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: track.album.name,
      image: track.album.images?.[0]?.url ?? null,
      spotifyUrl: track.external_urls?.spotify ?? null
    }));

    return Response.json(
      {
        timeRange: "short_term",
        description: "Spotify top tracks, approximately the last 4 weeks",
        tracks
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error(
      "Top tracks function failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return Response.json(
      { error: "An unexpected error occurred while retrieving top tracks." },
      { status: 500 }
    );
  }
};