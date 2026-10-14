import { timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

function redirectToMusic(request, status) {
  const destination = new URL("/#music", request.url);
  destination.searchParams.set("spotify", status);

  const secureCookie = destination.protocol === "https:"
    ? "; Secure"
    : "";

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
      "Set-Cookie":
        `spotify_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureCookie}`
    }
  });
}

function statesMatch(receivedState, cookieState) {
  if (!receivedState || !cookieState) {
    return false;
  }

  const received = Buffer.from(receivedState);
  const cookie = Buffer.from(cookieState);

  return (
    received.length === cookie.length &&
    timingSafeEqual(received, cookie)
  );
}

export default async (request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const spotifyError = url.searchParams.get("error");

  const cookieHeader = request.headers.get("cookie") ?? "";

  const stateCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) =>
      cookie.startsWith("spotify_oauth_state=")
    );

  const cookieState = stateCookie
    ? stateCookie.slice("spotify_oauth_state=".length)
    : null;

  // 1. Validate the state before trusting the callback.
  if (!statesMatch(returnedState, cookieState)) {
    return new Response("Invalid OAuth state. Please try again.", {
      status: 400
    });
  }

  // 2. Handle a user declining authorization.
  if (spotifyError) {
    return redirectToMusic(request, "denied");
  }

  if (!code) {
    return new Response("Missing authorization code.", {
      status: 400
    });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response("Spotify is not configured.", {
      status: 500
    });
  }

  try {
    // 3. Exchange the authorization code for tokens.
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
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri
        })
      }
    );

    if (!tokenResponse.ok) {
      // Don't return Spotify's raw response or credentials to the browser.
      console.error(
        "Spotify token exchange failed:",
        tokenResponse.status
      );

      return new Response(
        "Spotify authorization failed. Please try again.",
        { status: 502 }
      );
    }

    const tokens = await tokenResponse.json();

    if (!tokens.refresh_token) {
      return new Response(
        "Spotify did not return a refresh token. Please reconnect.",
        { status: 502 }
      );
    }

    // 4. Persist the refresh token on the server.
    const store = getStore("spotify-private");

    await store.set("refresh-token", tokens.refresh_token);

    // 5. Return to the portfolio without exposing the tokens.
    return redirectToMusic(request, "connected");
  } catch (error) {
    console.error(
      "Spotify callback failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return new Response(
      "An unexpected error occurred during Spotify authorization.",
      { status: 500 }
    );
  }
};