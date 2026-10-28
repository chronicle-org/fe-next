import { expect, test } from "@playwright/test";
import { mockApi, ok, testUser } from "./mock-api";

const post = (id: number, title: string) => ({
  id,
  user_id: 2,
  title: `<p>${title}</p>`,
  sub_title: "",
  content: "<p>Body</p>",
  tags: "",
  created_at: "2026-10-01T00:00:00.000Z",
  user: { ...testUser, id: 2, name: "Author", handle: "author" },
});

test("shows a loading state while searching on the landing page", async ({ page }) => {
  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await mockApi(page, {
    "GET /post": async (route) => {
      const search = new URL(route.request().url()).searchParams.get("search");
      if (!search) return route.fulfill(ok({ data: [post(1, "First story")], total: 1 }));
      await held;
      return route.fulfill(ok({ data: [post(2, "Found it")], total: 1 }));
    },
  });

  await page.goto("/");
  await expect(page.getByText("First story", { exact: true })).toBeVisible();

  await page.getByPlaceholder("Search posts...").last().fill("found");
  await expect(page.getByRole("heading", { name: "Searching…" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Searching" })).toBeVisible();

  release();
  await expect(page.getByRole("heading", { name: "Search results" })).toBeVisible();
  await expect(page.getByText("Found it")).toBeVisible();
  await expect(page.getByRole("status", { name: "Searching" })).toHaveCount(0);
});

test("draws an overlay scrollbar that hides when idle", async ({ page }) => {
  await mockApi(page, {
    "GET /post": (route) =>
      route.fulfill(
        ok({
          data: Array.from({ length: 10 }, (_, i) => post(i + 1, `Story ${i + 1}`)),
          total: 10,
        }),
      ),
  });
  await page.goto("/");
  await expect(page.getByText("Story 10")).toBeVisible();

  // The page keeps its full width: no native scrollbar gutter.
  const widths = await page.evaluate(() => [
    document.documentElement.clientWidth,
    window.innerWidth,
  ]);
  expect(widths[0]).toBe(widths[1]);

  const bar = page.getByTestId("overlay-scrollbar");
  await expect(bar).toHaveCSS("opacity", "0");
  await page.mouse.wheel(0, 600);
  await expect(bar).toHaveCSS("opacity", "1");
  await expect(bar).toHaveCSS("opacity", "0", { timeout: 3000 });
});
