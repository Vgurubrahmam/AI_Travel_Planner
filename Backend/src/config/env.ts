import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY: string;
  NODE_ENV: string;
}

const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];

// Validate that all required environment variables are set
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`ERROR: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  NODE_ENV: process.env.NODE_ENV || 'development',
};
