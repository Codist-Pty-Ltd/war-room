/** Default Claude model for problem + screening generation. Override via ANTHROPIC_MODEL. */
const DEFAULT_MODEL = "claude-sonnet-4-6";

function getAnthropicModel() {
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  return fromEnv || DEFAULT_MODEL;
}

module.exports = { DEFAULT_MODEL, getAnthropicModel };
