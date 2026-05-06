const {
  SPOTIFY_CLIENT_ID: client_id,
  SPOTIFY_CLIENT_SECRET: client_secret,
  SPOTIFY_REFRESH_TOKEN: refresh_token,
} = process.env;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const Authorization = `Basic ${basic}`;

async function getAuthorizationToken() {
  const url = new URL("https://accounts.spotify.com/api/token");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refresh_token ?? "",
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await response.json();

  if (!data.access_token) {
    throw new Error(`Spotify token refresh failed: ${JSON.stringify(data)}`);
  }

  return `Bearer ${data.access_token}`;
}

const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

export async function nowPlaying() {
  try {
    const Authorization = await getAuthorizationToken();
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization },
    });
    const { status } = response;
    if (status === 204) {
      return {};
    } else if (status === 200) {
      return await response.json();
    }
    return {};
  } catch (e) {
    console.error("nowPlaying error:", e);
    return {};
  }
}
