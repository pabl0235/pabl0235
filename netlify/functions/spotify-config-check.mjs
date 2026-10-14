export default async () => {
  const clientIdConfigured =
    Boolean(process.env.SPOTIFY_CLIENT_ID);

  const clientSecretConfigured =
    Boolean(process.env.SPOTIFY_CLIENT_SECRET);

  return Response.json({
    clientIdConfigured,
    clientSecretConfigured
  });
};