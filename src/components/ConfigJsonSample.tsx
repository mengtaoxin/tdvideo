import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const INDENT = "  ";

type TokenKind = "punct" | "key" | "string" | "number" | "boolean" | "fold";
type Token = { kind: TokenKind; text: string };
type FieldTag = "required" | "optional";
type SampleLineSpec = { depth: number; tokens: Token[]; noteKey?: string; tag?: FieldTag };
type SampleLine = SampleLineSpec & { number: number };

const TOKEN_COLOR: Record<TokenKind, string> = {
  punct: "text.secondary",
  key: "info.main",
  string: "warning.dark",
  number: "success.dark",
  boolean: "success.dark",
  fold: "text.disabled",
};

const punct = (text: string): Token => ({ kind: "punct", text });
const key = (name: string): Token => ({ kind: "key", text: `"${name}"` });
const note = (name: string) => `home.sample.notes.${name}`;

function field(
  depth: number,
  name: string,
  value: string | number | boolean,
  options: { noteKey?: string; tag?: FieldTag; last?: boolean } = {},
): SampleLineSpec {
  let valueToken: Token;
  if (typeof value === "number") {
    valueToken = { kind: "number", text: String(value) };
  } else if (typeof value === "boolean") {
    valueToken = { kind: "boolean", text: String(value) };
  } else {
    valueToken = { kind: "string", text: `"${value}"` };
  }
  return {
    depth,
    tokens: [key(name), punct(": "), valueToken, ...(options.last ? [] : [punct(",")])],
    noteKey: options.noteKey,
    tag: options.tag,
  };
}

const SAMPLE_LINE_SPECS: SampleLineSpec[] = [
  { depth: 0, tokens: [punct("{")] },
  {
    depth: 1,
    tokens: [key("videos"), punct(": [")],
    noteKey: note("videos"),
    tag: "required",
  },
  { depth: 2, tokens: [punct("{")] },
  field(3, "id", "big-buck-bunny", { noteKey: note("id"), tag: "required" }),
  field(3, "title", "Big Buck Bunny", { noteKey: note("title"), tag: "required" }),
  field(3, "url", "https://…/video.mp4", { noteKey: note("url"), tag: "required" }),
  field(3, "poster-url", "https://…/poster.jpg", { noteKey: note("posterUrl"), tag: "optional" }),
  field(3, "autoDisplaySubtitles", true, {
    noteKey: note("autoDisplaySubtitles"),
    tag: "optional",
  }),
  {
    depth: 3,
    tokens: [key("subtitles"), punct(": [")],
    noteKey: note("subtitles"),
    tag: "optional",
  },
  { depth: 4, tokens: [punct("{")] },
  field(5, "id", "en", { noteKey: note("subtitleId"), tag: "required" }),
  field(5, "title", "English", { noteKey: note("subtitleTitle"), tag: "required" }),
  field(5, "url", "/subs/en.vtt", { noteKey: note("subtitleUrl"), tag: "required" }),
  field(5, "language", "en", { noteKey: note("subtitleLanguage"), tag: "optional" }),
  field(5, "default", true, { noteKey: note("subtitleDefault"), tag: "optional", last: true }),
  { depth: 4, tokens: [punct("},")] },
  { depth: 4, tokens: [{ kind: "fold", text: "{ … }" }], noteKey: note("moreSubtitles") },
  { depth: 3, tokens: [punct("],")] },
  {
    depth: 3,
    tokens: [key("bullet-comments"), punct(": [")],
    noteKey: note("bulletComments"),
    tag: "optional",
  },
  { depth: 4, tokens: [punct("{")] },
  field(5, "id", "demo", { noteKey: note("bulletId"), tag: "required" }),
  field(5, "title", "Demo bullets", { noteKey: note("bulletTitle"), tag: "required" }),
  field(5, "url", "/bullets.json", { noteKey: note("bulletUrl"), tag: "required", last: true }),
  { depth: 4, tokens: [punct("}")] },
  { depth: 3, tokens: [punct("]")] },
  { depth: 2, tokens: [punct("},")] },
  { depth: 2, tokens: [{ kind: "fold", text: "{ … }" }], noteKey: note("moreVideos") },
  { depth: 1, tokens: [punct("],")] },
  {
    depth: 1,
    tokens: [key("playlists"), punct(": [")],
    noteKey: note("playlists"),
    tag: "optional",
  },
  { depth: 2, tokens: [punct("{")] },
  field(3, "id", "demo-playlist", { noteKey: note("playlistId"), tag: "required" }),
  field(3, "title", "Demo playlist", { noteKey: note("playlistTitle"), tag: "required" }),
  field(3, "poster-url", "https://…/list.jpg", {
    noteKey: note("playlistPosterUrl"),
    tag: "optional",
  }),
  { depth: 3, tokens: [key("videos"), punct(": [")], noteKey: note("playlistVideos") },
  {
    depth: 4,
    tokens: [{ kind: "string", text: '"big-buck-bunny"' }, punct(",")],
  },
  { depth: 4, tokens: [{ kind: "fold", text: "…" }] },
  { depth: 3, tokens: [punct("]")] },
  { depth: 2, tokens: [punct("},")] },
  { depth: 2, tokens: [{ kind: "fold", text: "{ … }" }], noteKey: note("morePlaylists") },
  { depth: 1, tokens: [punct("]")] },
  { depth: 0, tokens: [punct("}")] },
];

const SAMPLE_LINES: SampleLine[] = SAMPLE_LINE_SPECS.map((spec, index) => ({
  ...spec,
  number: index + 1,
}));

/** Renders at most one `…` elision as a muted pill. */
function StringToken({ text }: { text: string }) {
  const [before, after] = text.split("…");
  return (
    <Box component="span" sx={{ color: TOKEN_COLOR.string }}>
      {before}
      {after !== undefined && (
        <>
          <Box
            component="span"
            sx={{
              color: "text.disabled",
              mx: 0.25,
              px: 0.5,
              borderRadius: 0.5,
              bgcolor: "action.hover",
            }}
          >
            …
          </Box>
          {after}
        </>
      )}
    </Box>
  );
}

function CodeToken({ token }: { token: Token }) {
  switch (token.kind) {
    case "key":
      return (
        <Box component="span" className="json-key" sx={{ color: TOKEN_COLOR.key }}>
          {token.text}
        </Box>
      );
    case "string":
      return <StringToken text={token.text} />;
    case "fold":
      return (
        <Box
          component="span"
          sx={{
            color: TOKEN_COLOR.fold,
            px: 0.75,
            border: "1px dashed",
            borderColor: "text.disabled",
            borderRadius: 1,
          }}
        >
          {token.text}
        </Box>
      );
    default:
      return (
        <Box component="span" sx={{ color: TOKEN_COLOR[token.kind] }}>
          {token.text}
        </Box>
      );
  }
}

function TagLabel({ tag }: { tag: FieldTag }) {
  const { t } = useTranslation();
  const required = tag === "required";
  return (
    <Box
      component="span"
      sx={{
        flexShrink: 0,
        px: 0.75,
        borderRadius: 0.75,
        typography: "caption",
        fontWeight: 600,
        lineHeight: "1.125rem",
        color: required ? "info.contrastText" : "text.secondary",
        bgcolor: required ? "info.main" : "transparent",
        border: `1px ${required ? "solid" : "dashed"}`,
        borderColor: required ? "info.main" : "text.disabled",
      }}
    >
      {t(`home.sample.${tag}`)}
    </Box>
  );
}

function SampleRow({ line }: { line: SampleLine }) {
  const { t } = useTranslation();
  const annotated = Boolean(line.noteKey);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "2rem minmax(0, 1fr)",
          md: "2rem 44ch minmax(0, 1fr)",
        },
        alignItems: "center",
        columnGap: 1.5,
        px: 1,
        py: { xs: annotated ? 0.5 : 0, md: 0 },
        borderRadius: 1,
        ...(annotated && {
          "&:hover": { bgcolor: "action.hover" },
          "&:hover .json-key": { textDecoration: "underline", textUnderlineOffset: "3px" },
        }),
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          display: { xs: "none", sm: "block" },
          color: "text.disabled",
          textAlign: "right",
          userSelect: "none",
        }}
      >
        {line.number}
      </Box>
      <Box
        component="code"
        sx={{
          fontFamily: "inherit",
          whiteSpace: "pre",
          overflowX: "auto",
          ...(annotated && {
            display: { md: "flex" },
            alignItems: "center",
            "&::after": {
              content: '""',
              display: { xs: "none", md: "block" },
              flex: 1,
              minWidth: 16,
              ml: 1.5,
              borderBottom: "1px dotted",
              borderColor: "divider",
            },
          }),
        }}
      >
        <span>{INDENT.repeat(line.depth)}</span>
        {line.tokens.map((token) => (
          <CodeToken key={`${token.kind}:${token.text}`} token={token} />
        ))}
      </Box>
      {line.noteKey && (
        <Box
          sx={{
            gridColumn: { xs: 1, sm: 2, md: 3 },
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            py: 0.25,
            pl: { xs: `${line.depth * 2}ch`, md: 0 },
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: "0.8125rem",
            lineHeight: 1.5,
            color: "text.secondary",
          }}
        >
          {line.tag && <TagLabel tag={line.tag} />}
          <span>{t(line.noteKey)}</span>
        </Box>
      )}
    </Box>
  );
}

/** Annotated `configs.json` sample: the catalog shape at a glance. */
export function ConfigJsonSample() {
  const { t } = useTranslation();

  return (
    <Box
      component="figure"
      data-testid="home-json-sample"
      sx={{
        m: 0,
        overflow: "hidden",
        borderRadius: 2,
        bgcolor: "background.paper",
        color: "text.primary",
        border: 1,
        borderColor: "divider",
        boxShadow: 1,
      }}
    >
      <Box
        component="figcaption"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.25,
          bgcolor: "grey.50",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <DataObjectOutlinedIcon sx={{ fontSize: 18, color: TOKEN_COLOR.key }} />
        <Typography component="span" sx={{ fontFamily: MONO_FONT, fontSize: "0.875rem" }}>
          configs.json
        </Typography>
        <Typography
          component="span"
          variant="caption"
          sx={{ ml: "auto", color: "text.secondary", letterSpacing: "0.04em" }}
        >
          {t("home.sample.badge")}
        </Typography>
      </Box>
      <Box
        sx={{
          py: 1.5,
          px: { xs: 0.5, sm: 1 },
          fontFamily: MONO_FONT,
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          lineHeight: 1.75,
        }}
      >
        {SAMPLE_LINES.map((line) => (
          <SampleRow key={line.number} line={line} />
        ))}
      </Box>
    </Box>
  );
}
