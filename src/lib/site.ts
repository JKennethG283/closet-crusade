// Server-only: SITE_URL overrides (e.g. a custom domain); otherwise Vercel's own production address.
// Used for absolute links in page metadata. Not a secret, but there's no reason to ship it to the browser.
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return undefined;
}

export const site = {
  name: "Closet Crusade",
  url: siteUrl(),
  tagline: "Design-first second-hand fashion.",
  instagramHandle: "closetcrusade",
  instagramUrl: "https://www.instagram.com/closetcrusade",
  instagramDmUrl: "https://ig.me/m/closetcrusade",
  carousellHandle: "closetcrusade",
  carousellUrl: "https://carousell.app.link/SkbgSmfox7b",
};
