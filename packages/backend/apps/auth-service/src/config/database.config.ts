export default () => ({
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/enterprise_sso',
  },
});
