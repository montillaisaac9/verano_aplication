
import { authOptions } from "@/lib/auth"; // Correct import
import NextAuth from "next-auth"; // Correct import

// This is where NextAuth is actually initialized and the handlers are created.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };