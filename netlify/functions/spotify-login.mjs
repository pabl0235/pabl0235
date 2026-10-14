import { randomBytes } from "node:crypto";

export default async () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  // 1. Check that the required configuration exists.
  if (!clientId || !redirectUri) {
    return new Response(
      "Spotify login is not configured.",
      { status: 500 }
    );
  }

  // 2. Generate a random value to protect the OAuth flow.
  const state = randomBytes(32).toString("hex");

  // 3. Build Spotify's authorization URL.
  const authUrl = new URL(
    "https://accounts.spotify.com/authorize"
  );

  authUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "user-top-read",
    state: state
  }).toString();

  // 4. Save the same state in a short-lived, HTTP-only cookie.
  const secureCookie = redirectUri.startsWith("https://")
    ? "; Secure"
    : "";

  const headers = new Headers();

  headers.set("Location", authUrl.toString());

  headers.set(
    "Set-Cookie",
    `spotify_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600${secureCookie}`
  );

  // 5. Redirect the browser to Spotify.
  return new Response(null, {
    status: 302,
    headers
  });
};