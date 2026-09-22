import { next } from "@vercel/functions";
import { MODES, parseDate, entryFor, longDate } from "./lib/quotes.js";

export const config = { matcher: "/" };

// Known link-unfurling crawlers used by chat apps and social platforms.
const BOT_UA = /facebookexternalhit|Twitterbot|Slackbot|TelegramBot|WhatsApp|LinkedInBot|Discordbot|SkypeUriPreview|redditbot|Pinterest|vkShare/i;

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function middleware(request) {
  const userAgent = request.headers.get("user-agent") || "";
  if (!BOT_UA.test(userAgent)) return next();

  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return next();

  const date = parseDate(dateParam);
  if (Number.isNaN(date.getTime())) return next();

  const modeParam = MODES[url.searchParams.get("mode")] ? url.searchParams.get("mode") : "motivation";
  const mode = MODES[modeParam];
  const entry = entryFor(date, modeParam);

  const title = escapeHtml(`${longDate(date)} — Motivation Calendar`);
  const description = escapeHtml(`"${entry.t}" — ${mode.credit(entry.a)}`);
  const pageUrl = escapeHtml(`${url.origin}/?date=${dateParam}&mode=${modeParam}`);
  const imageUrl = escapeHtml(`${url.origin}/api/og?date=${dateParam}&mode=${modeParam}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${pageUrl}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
</head>
<body>
<p>${description}</p>
<p><a href="${pageUrl}">Open Motivation Calendar</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
