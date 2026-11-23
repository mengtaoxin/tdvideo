import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { APP_NAME, APP_VERSION, REPO_URL } from "@/constants";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();

  return (
    <Stack spacing={1.5}>
      <Typography component="h1" variant="h4">
        {t("about.title")}
      </Typography>
      <Typography component="h2" variant="h5">
        {APP_NAME}
      </Typography>
      <Typography color="text.secondary">{t("about.description")}</Typography>
      <Typography>{t("about.version", { version: APP_VERSION })}</Typography>
      <Link href={REPO_URL} target="_blank" rel="noopener noreferrer">
        {t("about.repository")}
      </Link>
    </Stack>
  );
}
