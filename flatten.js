const fs = require('fs');
const path = require('path');

// Function to flatten the schema
function flattenAllOf(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => flattenAllOf(item));
  } else if (typeof obj === 'object' && obj !== null) {
    if (obj.hasOwnProperty('allOf')) {
      let flattened = {};
      obj.allOf.forEach(item => {
        item = flattenAllOf(item);
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            if (flattened.hasOwnProperty(key)) {
              if (typeof flattened[key] === 'object' && !Array.isArray(flattened[key])) {
                flattened[key] = { ...flattened[key], ...item[key] };
              } else if (Array.isArray(flattened[key]) && Array.isArray(item[key])) {
                flattened[key] = flattened[key].concat(item[key]);
              } else {
                flattened[key] = item[key];
              }
            } else {
              flattened[key] = item[key];
            }
          }
        }
      });
      delete obj.allOf;
      obj = { ...obj, ...flattened };
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = flattenAllOf(obj[key]);
      }
    }
  }
  return obj;
}

// Folder paths
const inputFolder = './alt-fhir-oas';
const outputFolder = './alt-fhir-oas-flattened';

// Ensure the output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder, { recursive: true });
}

// Read all files in the input folder
fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error('Error reading input folder:', err);
    return;
  }

  files.forEach(file => {
    const filePath = path.join(inputFolder, file);
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Flatten the schema
    const flattenedSchema = flattenAllOf(schema);
    delete flattenedSchema.discriminator;
    if (flattenedSchema.properties?.resourceType) {
      const resourceTypeRegex = /([^/]+)-definition\.json$/;
      const match = filePath.match(resourceTypeRegex);
      if (match) {
        const resourceType = match[1];
        flattenedSchema.properties.resourceType.enum = [resourceType];

      } else {
        console.log(`No match for file ${filePath}`);
      }
    }
    if (flattenedSchema.properties?.contained?.items?.discriminator) {
      delete flattenedSchema.properties.contained.items.discriminator;
    }
    // Save the flattened schema to a new file
    const flattenedFilePath = path.join(outputFolder, file);
    fs.writeFileSync(flattenedFilePath, JSON.stringify(flattenedSchema, null, 2));

    //console.log(`Flattened schema saved to ${flattenedFilePath}`);
  });
});
