const fs = require('fs');
const path = require('path');
const convert = require('json-schema-to-openapi-schema');

// Define input and output directories
const inputDir = path.join(__dirname, 'fhir-definitions');
const outputDir = path.join(__dirname, 'fhir-definitions-oas');

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to convert JSON Schema to OpenAPI Schema and save the output
const convertSchema = async (inputPath, outputPath) => {
  const schema = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const openApiSchema = await convert(schema);
  fs.writeFileSync(outputPath, JSON.stringify(openApiSchema, null, 2), 'utf8');
};

// Read the input directory and process each file
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err.message}`);
    return;
  }

  files.forEach(file => {
    const inputFilePath = path.join(inputDir, file);
    const outputFilePath = path.join(outputDir, file);

    // Check if the file is a JSON file
    if (path.extname(file) === '.json') {
      convertSchema(inputFilePath, outputFilePath)
        .then(() => console.log(`Converted: ${file}`))
        .catch(error => console.error(`Error converting ${file}: ${error.message}`));
    }
  });
});
