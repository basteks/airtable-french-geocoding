# Airtable French geocoding

A script that allows you to geocode (convert address to GPS coordinates) your **french** addresses (the API onyly recognizes addresses from France), based on the [Airtable Extensions](https://support.airtable.com/docs/airtable-extensions-overview).

## Usage
- the content of the french-geocoding-airtable.js file needs to be copied in a new [Scripting Extension](https://support.airtable.com/docs/en/scripting-extension-overview) in your Airtable base (warning, Extensions are not available with free plan !)

Once you create your Extension, access the settings page by clicking the gear icon that appears when hovering over the upper right corner.
Here are the available settings :
- *Table*: the table containing the addresses to geocode
- *View*: the appropriate view (you can for example create a filtered view ensuring that the address field is not empty)
- *Identifier*: a field allowig to identify a specific record
- *Address*: the field containing the address you want to geocode
- *Latitude*: the field that will store the latitude returned by the geocoding (**number type**)
- *Longitude*: the field that will store the longitude returned by the geocoding (**number type**)
- *Score minimum limit value (reliability percent of the geocoding)*: a value (between 0 and 1) below which the geocoding will be considered potentially problematic (by default I use 0.6)
- *Save score*: do you want to store this geocoding score for each row ? The options are _yes_ or _no_
- *Score*: if you actually want to store the score, the column (of **number/percent type**) used  for this data

## Limitations
Please keep in mind that use of the french [Address API](https://adresse.data.gouv.fr/api-doc/adresse) is subject to a limit of 50 calls/sec/IP. The script is designed not to exceed this limit.

## Credits
This script uses the french [Address API](https://adresse.data.gouv.fr/api-doc/adresse).
