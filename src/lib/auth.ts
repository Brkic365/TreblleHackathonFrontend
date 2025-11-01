import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth provider - only add if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    // GitHub OAuth provider - only add if credentials are available
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
    // Credentials provider - always available
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call Next.js API route which securely handles backend authentication
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/internal-auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: credentials.email,
              password: credentials.password 
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            console.log('🔑 Credentials Auth Response:', {
              hasToken: !!data.token,
              hasUser: !!data.user,
              userId: data.user?.id,
              tokenPreview: data.token ? `${data.token.substring(0, 20)}...` : 'none'
            });
            
            if (data.token && data.user) {
              return {
                id: data.user.id,
                email: data.user.email,
                name: data.user.name || data.user.email.split('@')[0],
                accessToken: data.token, // Store backend JWT
              };
            } else {
              console.error('No token or user in backend response:', data);
              return null;
            }
          } else {
            const errorText = await response.text();
            console.error('Credentials backend authentication failed:', response.status, errorText);
            return null;
          }
        } catch (error) {
          console.error('Credentials backend authentication error:', error);

          // Allow mock authentication for demo account when backend is unavailable
          if (credentials.email === 'demo@runtime.com' && credentials.password === 'demo123') {
            return {
              id: "demo-user",
              email: "demo@runtime.com",
              name: "Demo User",
              accessToken: "mock-token", // Mock token for demo only
            };
          }
          
          // For all other cases, fail authentication
          console.error('❌ Authentication failed - backend unavailable and not demo account');
          return null;
        }
      }
    })
  ],
  
  // Debug: Log what providers are registered
  debug: true,
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      // For OAuth providers, we need to check if user exists or create them
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const baseUrl = process.env.NEXTAUTH_URL || '';
          const requestUrl = `${baseUrl}/api/internal-auth/session`;
          
          console.log('🔐 OAuth Sign In:', {
            provider: account.provider,
            email: user.email,
            name: user.name
          });
          
          // First, try to get existing user
          let response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          });

          if (response.ok) {
            const data = await response.json();
            
            console.log('🔑 OAuth Session Response:', {
              hasToken: !!data.token,
              hasUser: !!data.user,
              userId: data.user?.id,
              tokenPreview: data.token ? `${data.token.substring(0, 20)}...` : 'none'
            });
            
            // Store the backend token in the user object
            if (data.token) {
              user.accessToken = data.token;
              user.id = data.user.id; // Use existing user ID

              if(data.user.name) {
                user.name = data.user.name;
              }
            } else {
              console.error('No token in backend response:', data);
              throw new Error('No token received from backend');
            }
          } else if (response.status === 404) {
            // User doesn't exist, create them
            console.log('User not found, creating new user for OAuth:', user.email);
            
            const createUserUrl = `${baseUrl}/api/internal-auth/oauth-user`;
            const createResponse = await fetch(createUserUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                email: user.email,
                name: user.name || user.email.split('@')[0],
                provider: account.provider,
                providerId: account.providerAccountId
              }),
            });

            if (createResponse.ok) {
              const createData = await createResponse.json();
              
              console.log('🔑 OAuth User Creation Response:', {
                hasToken: !!createData.token,
                hasUser: !!createData.user,
                userId: createData.user?.id,
                tokenPreview: createData.token ? `${createData.token.substring(0, 20)}...` : 'none'
              });
              
              user.accessToken = createData.token;
              user.id = createData.user.id;

              if(createData.user.name) {
                user.name = createData.user.name;
              }
              console.log('✅ OAuth user created successfully:', createData.user.id);
            } else {
              const errorText = await createResponse.text();
              console.error('Failed to create OAuth user:', createResponse.status, errorText);
              throw new Error(`Failed to create user: ${createResponse.status} ${errorText}`);
            }
          } else {
            const errorText = await response.text();
            console.error('OAuth backend authentication failed:', response.status, errorText);
            throw new Error(`Backend auth failed: ${response.status} ${errorText}`);
          }
        } catch (error) {
          console.error('OAuth backend authentication error:', error);
          
          // For debugging - allow OAuth without backend token temporarily
          user.accessToken = 'oauth-debug-token';
        }
      }

      return true; // Allow sign in
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        // Pass the backend JWT token to the session
        session.accessToken = token.accessToken;
      }
      
      console.log('📦 Session Callback:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!token,
        hasAccessToken: !!token?.accessToken,
        accessTokenPreview: token?.accessToken ? `${token.accessToken.substring(0, 20)}...` : 'none',
        userId: session?.user?.id
      });
      
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
        // Store the backend JWT token (works for both credentials and OAuth)
        token.accessToken = user.accessToken;
        
        console.log('🎫 JWT Callback (user provided):', {
          userId: user.id,
          hasAccessToken: !!user.accessToken,
          accessTokenPreview: user.accessToken ? `${user.accessToken.substring(0, 20)}...` : 'none'
        });
      } else {
        console.log('🎫 JWT Callback (no user):', {
          hasToken: !!token,
          hasAccessToken: !!token?.accessToken,
          accessTokenPreview: token?.accessToken ? `${token.accessToken.substring(0, 20)}...` : 'none'
        });
      }
      
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
}
