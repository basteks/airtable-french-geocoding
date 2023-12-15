# Airtable French geocoding
An Airtable script that allows you to geocode your **french** addresses (the API only recognizes addresses from France (see Credits below), based on the [Airtable Extensions](https://support.airtable.com/docs/airtable-extensions-overview).

## Usage
- the content of the address_geocoding.js file needs to be copied in a new Scripting Extension in your Airtable base (warning, Extensions are not available with free plan !)

## Credits
Based on the [national French Address API](https://adresse.data.gouv.fr/api-doc/adresse). Please keep in mind that this API has a rate limit of 50 calls/sec/IP. This script ensures that you don't reach this limit.
