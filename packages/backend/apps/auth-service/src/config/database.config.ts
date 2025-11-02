export default () => ({
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/enterprise_sso',
  },
});
