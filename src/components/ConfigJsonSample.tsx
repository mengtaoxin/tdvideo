import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import {
  buildSampleLines,
  type SampleFieldTag,
  type SampleLine,
  type SampleToken,
  type SampleTokenKind,
} from "@/lib/configs/sampleCatalog";

const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
const INDENT = "  ";

const TOKEN_COLOR: Record<SampleTokenKind, string> = {
  punct: "text.secondary",
  key: "info.main",
  string: "warning.dark",
  number: "success.dark",
  boolean: "success.dark",
  fold: "text.disabled",
};

const SAMPLE_LINES = buildSampleLines();

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

function CodeToken({ token }: { token: SampleToken }) {
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

function TagLabel({ tag }: { tag: SampleFieldTag }) {
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
