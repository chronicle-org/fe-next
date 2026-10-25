import { expect, test } from "@playwright/test";
import { logIn, mockApi, ok, testUser } from "./mock-api";

test("writes and submits a new post", async ({ page }) => {
  let submitted: Record<string, unknown> | undefined;
  await logIn(page);
  await mockApi(page, {
    [`GET /user/${testUser.id}`]: (route) => route.fulfill(ok(testUser)),
    "GET /notifications/settings": (route) =>
      route.fulfill(ok({ notify_followed_posts_from_users: [] })),
    "POST /post": (route) => {
      submitted = route.request().postDataJSON();
      return route.fulfill(ok({ id: 10, ...submitted }, 201));
    },
  });

  await page.goto("/profile");
  await page.getByRole("button", { name: "New" }).click();
  await page.locator('.ql-editor[data-placeholder="Title"]').fill("My first post");
  await page
    .locator('.ql-editor[data-placeholder="Tell your story..."]')
    .fill("Hello from the browser test");
  // The editor's own submit button, not the comment form's.
  await page.locator('button[type="submit"]', { hasText: "Submit" }).click();

  await expect.poll(() => submitted).toBeTruthy();
  expect(submitted?.title).toContain("My first post");
  expect(submitted?.content).toContain("Hello from the browser test");
  expect(submitted?.is_draft).toBe(false);
});

test("posts a comment and loads more comments", async ({ page }) => {
  const comment = (id: number) => ({
    id,
    post_id: 5,
    user_id: 2,
    content: `comment ${id}`,
    user: { ...testUser, id: 2, name: "Commenter", handle: "commenter" },
  });
  let posted: Record<string, unknown> | undefined;
  await logIn(page);
  await mockApi(page, {
    "GET /post/5": (route) =>
      route.fulfill(
        ok({
          id: 5,
          user_id: 2,
          title: "<p>A post</p>",
          sub_title: "",
          content: "<p>Body</p>",
          tags: "",
          is_draft: false,
          likes: [],
          bookmarks: [],
          user: { ...testUser, id: 2, name: "Author", handle: "author" },
        }),
      ),
    "GET /comment/post/5": (route) => {
      const pageNumber = Number(new URL(route.request().url()).searchParams.get("page"));
      // 25 comments: a full first page of 20, then 5 more.
      const ids = pageNumber === 1 ? [...Array(20).keys()] : [20, 21, 22, 23, 24];
      return route.fulfill(ok({ data: ids.map((i) => comment(25 - i)), total: 25 }));
    },
    "POST /comment": (route) => {
      posted = route.request().postDataJSON();
      return route.fulfill(ok(comment(26), 201));
    },
  });

  await page.goto("/post/5");
  await expect(page.getByText("25 Comments")).toBeVisible();
  await expect(page.getByText(/^comment \d+$/)).toHaveCount(20);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByText(/^comment \d+$/)).toHaveCount(25);
  await expect(page.getByRole("button", { name: "Load more" })).toHaveCount(0);

  await page.getByPlaceholder("Write your comment here...").fill("Nice one");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Comment posted")).toBeVisible();
  expect(posted).toEqual({ post_id: 5, content: "Nice one" });
});

test("loads drafts a page at a time", async ({ page }) => {
  const draft = (id: number) => ({
    id,
    user_id: testUser.id,
    title: `<p>Draft ${id}</p>`,
    sub_title: "",
    content: "<p>Unfinished</p>",
    tags: "",
    is_draft: true,
    likes: [],
    bookmarks: [],
    user: testUser,
  });
  await logIn(page);
  await mockApi(page, {
    [`GET /user/${testUser.id}`]: (route) => route.fulfill(ok(testUser)),
    "GET /notifications/settings": (route) =>
      route.fulfill(ok({ notify_followed_posts_from_users: [] })),
    [`GET /post/user/${testUser.id}/drafts`]: (route) => {
      const pageNumber = Number(
        new URL(route.request().url()).searchParams.get("page"),
      );
      // 25 drafts: a full first page of 20, then 5 more.
      const ids = pageNumber === 1 ? [...Array(20).keys()] : [20, 21, 22, 23, 24];
      return route.fulfill(ok({ data: ids.map((i) => draft(25 - i)), total: 25 }));
    },
  });

  await page.goto("/profile");
  await page.getByRole("tab", { name: "Drafts" }).click();
  await expect(page.getByText(/^Draft \d+$/)).toHaveCount(20);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByText(/^Draft \d+$/)).toHaveCount(25);
  await expect(page.getByRole("button", { name: "Load more" })).toHaveCount(0);
});
