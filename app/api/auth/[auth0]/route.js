// app/api/auth/[auth0]/route.js
import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

const Url = process.env.NEXT_PUBLIC_BASE_URL;

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: "http://localhost:3000",
      scope: "openid profile email ",
    },
    returnTo: `${Url}/admin/dashboard`,
  }),
});
