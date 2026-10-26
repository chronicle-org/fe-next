import { expect, test } from "@playwright/test";
import { fail, logIn, mockApi, ok, testUser } from "./mock-api";

const person = (id: number, name: string) => ({
  ...testUser,
  id,
  name,
  handle: name.toLowerCase(),
  email: undefined,
});

test("suggests people to follow on the dashboard", async ({ page }) => {
  await logIn(page);
  await mockApi(page, {
    "GET /user/suggestions": (route) =>
      route.fulfill(ok([person(2, "Ivy"), person(3, "Gus")])),
  });
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /^Ivy/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Gus/ })).toBeVisible();
});

test("falls back to the user list while the API has no suggestions", async ({
  page,
}) => {
  await logIn(page);
  await mockApi(page, {
    "GET /user/suggestions": (route) =>
      route.fulfill(fail(404, "Cannot GET /user/suggestions")),
    "GET /user": (route) =>
      route.fulfill(ok({ data: [person(4, "Hal")], total: 1 })),
  });
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /^Hal/ })).toBeVisible();
});

test("deletes the account after confirming the password", async ({ page }) => {
  let sentPassword: string | undefined;
  await logIn(page);
  await mockApi(page, {
    "GET /notifications/settings": (route) =>
      route.fulfill(ok({ notify_followed_posts_from_users: [] })),
    "DELETE /auth/account": (route) => {
      sentPassword = route.request().postDataJSON().password;
      return sentPassword === "secret123"
        ? route.fulfill(ok({ message: "Account deleted" }))
        : route.fulfill(fail(400, "Password is incorrect"));
    },
  });

  await page.goto("/setting");
  await page.getByText("delete account", { exact: true }).click();
  const password = page.getByLabel("Password");
  const confirm = page.getByRole("button", { name: "Delete forever" });

  await password.fill("wrong");
  await page.getByRole("button", { name: "Delete account" }).click();
  await confirm.click();
  await expect(page.getByText("Password is incorrect")).toBeVisible();
  await expect(page).toHaveURL(/\/setting$/);

  await password.fill("secret123");
  await page.getByRole("button", { name: "Delete account" }).click();
  await confirm.click();
  await expect(page).toHaveURL(/\/auth$/);
  expect(sentPassword).toBe("secret123");
  const cookies = await page.context().cookies();
  expect(
    cookies.find((c) => c.name === "chronicle_access_token_local"),
  ).toBeUndefined();
});
