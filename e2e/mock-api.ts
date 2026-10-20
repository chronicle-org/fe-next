import type { Page, Route } from "@playwright/test";
import { MOCK_API_URL } from "../playwright.config";

export const testUser = {
  id: 1,
  name: "Test User",
  email: "test@example.com",
  handle: "testuser",
  created_at: "2026-10-01T00:00:00.000Z",
  access_token: "test-token",
  following: [],
  following_count: 0,
  followers: [],
  followers_count: 0,
  likes: [],
  likes_count: 0,
  bookmarks: [],
  bookmarks_count: 0,
};

type Handler = (route: Route) => unknown;

/** Wraps a body the way the API's ResponseInterceptor does. */
export const ok = (content: unknown, statusCode = 200) => ({
  status: statusCode,
  contentType: "application/json",
  body: JSON.stringify({ content, message: "Success", errors: [], statusCode }),
});

export const fail = (statusCode: number, message: string) => ({
  status: statusCode,
  contentType: "application/json",
  body: JSON.stringify({ statusCode, message, error: message }),
});

const emptyPage = { data: [], total: 0 };

/**
 * Answers every call to the API. `handlers` are keyed by "METHOD /path"
 * (no query string); anything else gets an empty page, so lists render empty.
 */
export async function mockApi(
  page: Page,
  handlers: Record<string, Handler> = {},
) {
  // The notification socket has nothing to connect to.
  await page.routeWebSocket(/socket\.io/, () => {});
  await page.route(`${MOCK_API_URL}/**`, (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const handler = handlers[`${request.method()} ${pathname}`];
    if (handler) return handler(route);
    return route.fulfill(ok(emptyPage));
  });
}

/** Starts the page logged in as testUser, as a successful login would. */
export async function logIn(page: Page) {
  await page.context().addCookies([
    {
      name: "chronicle_access_token_local",
      value: encodeURIComponent(JSON.stringify(testUser)),
      url: "http://localhost:3100",
    },
  ]);
}
