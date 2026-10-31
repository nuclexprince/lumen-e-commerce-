import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      // Admin area requires ADMIN role
      if (path.startsWith("/admin/dashboard")) {
        return token?.role === "ADMIN";
      }
      // Account area just requires a session
      if (path.startsWith("/account")) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/dashboard/:path*", "/account/:path*", "/account"],
};
