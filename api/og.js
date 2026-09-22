import { ImageResponse } from "@vercel/og";
import { MODES, MONTHS, WEEKDAYS, parseDate, entryFor } from "../lib/quotes.js";

export const config = { runtime: "edge" };

const div = (style, children) => ({ type: "div", props: { style, children } });

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const modeName = MODES[searchParams.get("mode")] ? searchParams.get("mode") : "motivation";
  const date = parseDate(searchParams.get("date"));
  const mode = MODES[modeName];
  const entry = entryFor(date, modeName);
  const dateStr = `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  return new ImageResponse(
    div(
      {
        position: "relative",
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#14213d",
        color: "#f2f4f8",
        fontFamily: "sans-serif"
      },
      [
        div({ display: "flex", fontSize: 28, fontWeight: 600, color: "#ffcf33", letterSpacing: "-0.01em" }, [dateStr]),
        div(
          { display: "flex", fontSize: 52, fontWeight: 600, lineHeight: 1.3, marginTop: "28px", maxWidth: "980px" },
          [`“${entry.t}”`]
        ),
        div({ display: "flex", fontSize: 28, color: "#9aa6c4", marginTop: "32px" }, [`— ${mode.credit(entry.a)}`]),
        div(
          { display: "flex", position: "absolute", right: "60px", bottom: "48px", fontSize: 22, color: "#6b7691" },
          ["Motivation Calendar"]
        )
      ]
    ),
    { width: 1200, height: 630 }
  );
}
