function getEnv(name: string, minLen = 32): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  if (v.length < minLen) throw new Error(`${name} is too short (min ${minLen} chars)`);
  return v;
}

export default {
  jwtSecret: getEnv('JWT_SECRET', 32),
};
