import { expect, test, type Page } from "@playwright/test";

async function waitForConfigsReady(page: Page) {
  await expect(page.getByRole("progressbar", { name: "Loading configs…" })).toHaveCount(0, {
    timeout: 15_000,
  });
}

test.describe("tdvideo smoke", () => {
  test("navigates primary routes from the top nav", async ({ page }) => {
    await page.goto("/");
    await waitForConfigsReady(page);
    await expect(
      page.getByRole("heading", {
        name: "One read-only JSON file is your whole video library",
      }),
    ).toBeVisible();

    const cases = [
      {
        link: "Now Playing",
        marker: { role: "link" as const, name: "Browse videos" },
      },
      { link: "Videos", marker: { role: "heading" as const, name: "Videos" } },
      { link: "Playlists", marker: { role: "heading" as const, name: "Playlists" } },
      { link: "Settings", marker: { role: "heading" as const, name: "Settings" } },
      { link: "About", marker: { role: "heading" as const, name: "About" }, overflow: true },
      {
        link: "Home",
        marker: {
          role: "heading" as const,
          name: "One read-only JSON file is your whole video library",
        },
      },
    ] as const;

    for (const item of cases) {
      const banner = page.getByRole("banner");
      if ("overflow" in item && item.overflow) {
        await banner.getByRole("button", { name: "More" }).click();
        await page.getByRole("menuitem", { name: item.link }).click();
      } else {
        await banner.getByRole("link", { name: item.link }).click();
      }
      await expect(page.getByRole(item.marker.role, { name: item.marker.name })).toBeVisible();
    }
  });

  test("Settings configs URL save, reload, and reset", async ({ page }) => {
    await page.goto("/settings");
    await waitForConfigsReady(page);

    await expect(page.getByText(/Loaded configs from \/configs\.json/)).toBeVisible();

    const urlField = page.getByLabel("Configs URL");
    await urlField.fill("/fixtures/alt-configs.json");
    await page.getByRole("button", { name: "Save and reload" }).click();

    await waitForConfigsReady(page);
    await expect(page.getByText(/Loaded configs from \/fixtures\/alt-configs\.json/)).toBeVisible();

    await page.getByRole("banner").getByRole("link", { name: "Videos" }).click();
    await expect(page.getByRole("button", { name: /Alt Fixture Video/i })).toBeVisible();

    await page.getByRole("banner").getByRole("link", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Reset to default" }).click();
    await waitForConfigsReady(page);
    await expect(page.getByText(/Loaded configs from \/configs\.json/)).toBeVisible();

    await page.getByRole("banner").getByRole("link", { name: "Videos" }).click();
    await expect(page.getByRole("button", { name: /Big Buck Bunny/i })).toBeVisible();
  });

  test("opens Now Playing from Videos with fixture media", async ({ page }) => {
    await page.goto("/videos");
    await waitForConfigsReady(page);

    await page.getByRole("button", { name: /Big Buck Bunny/i }).click();
    await expect(page.getByRole("heading", { name: "Big Buck Bunny" })).toBeVisible();
    await expect(page.locator("video")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel("Toggle subtitles")).toBeVisible();
    await expect(page.getByLabel("Toggle bullet comments")).toBeVisible();
  });

  test("opens Now Playing from Playlists with sidebar", async ({ page }) => {
    await page.goto("/playlists");
    await waitForConfigsReady(page);

    await page.getByRole("button", { name: /Demo playlist/i }).click();
    await expect(page.getByRole("heading", { name: "Big Buck Bunny" })).toBeVisible();
    await expect(page.getByLabel("Toggle subtitles")).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Playlist" })).toBeVisible();
    await expect(page.getByText("Item 1 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "Previous in playlist" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next in playlist" })).toBeEnabled();
    await expect(page.locator("video")).toBeVisible({ timeout: 15_000 });
  });
});
