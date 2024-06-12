const fs = require('fs');
const path = require('path');
const $RefParser = require('@apidevtools/json-schema-ref-parser');

async function splitDefinitions(filePath) {
  try {
    const outputDir = path.join(__dirname, 'alt-fhir-oas');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Dereference the schema, handling circular references properly
    const schema = await $RefParser.dereference(filePath, {
      dereference: {
        circular: false,
        onDereference: (path, value) => // Callback invoked during dereferencing
        console.log(path, value)
      }
    });

    for (const [key, value] of Object.entries(schema.components.schemas)) {
      const filename = path.join(outputDir, `${key}-definition.json`);
      fs.writeFileSync(filename, JSON.stringify(value, null, 2), 'utf8');
      console.log(`Written ${key} to ${filename}`);
    }
  } catch (error) {
    console.error('Failed to process the schema:', error);
  }
}

splitDefinitions('./kyle/all-openapi.json');
