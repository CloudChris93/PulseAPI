const crypto = require("crypto");

const generateProjectKey = () => {
  const randomPart = crypto.randomBytes(24).toString("hex");

  return `pulse_${randomPart}`;
};

module.exports = generateProjectKey;
