const test = require("node:test");
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const Ajv = require("ajv");

const ajv = new Ajv({schemaId: 'id'});
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const requestContextSchema = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "./Request-Context.json"))
);

const validSystemRequestContext = {
  userIdentifier: "1b8200d7-3a8c-4fb6-8e5c-cec4540999d5", // oAuth client id
  userRole: "110150", // (Application)
  purposeOfUse: ["SYSDEV"],
  userFullName: "Sample PMS Integration Application",
};

const validPractitionerUserRequestContext = {
  userIdentifier: "pms-id-123",
  userRole: "PROV",
  secondaryIdentifier: {
    use: "official",
    system: "https://standards.digital.health.nz/ns/hpi-person-id",
    value: "99ZZZS",
  },
  purposeOfUse: ["POPHLTH"],
  userFullName: "Beverly Crusher",
  orgIdentifier: "G00001-G",
  facilityIdentifier: "FZZ999-B",
};

const validator = ajv.compile(requestContextSchema);

// START system tests
test("valid system request context should validate", (t) => {
  const valid = validator(validSystemRequestContext);
  assert.strictEqual(valid, true, "Expected data to be valid");
});

test("system request without a userIdentifier should NOT validate", (t) => {
  const invalidData = { ...validSystemRequestContext };
  delete invalidData.userIdentifier;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});

test("system request without a purposeOfUse should NOT validate", (t) => {
  const invalidData = { ...validSystemRequestContext };
  delete invalidData.purposeOfUse;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});

test("system request without a userFullName should NOT validate", (t) => {
  const invalidData = { ...validSystemRequestContext };
  delete invalidData.userFullName;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});

// END system tests

// START practitioner tests
test("valid practitioner request context should validate", (t) => {
  const valid = validator(validPractitionerUserRequestContext);
  assert.strictEqual(valid, true, "Expected data to be valid");
});

test("practitioner request context without a userIdentifier should NOT validate", (t) => {
  const invalidData = { ...validPractitionerUserRequestContext };
  delete invalidData.userIdentifier;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});

test("practitioner request context without a purposeOfUse should NOT validate", (t) => {
  const invalidData = { ...validPractitionerUserRequestContext };
  delete invalidData.purposeOfUse;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});

test("practitioner request context without a userFullName should NOT validate", (t) => {
  const invalidData = { ...validPractitionerUserRequestContext };
  delete invalidData.userFullName;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});

test("practitioner request context without a secondaryIdentifier should NOT validate", (t) => {
  const invalidData = { ...validPractitionerUserRequestContext };
  delete invalidData.secondaryIdentifier;
  const valid = validator(invalidData);
  assert.strictEqual(valid, false, "Expected data to be invalid");
});
