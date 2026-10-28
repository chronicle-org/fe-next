import { expect, test } from "@playwright/test";
import { logIn, mockApi, ok, testUser } from "./mock-api";

const profileMocks = {
  [`GET /user/${testUser.id}`]: (route: import("@playwright/test").Route) =>
    route.fulfill(ok(testUser)),
  "GET /notifications/settings": (route: import("@playwright/test").Route) =>
    route.fulfill(ok({ notify_followed_posts_from_users: [] })),
};

test("autosaves a new post as a draft, then publishes that draft", async ({
  page,
}) => {
  const created: Record<string, unknown>[] = [];
  const updates: Record<string, unknown>[] = [];
  await logIn(page);
  await mockApi(page, {
    ...profileMocks,
    "POST /post": (route) => {
      const body = route.request().postDataJSON();
      created.push(body);
      return route.fulfill(ok({ id: 10, user_id: testUser.id, ...body }, 201));
    },
    "PUT /post/10": (route) => {
      const body = route.request().postDataJSON();
      updates.push(body);
      return route.fulfill(ok({ id: 10, user_id: testUser.id, ...body }));
    },
  });

  await page.goto("/profile");
  await page.getByRole("button", { name: "New" }).click();
  await page.locator('.ql-editor[data-placeholder="Title"]').fill("Autosaved");
  await page
    .locator('.ql-editor[data-placeholder="Tell your story..."]')
    .fill("First thoughts");

  await expect(page.getByText(/^Draft saved/)).toBeVisible({ timeout: 10_000 });
  expect(created).toHaveLength(1);
  expect(created[0].is_draft).toBe(true);
  expect(created[0].content).toContain("First thoughts");

  await page
    .locator('.ql-editor[data-placeholder="Tell your story..."]')
    .fill("Second thoughts");
  await expect.poll(() => updates.length, { timeout: 10_000 }).toBe(1);
  expect(updates[0].is_draft).toBe(true);

  await page.locator('button[type="submit"]', { hasText: "Submit" }).click();
  await expect.poll(() => updates.length).toBe(2);
  // Publishing updates the autosaved draft instead of creating a second post.
  expect(created).toHaveLength(1);
  expect(updates[1].is_draft).toBe(false);
  expect(updates[1].content).toContain("Second thoughts");
});

test("offers to restore text kept in the browser", async ({ page }) => {
  await logIn(page);
  await mockApi(page, profileMocks);
  await page.addInitScript((userId) => {
    localStorage.setItem(
      `chronicle:draft:${userId}:new`,
      JSON.stringify({
        title: "<p>Kept title</p>",
        sub_title: "",
        content: "<p>Words I almost lost</p>",
        tags: "",
        saved_at: "2026-10-27T10:00:00.000Z",
      }),
    );
  }, testUser.id);

  await page.goto("/profile");
  await page.getByRole("button", { name: "New" }).click();
  await expect(page.getByText(/You have unsaved changes/)).toBeVisible();
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText("Words I almost lost")).toBeVisible();
});
