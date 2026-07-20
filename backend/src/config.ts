const required = (key: 'DATABASE_URL' | 'JWT_SECRET') => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is required`);
  return value;
};

export const config = {
  databaseUrl: () => required('DATABASE_URL'),
  jwtSecret: () => required('JWT_SECRET'),
  port: () => Number(process.env.PORT || 3000),
};
