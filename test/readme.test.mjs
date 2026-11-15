// The README is part of the lecture: students use it to play both versions and to see
// the exact prompt that started this one.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const promptSection = () => {
  const start = readme.indexOf("## The Prompt");
  assert.ok(start >= 0, "missing '## The Prompt' section");
  return readme.slice(start, readme.indexOf("\n## ", start + 1));
};

test("the README links to both playable versions and to Runny Hound 1's source", () => {
  for (const url of [
    "https://lvsoftworks.com/demos/runny_hound_1",
    "https://lvsoftworks.com/demos/runny_hound_2",
    "https://github.com/msarro/Runny_Hound_1",
  ]) {
    assert.ok(readme.includes(url), url);
  }
});

test("the prompt is shown word for word in a code block", () => {
  const section = promptSection();
  assert.match(section, /```text\n[\s\S]*I want you to create a simple web based game\.[\s\S]*```/);
});

test("the prompt is the one that actually started the project", () => {
  const section = promptSection();
  assert.ok(
    section.includes(
      "13. Create AGENTS.md to assist all users of this repo so that the same rules are followed.",
    ),
  );
  assert.ok(
    !section.includes("13. Create AGENTS.md from AGENTS_TEMPLATE.md"),
    "first, withdrawn version",
  );
});

test("the README points to the prompt this one grew into", () => {
  assert.ok(readme.includes("https://github.com/msarro/AI_Repo_Setup_Prompt"));
});
