import { expect, test } from "@playwright/test";
import { fail, mockApi, ok, testUser } from "./mock-api";

test("login and sign-up pages link to each other", async ({ page }) => {
  await mockApi(page);
  await page.goto("/auth");
  await page.getByRole("link", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);
  await expect(page).toHaveTitle("Sign up | Chronicle");
  await page.getByRole("link", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/auth$/);
});

test("logs in and lands on the dashboard", async ({ page }) => {
  await mockApi(page, {
    "POST /auth/login": (route) => route.fulfill(ok(testUser, 201)),
  });
  await page.goto("/auth");
  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("signs up, logs in and lands on the dashboard", async ({ page }) => {
  let registered: unknown;
  await mockApi(page, {
    "POST /auth/register": (route) => {
      registered = route.request().postDataJSON();
      return route.fulfill(ok({ id: testUser.id }, 201));
    },
    "POST /auth/login": (route) => route.fulfill(ok(testUser, 201)),
  });
  await page.goto("/auth/register");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByLabel("Confirm password").fill("secret123");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  expect(registered).toEqual({
    name: "Test User",
    email: testUser.email,
    password: "secret123",
  });
});

test("catches mismatched passwords before calling the API", async ({
  page,
}) => {
  let called = false;
  await mockApi(page, {
    "POST /auth/register": (route) => {
      called = true;
      return route.fulfill(ok({}, 201));
    },
  });
  await page.goto("/auth/register");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByLabel("Confirm password").fill("secret999");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText("Passwords do not match").first()).toBeVisible();
  expect(called).toBe(false);
});

test("shows the API's message when the email is taken", async ({ page }) => {
  await mockApi(page, {
    "POST /auth/register": (route) =>
      route.fulfill(fail(409, "Email is already registered")),
  });
  await page.goto("/auth/register");
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(testUser.email);
  await page.getByLabel("Password", { exact: true }).fill("secret123");
  await page.getByLabel("Confirm password").fill("secret123");
  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page.getByText("Email is already registered")).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/register$/);
});
