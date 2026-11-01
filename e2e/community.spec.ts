import { expect, test } from "@playwright/test";
import { fail, logIn, mockApi, ok, testUser } from "./mock-api";

const writer = { id: 2, name: "Writer", handle: "writer" };
const post = {
  id: 5,
  user_id: writer.id,
  title: "<p>Main story</p>",
  sub_title: "",
  content: "<p>Body</p>",
  tags: "",
  is_draft: false,
  likes: [],
  bookmarks: [],
  created_at: "2026-10-20T00:00:00.000Z",
  user: writer,
};
const comment = (id: number, user: object, content: string) => ({
  id,
  user_id: (user as { id: number }).id,
  post_id: 5,
  content,
  created_at: "2026-10-20T00:00:00.000Z",
  updated_at: "2026-10-20T00:00:00.000Z",
  user,
  replies: [],
  reply_count: 0,
});

test("edits your own comment", async ({ page }) => {
  await logIn(page);
  const mine = comment(30, testUser, "Frist!");
  let edited: unknown;
  await mockApi(page, {
    "GET /post/5": (route) => route.fulfill(ok(post)),
    "GET /comment/post/5": (route) =>
      route.fulfill(ok({ data: [mine], total: 1 })),
    "PUT /comment/30": (route) => {
      edited = route.request().postDataJSON();
      mine.content = "First!";
      mine.updated_at = "2026-10-21T00:00:00.000Z";
      return route.fulfill(ok(mine));
    },
  });
  await page.goto("/post/5");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Edit comment").fill("First!");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByLabel("Edit comment")).toHaveCount(0);
  await expect(page.getByText("First!")).toBeVisible();
  await expect(page.getByText("edited")).toBeVisible();
  expect(edited).toEqual({ content: "First!" });
});

test("reports someone else's comment and the post", async ({ page }) => {
  await logIn(page);
  const reports: unknown[] = [];
  await mockApi(page, {
    "GET /post/5": (route) => route.fulfill(ok(post)),
    "GET /comment/post/5": (route) =>
      route.fulfill(ok({ data: [comment(31, writer, "Buy now!!")], total: 1 })),
    "POST /report": (route) => {
      reports.push(route.request().postDataJSON());
      return route.fulfill(ok({ message: "ok" }, 201));
    },
  });
  await page.goto("/post/5");
  await expect(page.getByText("Buy now!!")).toBeVisible();
  // Only your own comments can be edited.
  await expect(
    page.getByRole("button", { name: "Edit", exact: true }),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Report", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Spam or ads").check();
  await dialog.getByLabel("More details (optional)").fill("link farm");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thanks for reporting")).toBeVisible();

  await page.getByRole("button", { name: "Report this post" }).click();
  await page.getByRole("dialog").getByLabel("Hate speech").check();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Send report" })
    .click();

  await expect.poll(() => reports.length).toBe(2);
  expect(reports).toEqual([
    { comment_id: 31, reason: "spam", details: "link farm" },
    { post_id: 5, reason: "hate" },
  ]);
});

test("blocks someone from their profile and unblocks them in settings", async ({
  page,
}) => {
  await logIn(page);
  let blocked = false;
  const profile = {
    ...writer,
    email: "w@example.com",
    created_at: "2026-10-01T00:00:00.000Z",
    following: [],
    followers: [],
    following_count: 0,
    followers_count: 0,
    likes: [],
    likes_count: 0,
    bookmarks: [],
    bookmarks_count: 0,
  };
  await mockApi(page, {
    "GET /user/2": (route) => route.fulfill(ok(profile)),
    "GET /notifications/settings": (route) =>
      route.fulfill(ok({ notify_followed_posts_from_users: [] })),
    [`GET /user/${testUser.id}`]: (route) => route.fulfill(ok(testUser)),
    "GET /user/blocks": (route) =>
      route.fulfill(
        ok({ data: blocked ? [profile] : [], total: blocked ? 1 : 0 }),
      ),
    "POST /user/block/2": (route) => {
      blocked = true;
      return route.fulfill(ok({ message: "User blocked" }, 201));
    },
    "POST /user/unblock/2": (route) => {
      blocked = false;
      return route.fulfill(ok({ message: "User unblocked" }, 201));
    },
  });
  await page.goto("/profile/2");
  await page.getByRole("button", { name: "Block", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Block" }).click();
  await expect(page.getByRole("button", { name: "Unblock" })).toBeVisible();
  expect(blocked).toBe(true);

  await page.goto("/setting");
  await page.getByText("blocked people", { exact: true }).click();
  await expect(page.getByText("@writer")).toBeVisible();
  await page.getByRole("button", { name: "Unblock" }).click();
  await expect(page.getByText("You haven't blocked anyone.")).toBeVisible();
  expect(blocked).toBe(false);
});

test("shows a writer's stats", async ({ page }) => {
  await logIn(page);
  await mockApi(page, {
    "GET /post/stats/mine": (route) =>
      route.fulfill(
        ok({
          totals: {
            posts: 2,
            views: 1500,
            likes: 12,
            comments: 3,
            bookmarks: 1,
            shares: 0,
            likes_last_30_days: 4,
            followers: 9,
          },
          posts: [
            {
              id: 1,
              title: "<p>Popular</p>",
              created_at: "2026-10-01",
              view_count: 1400,
              likes_count: 2,
              likes_last_30_days: 0,
              comment_count: 1,
              bookmarks_count: 0,
              share_count: 0,
            },
            {
              id: 2,
              title: "<p>Loved</p>",
              created_at: "2026-10-02",
              view_count: 100,
              likes_count: 10,
              likes_last_30_days: 4,
              comment_count: 2,
              bookmarks_count: 1,
              share_count: 0,
            },
          ],
        }),
      ),
  });
  await page.goto("/stats");
  await expect(page.getByText("1,500")).toBeVisible();
  const rows = page.locator("tbody tr");
  await expect(rows.first()).toContainText("Popular");

  await page.getByRole("button", { name: "Likes", exact: true }).click();
  await expect(rows.first()).toContainText("Loved");
});

test("admins review reports; everyone else is turned away", async ({
  page,
}) => {
  await logIn(page);
  let isAdmin = false;
  let resolved: unknown;
  await mockApi(page, {
    "GET /report/access": (route) => route.fulfill(ok({ is_admin: isAdmin })),
    "GET /report": (route) =>
      route.fulfill(
        ok({
          data: resolved
            ? []
            : [
                {
                  id: 7,
                  reporter_id: 3,
                  post_id: null,
                  comment_id: 31,
                  reason: "spam",
                  details: "link farm",
                  status: "open",
                  created_at: "2026-10-20T00:00:00.000Z",
                  reporter: { id: 3, name: "Reporter", handle: "rep" },
                  post: null,
                  comment: comment(31, writer, "Buy now!!"),
                },
              ],
          total: resolved ? 0 : 1,
        }),
      ),
    "PUT /report/7": (route) => {
      resolved = route.request().postDataJSON();
      return route.fulfill(ok({ message: "Removed" }));
    },
  });
  await page.goto("/admin/reports");
  await expect(page.getByText("Only admins can see this")).toBeVisible();

  isAdmin = true;
  await page.reload();
  await expect(page.getByText("Buy now!!")).toBeVisible();
  await expect(page.getByText("Spam or ads")).toBeVisible();
  await page.getByRole("button", { name: "Remove comment" }).click();
  await expect(page.getByText("Nothing to review.")).toBeVisible();
  expect(resolved).toEqual({ status: "removed" });
});

test("reminds unverified users and confirms the email from the link", async ({
  page,
}) => {
  await page.context().addCookies([
    {
      name: "chronicle_access_token_local",
      value: encodeURIComponent(
        JSON.stringify({ ...testUser, email_verified: false }),
      ),
      url: "http://localhost:3100",
    },
  ]);
  let resent = false;
  await mockApi(page, {
    "POST /auth/resend-verification": (route) => {
      resent = true;
      return route.fulfill(ok({ message: "sent" }));
    },
    "POST /auth/verify-email": (route) =>
      route.request().postDataJSON().token === "good"
        ? route.fulfill(ok({ message: "Email verified" }))
        : route.fulfill(
            fail(400, "This verification link is invalid or has expired"),
          ),
  });
  await page.goto("/dashboard");
  await expect(page.getByText("Confirm your email")).toBeVisible();
  await page.getByRole("button", { name: "Send it again" }).click();
  await expect(page.getByText("Sent. Check your inbox.")).toBeVisible();
  expect(resent).toBe(true);

  await page.goto("/verify-email?token=bad");
  await expect(
    page.getByText("This verification link is invalid or has expired"),
  ).toBeVisible();

  await page.goto("/verify-email?token=good");
  await expect(
    page.getByRole("heading", { name: "Your email is confirmed" }),
  ).toBeVisible();
  // The banner goes away once confirmed.
  await page.goto("/dashboard");
  await expect(page.getByText("Confirm your email")).toHaveCount(0);
});

test("search shows matching people above stories", async ({ page }) => {
  await mockApi(page, {
    "GET /user": (route) => {
      const search = new URL(route.request().url()).searchParams.get("search");
      return route.fulfill(
        ok({
          data:
            search === "ada" ? [{ ...writer, id: 9, name: "Ada Writer" }] : [],
          total: 1,
        }),
      );
    },
  });
  await page.goto("/search?q=ada");
  await expect(page.getByRole("heading", { name: "People" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ada Writer/ })).toHaveAttribute(
    "href",
    "/profile/9",
  );
});
