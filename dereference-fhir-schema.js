const $RefParser = require('json-schema-ref-parser');
const fs = require('fs');
const path = require('path');

const baseSchema = require('./fhir.schema.json');

const schemaUrl = 'https://hl7.org/fhir/R4/fhir.schema.json';


// Function to handle circular references
function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      if(value == null){
        return
      } else {
        return value;
      }
    };
  }



  function findCircularReferences(obj) {
    const seenObjects = new WeakMap();
    const paths = [];
  
    function detect(obj, currentPath) {
      if (typeof obj === 'object' && obj !== null) {
        if (seenObjects.has(obj)) {
          paths.push(seenObjects.get(obj));
          return;
        }
        seenObjects.set(obj, currentPath);
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            detect(obj[key], `${currentPath}.${key}`);
          }
        }
      }
    }
  
    detect(obj, '');
    return paths;
  }


async function addJsonSchema(file){
  let data = fs.readFileSync(file);
  data = JSON.parse(data);
  //data = await $RefParser.parse(data);
  data.$schema = "http://json-schema.org/draft-06/schema#";
  data.id = "http://hl7.org/fhir/json-schema/5.0";
  data = JSON.stringify(data);
  fs.writeFileSync(file, data);
}

async function dereferenceSchema(baseSchema) {
  try {
    // Load and dereference the schema
    const schema = await $RefParser.dereference(schemaUrl);
    //const schemaString = await $RefParser.bundle(schema);
    const schemaObj = await $RefParser.parse(schema);

    Object.keys(schemaObj.definitions).forEach((entry) => {
      //if(entry == "Observation") {
      let defObject = (schemaObj.definitions[entry]);
      //console.log(entry);
      //if(entry === "Contained" || entry == "Bundle") {
      try {
        switch(entry){
          case "Contained":
            try {
              delete defObject.properties.contained
              console.log("Contained");
            } catch (e) {
              console.log(e);
            }
          case "Bundle":
            try {
              delete defObject.properties.contained.
              console.log("Bundle");
              //find the nested resource
              //console.log(defObject.properties.entry.items.properties.resource.oneOf[])
              let bundle = defObject.properties.entry.items.properties.resource.oneOf.find(el => el.properties.resourceType.const === "Bundle");
              //console.log(bundle);
              //console.log(defObject.properties.entry.items.properties.resource.oneOf);
            } catch (e) {
              console.log(e);
            }
        }
        delete defObject.properties.contained
      } catch (e) {
        console.log(e);
      }
    //}
      defObject = JSON.stringify(defObject, getCircularReplacer(), 2);
      defObject = '{' + '"$schema":"http://json-schema.org/draft-06/schema#","$id":"http://hl7.org/fhir/json-schema/5.0",' + defObject.substr(1);
      console.log("Writing schema file for " + entry);
      let outputFilePath = path.join(__dirname, 'fhir-definitions/'+entry+'-definition.json');
      fs.writeFileSync(outputFilePath, defObject);
      //addJsonSchema(outputFilePath);
      //console.log(defObject);
    //}
    });


    //console.log(schemaObj.definitions.Observation);

    //console.log(JSON.stringify(schema));
    
    //const schema = fs.readFile(schemaFile);

    // Find circular references
    // const circularPaths = findCircularReferences(schema);
    // if (circularPaths.length > 0) {
    //   console.log('Circular references found at paths:', circularPaths);
    //   const circsFilePath = path.join(__dirname, 'circs.json');
    //   fs.writeFileSync(circsFilePath, JSON.stringify(circularPaths));
    // } else {
    //   console.log('No circular references found.');
    // }
    // Convert the bundled schema to a JSON string with circular reference handling
    //const schemaString = JSON.stringify(noCircSchema, getCircularReplacer(), 2);
    // Convert the dereferenced schema to a JSON string
    // const schemaString = JSON.stringify(schema, getCircularReplacer(), 2);
    //const schemaString = JSON.stringify(schema, null, 2);

    // Write the dereferenced schema to a file
    //const outputFilePath = path.join(__dirname, 'dereferenced-schema3.json');
    //fs.writeFileSync(outputFilePath, schemaString);

    //console.log('Schema dereferenced successfully. Output saved to:', outputFilePath);
  } catch (error) {
    console.error('Error dereferencing schema:', error);
  }
}

dereferenceSchema(baseSchema);
