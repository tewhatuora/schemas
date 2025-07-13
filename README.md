<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tewhatuora/schemas">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./static/img/two-dark-theme-logo.svg">
      <img alt="Health New Zealand Te Whatu Ora Logo" src="./static/img/two.svg" width="50%">
    </picture>
  </a>

  <h3 align="center">Health New Zealand | Schemas</h3>

  <p align="center">
    This GitHub project is the source repository for various schemas used across Health New Zealand Te Whatu Ora APIs.
    <br />
    <br />
  </p>
</div>

### Request-Context header

Some API requests **MUST** include the HNZ `Request-Context` custom HTTP header which supplies identifiers for the health user and organisation, or system behind the API request.

This context is supplied using the `Request-Context` custom HTTP header in the form of a base64-encoded JSON object.

The value of the header has differing forms based on the type of request being made, namely whether it is in a user context (e.g. a clinical user searching for patient records), or a system context (e.g. a system submitting data to the API in a bulk load scenario). To determine the correct values, consult the project team for the API you are integrating with.

**The below are some examples for the header values, though these will differ on a project by project basis.**

#### Requests with User context
| **Context property**     | **Mandatory** | **Value**                                                                                                                          |
|:-------------------------|:------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `userIdentifier`         | Yes         | The userid of the user as authenticated by the PMS/health application                                                                                   |
| `secondaryIdentifier`    | Yes         | The secondary identifier for the user - this **MUST** be the end users Common Person Number (aka HPI Practitioner identifier) of the practitioner using the application where available. Otherwise, any secondary identifier that is held for the user |
| `purposeOfUse`           | Yes         | One of [ "PATRQT", "POPHLTH", "TREAT", "ETREAT", "PUBHLTH", "SYSDEV" ]. For descriptions of the values, see [Audit Events](https://fhir-ig.digital.health.nz/auditevents/ValueSet-purposeofuse.html)                                                                                 |
| `userFullName`           | Yes         | Full name of the user of the PMS/health application.                                                                                                     |
| `userRole`               | Yes         | Role of the user of the PMS/health application. Set to `"PROV"` (Provider) or `"PAT"` (Patient)                                                         |
| `orgIdentifier`          | No (preferred)         | The HPI Organisation Number (aka HPI Organisation identifier) for the organisation in which the API consumer application is deployed                     |
| `facilityIdentifier`     | No (preferred)         | HPI identifier for the facility where the user is located                                                                                                |

#### Requests with System context
| **Context property**     | **Mandatory** | **Value**                                                                                                                          |
|:-------------------------|:------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------|
| `userIdentifier`         | Yes         | The oAuth clientId of the system submitting data to the API                                                                                   |
| `purposeOfUse`           | Yes         | [ "SYSDEV" ]. For descriptions of the values, see [Audit Events](https://fhir-ig.digital.health.nz/auditevents/ValueSet-purposeofuse.html)                                                                              |
| `userFullName`           | Yes         | Name of the PMS/health application.                                                                                                    |
| `userRole`               | Yes         | Role of the PMS/health application. Set to `"110150"` (Application)                                                 |

  A schema definition and examples for `Request-Context` can be [found here](./json-schema/Request-Context.json)

  #### Example Request-Context Header Payload for a clinical user searching for a patient's Conditions
  **Base64 Encoded**
  ```
  ewogICJ1c2VySWRlbnRpZmllciI6ICJwbXMtaWQtMTIzIiwKICAidXNlclJvbGUiOiAiUFJPViIsCiAgInNlY29uZGFyeUlkZW50aWZpZXIiOiB7CiAgICAidXNlIjogIm9mZmljaWFsIiwKICAgICJzeXN0ZW0iOiAiaHR0cHM6Ly9zdGFuZGFyZHMuZGlnaXRhbC5oZWFsdGgubnovbnMvaHBpLXBlcnNvbi1pZCIsCiAgICAidmFsdWUiOiAiOTlaWlpTIgogIH0sCiAgInB1cnBvc2VPZlVzZSI6IFsKICAgICJQT1BITFRIIgogIF0sCiAgInVzZXJGdWxsTmFtZSI6ICJCZXZlcmx5IENydXNoZXIiLAogICJvcmdJZGVudGlmaWVyIjogIkcwMDAwMS1HIiwKICAiZmFjaWxpdHlJZGVudGlmaWVyIjogIkZaWjk5OS1CIgp9
  ```
  **Decoded JSON**
  ```json
  {
    "userIdentifier": "pms-id-123",
    "userRole": "PROV",
    "secondaryIdentifier": {
      "use": "official",
      "system": "https://standards.digital.health.nz/ns/hpi-person-id",
      "value": "99ZZZS"
    },
    "purposeOfUse": [
      "POPHLTH"
    ],
    "userFullName": "Beverly Crusher",
    "orgIdentifier": "G00001-G",
    "facilityIdentifier": "FZZ999-B"
  }
  ```

  #### Example Request-Context Header Payload for a system submitting data to the API, where there is no end user
  **Base64 Encoded**
  ```
  ICB7CiAgICAidXNlcklkZW50aWZpZXIiOiAiMWI4MjAwZDctM2E4Yy00ZmI2LThlNWMtY2VjNDU0MDk5OWQ1IiwKICAgICJ1c2VyUm9sZSI6ICIxMTAxNTAiLAogICAgInB1cnBvc2VPZlVzZSI6IFsKICAgICAgIlNZU0RFViIKICAgIF0sCiAgICAidXNlckZ1bGxOYW1lIjogIlNhbXBsZSBQTVMgSW50ZWdyYXRpb24gQXBwbGljYXRpb24iCiAgfQ==
  ```
  **Decoded JSON**
  ```json
  {
    "userIdentifier": "1b8200d7-3a8c-4fb6-8e5c-cec4540999d5",
    "userRole": "110150",
    "purposeOfUse": [
      "SYSDEV"
    ],
    "userFullName": "Sample PMS Integration Application"
  }
  ```
