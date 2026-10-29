import { expect, test } from "@playwright/test";
import { fail, logIn, mockApi, ok, testUser } from "./mock-api";

const post = (id: number, title: string, extra: Record<string, unknown> = {}) => ({
  id,
  user_id: 2,
  title: `<p>${title}</p>`,
  sub_title: "",
  content: "<p>Body</p>",
  tags: "",
  is_draft: false,
  likes: [],
  bookmarks: [],
  created_at: "2026-10-20T00:00:00.000Z",
  user: { id: 2, name: "Writer", handle: "writer" },
  ...extra,
});

test("dashboard switches between following, latest and popular", async ({ page }) => {
  await logIn(page);
  const seen: string[] = [];
  await mockApi(page, {
    "GET /post/feed/following": (route) =>
      route.fulfill(ok({ data: [post(1, "From a writer you follow")], total: 1 })),
    "GET /post": (route) => {
      const sort = new URL(route.request().url()).searchParams.get("sort");
      seen.push(sort ?? "latest");
      return route.fulfill(
        ok({ data: [post(2, sort === "likes" ? "Most loved" : "Newest")], total: 1 }),
      );
    },
  });
  await page.goto("/dashboard");

  // testUser follows nobody, so the dashboard opens on Latest.
  await expect(page.getByRole("tab", { name: "Latest" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Newest")).toBeVisible();

  await page.getByRole("tab", { name: "Following" }).click();
  await expect(page.getByText("From a writer you follow")).toBeVisible();

  await page.getByRole("tab", { name: "Popular" }).click();
  await expect(page.getByText("Most loved")).toBeVisible();
  expect(seen).toContain("likes");
});

test("following tab is empty, not an error, on an API without the feed", async ({ page }) => {
  await logIn(page);
  await mockApi(page, {
    "GET /post/feed/following": (route) =>
      route.fulfill(fail(404, "Cannot GET /post/feed/following")),
  });
  await page.goto("/dashboard");
  await page.getByRole("tab", { name: "Following" }).click();
  await expect(page.getByText("Follow a few writers above")).toBeVisible();
  await expect(page.getByText("Cannot GET")).toHaveCount(0);
});

test("tag pages filter by tag and sort", async ({ page }) => {
  const requests: URLSearchParams[] = [];
  await mockApi(page, {
    "GET /post": (route) => {
      const params = new URL(route.request().url()).searchParams;
      requests.push(params);
      return route.fulfill(ok({ data: [post(3, "Tagged story")], total: 1 }));
    },
  });
  await page.goto("/search?tag=javascript");
  await expect(page.getByRole("heading", { name: "#javascript" })).toBeVisible();
  await expect(page.getByText("Tagged story")).toBeVisible();
  expect(requests.at(-1)?.get("tag")).toBe("javascript");

  await page.getByRole("link", { name: "Most viewed" }).click();
  await expect(page).toHaveURL(/sort=views/);
  await expect.poll(() => requests.at(-1)?.get("sort")).toBe("views");
});

test("tag pages fall back to a text search on an older API", async ({ page }) => {
  await mockApi(page, {
    "GET /post": (route) => {
      const params = new URL(route.request().url()).searchParams;
      if (params.has("tag"))
        return route.fulfill(fail(400, "property tag should not exist"));
      return route.fulfill(
        ok({ data: [post(4, `Found by ${params.get("search")}`)], total: 1 }),
      );
    },
  });
  await page.goto("/search?tag=rust");
  await expect(page.getByText("Found by rust")).toBeVisible();
});

test("shows related posts under a post", async ({ page }) => {
  await mockApi(page, {
    "GET /post/5": (route) => route.fulfill(ok(post(5, "Main story"))),
    "GET /post/5/related": (route) =>
      route.fulfill(ok([post(6, "Read this next")])),
  });
  await page.goto("/post/5");
  await expect(page.getByRole("heading", { name: "More like this" })).toBeVisible();
  await expect(page.getByText("Read this next")).toBeVisible();
});

test("replies to a comment", async ({ page }) => {
  await logIn(page);
  const comment = {
    id: 20,
    user_id: 2,
    post_id: 5,
    content: "Great read",
    created_at: "2026-10-20T00:00:00.000Z",
    updated_at: "2026-10-20T00:00:00.000Z",
    user: { id: 2, name: "Writer", handle: "writer" },
    replies: [] as unknown[],
    reply_count: 0,
  };
  let sent: Record<string, unknown> | undefined;
  await mockApi(page, {
    "GET /post/5": (route) => route.fulfill(ok(post(5, "Main story"))),
    "GET /comment/post/5": (route) =>
      route.fulfill(ok({ data: [comment], total: 1 })),
    "POST /comment": (route) => {
      sent = route.request().postDataJSON();
      comment.replies = [
        {
          ...comment,
          id: 21,
          parent_id: 20,
          content: sent?.content,
          user: testUser,
          user_id: testUser.id,
        },
      ];
      return route.fulfill(ok(comment.replies[0], 201));
    },
  });
  await page.goto("/post/5");
  await expect(page.getByText("Great read")).toBeVisible();

  await page.getByRole("button", { name: "Reply" }).first().click();
  await page.getByLabel("Reply to Writer").fill("Thanks for this");
  await page.getByRole("button", { name: "Reply", exact: true }).last().click();

  await expect(page.getByText("Thanks for this")).toBeVisible();
  expect(sent).toEqual({ post_id: 5, content: "Thanks for this", parent_id: 20 });
});
