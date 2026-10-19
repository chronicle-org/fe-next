// Server-only: set SIGNUP_ENABLED=false (e.g. in Vercel env vars) to hide sign up.
export const isSignupEnabled = () => process.env.SIGNUP_ENABLED !== "false";
