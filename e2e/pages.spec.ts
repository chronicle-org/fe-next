import { expect, test } from "@playwright/test";
import { fail, logIn, mockApi, ok, testUser } from "./mock-api";

test("shows a friendly 404 for unknown pages", async ({ page }) => {
  await mockApi(page);
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page wandered off" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Read the latest stories" }),
  ).toBeVisible();
});

test("shows a 404 for a post that doesn't exist", async ({ page }) => {
  await mockApi(page, {
    "GET /post/404": (route) => route.fulfill(fail(404, "Post not found")),
  });
  await page.goto("/post/404");
  await expect(
    page.getByRole("heading", { name: "This story isn't here" }),
  ).toBeVisible();
});

test("shows view counts to the writer only", async ({ page }) => {
  const post = {
    id: 7,
    user_id: testUser.id,
    title: "<p>Mine</p>",
    sub_title: "",
    content: "<p>Body</p>",
    tags: "",
    is_draft: false,
    view_count: 42,
    likes: [],
    bookmarks: [],
    user: testUser,
  };
  let counted = 0;
  await logIn(page);
  await mockApi(page, {
    "GET /post/7": (route) => route.fulfill(ok(post)),
    "PUT /post/counter/view/7": (route) => {
      counted++;
      return route.fulfill(ok(post));
    },
  });
  await page.goto("/post/7");
  await expect(page.getByText("42 views")).toBeVisible();
  // Reading your own post doesn't count as a view.
  expect(counted).toBe(0);

  await page.context().clearCookies();
  await page.goto("/post/7");
  await expect(page.getByText("Body")).toBeVisible();
  await expect(page.getByText("42 views")).toHaveCount(0);
});
