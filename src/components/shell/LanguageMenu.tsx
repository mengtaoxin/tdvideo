import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTranslation } from "react-i18next";

export function LanguageMenu({
  anchorEl,
  open,
  language,
  onClose,
  onSelect,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  language: "en" | "zh";
  onClose: () => void;
  onSelect: (next: "en" | "zh") => void;
}) {
  const { t } = useTranslation();

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem selected={language === "en"} onClick={() => onSelect("en")}>
        {t("language.en")}
      </MenuItem>
      <MenuItem selected={language === "zh"} onClick={() => onSelect("zh")}>
        {t("language.zh")}
      </MenuItem>
    </Menu>
  );
}
