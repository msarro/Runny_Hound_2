// License rules for dependencies. The allowed list lives in license-policy.json.
// Anything not on that list, including a missing or unreadable license, is rejected.

function tokenize(expression) {
  return expression.replace(/[()]/g, " $& ").trim().split(/\s+/).filter(Boolean);
}

// Evaluates an SPDX license expression such as "(MIT OR Apache-2.0) AND ISC".
// AND binds tighter than OR. "X WITH Y" is only allowed if "X WITH Y" itself is listed.
export function isLicenseAllowed(expression, allowed) {
  const tokens = tokenize(String(expression ?? ""));
  if (tokens.length === 0) return false;
  let pos = 0;

  const parseOr = () => {
    let result = parseAnd();
    while (tokens[pos] === "OR") {
      pos++;
      const right = parseAnd();
      result = result || right;
    }
    return result;
  };
  const parseAnd = () => {
    let result = parseTerm();
    while (tokens[pos] === "AND") {
      pos++;
      const right = parseTerm();
      result = result && right;
    }
    return result;
  };
  const parseTerm = () => {
    const token = tokens[pos++];
    if (token === undefined) throw new Error("unexpected end");
    if (token === "(") {
      const result = parseOr();
      if (tokens[pos++] !== ")") throw new Error("missing )");
      return result;
    }
    if (["AND", "OR", "WITH", ")"].includes(token)) throw new Error(`unexpected ${token}`);
    if (tokens[pos] === "WITH") {
      const exception = tokens[pos + 1];
      pos += 2;
      return allowed.includes(`${token} WITH ${exception}`);
    }
    return allowed.includes(token);
  };

  try {
    const result = parseOr();
    return pos === tokens.length && result;
  } catch {
    return false;
  }
}

// Turns a CycloneDX component's license entries into one SPDX expression.
// Several entries are treated as AND: every one of them must be allowed.
function componentExpression(component) {
  const parts = (component.licenses ?? []).map(
    (entry) => entry.expression ?? entry.license?.id ?? entry.license?.name ?? "",
  );
  if (parts.length === 0) return null;
  return parts.map((p) => `(${p})`).join(" AND ");
}

export function findLicenseViolations(sbom, policy) {
  const violations = [];
  for (const component of sbom.components ?? []) {
    const expression = componentExpression(component);
    if (expression === null) {
      violations.push({
        name: component.name,
        version: component.version,
        license: "no license declared",
      });
    } else if (!isLicenseAllowed(expression, policy.allowed)) {
      const shown = component.licenses
        .map((e) => e.expression ?? e.license?.id ?? e.license?.name)
        .join(" AND ");
      violations.push({ name: component.name, version: component.version, license: shown });
    }
  }
  return violations;
}
