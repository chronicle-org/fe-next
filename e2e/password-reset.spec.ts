import { expect, test } from "@playwright/test";
import { fail, mockApi, ok } from "./mock-api";

test("asks for a reset link from the login page", async ({ page }) => {
  let email: string | undefined;
  await mockApi(page, {
    "POST /auth/forgot-password": (route) => {
      email = route.request().postDataJSON().email;
      return route.fulfill(ok({ message: "sent" }));
    },
  });
  await page.goto("/auth");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/forgot-password/);
  await page.getByLabel("Email").fill("me@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByText("we've sent it a link")).toBeVisible();
  expect(email).toBe("me@example.com");
});

test("shows the API's message when email isn't set up", async ({ page }) => {
  await mockApi(page, {
    "POST /auth/forgot-password": (route) =>
      route.fulfill(fail(503, "Password reset by email isn't available yet")),
  });
  await page.goto("/auth/forgot-password");
  await page.getByLabel("Email").fill("me@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByText("Password reset by email isn't available yet"),
  ).toBeVisible();
});

test("sets a new password from the emailed link", async ({ page }) => {
  let body: Record<string, unknown> | undefined;
  await mockApi(page, {
    "POST /auth/reset-password": (route) => {
      body = route.request().postDataJSON();
      return route.fulfill(ok({ message: "Password reset" }));
    },
  });
  await page.goto("/auth/reset-password?token=abc.def");
  await page.getByLabel("New password", { exact: true }).fill("new-secret");
  await page.getByLabel("Confirm new password").fill("different");
  await expect(page.getByText("The passwords don't match.")).toBeVisible();

  await page.getByLabel("Confirm new password").fill("new-secret");
  await page.getByRole("button", { name: "Save new password" }).click();

  await expect(page).toHaveURL(/\/auth$/);
  expect(body).toEqual({ token: "abc.def", new_password: "new-secret" });
});
