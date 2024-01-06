/*
  title: French geocoding,
  description: A script that allows you to geocode (convert address to GPS coordinates) your **french** addresses (the API onyly recognizes addresses from France),
  Author: Benjamin Hatton
*/

const config = input.config({
    title: 'French geocoding',
    description: 'A script that allows you to geocode (convert address to GPS coordinates) your **french** addresses (the API onyly recognizes addresses from France)',
    items: [
        input.config.table('table', {
            label: 'Table',
            description: 'the table containing the addresses to geocode'
        }),
		input.config.view('view', {
            label: 'View',
            description: 'the appropriate view (you can for example create a filtered view ensuring that the address field is not empty)',
            parentTable: 'table',
        }),
		input.config.field('identifier', {
            label: 'Identifier',
			description : "a field allowing to identify a specific record",
            parentTable: 'table',
        }),
		input.config.field('address', {
            label: 'Address',
			description : "the field containing the address you want to geocode",
            parentTable: 'table',
        }),
        input.config.field('lat', {
            label: 'Latitude',
			description : 'the field that will store the latitude returned by the geocoding (**number type**)',
            parentTable: 'table',
        }),
        input.config.field('lon', {
            label: 'Longitude',
			description : 'the field that will store the longitude returned by the geocoding (**number type**)',
            parentTable: 'table',
        }),
		input.config.number('scoreMinLimit', {
            label: 'Score minimum limit value (reliability percent of the geocoding)',
			description: "a value (between 0 and 1) below which the geocoding will be considered potentially problematic (by default 0.6)",
        }),
        input.config.select('writeScore', {
            label: 'Save score',
            description: 'do you want to store this geocoding score for each record ? Options are Yes or No',
            options: [
                {label: 'Yes', value: 'yes'},
                {label: 'No', value: 'no'}
            ]
        }),
		input.config.field('score', {
            label: 'Score',
			description: "if you actually want to store the score, the column (of **number/percent type**) used  for this data. If you don't want, fill any field, it won't be used",
            parentTable: 'table',
        })
    ]
});

const table = config.table;
const view = config.view;
const identifier = config.identifier;
const address = config.address;
const lat = config.lat;
const lon = config.lon
const scoreMinLimit = config.scoreMinLimit;
const writeScore = config.writeScore;
const score = config.score;

var progress = 25;
const progressBar=['◔','◑','◕','⚫'];
var underLimitScores=[];

function timeout(ms) {
       return new Promise(resolve => setTimeout(resolve, ms));
}

async function nextBlock(queryResult, startIdx) {
  var i=startIdx
  for (i; i<Math.min(queryResult.records.length,startIdx+40);i++) {
      let record = queryResult.records[i];
      var percent = i/(queryResult.records.length-1)*100;
        if (percent>=progress) {
			output.clear();
            output.text("Progression : "+progressBar[(progress/25)-1]+" "+progress+"%");
            progress += 25;
        }
      if (record.getCellValueAsString(address.name)!="" && (record.getCellValueAsString(lat.name)=="" || record.getCellValueAsString(lon.name)=="")){
          var zipFound = false;
          var zipCode = record.getCellValueAsString(address.name).match(/\d{5}/);
          if (zipCode.length ==1 && zipCode[0].length == 5 && !isNaN(Number(zipCode[0]))) {
              zipCode = zipCode[0];
              zipFound = true;
          }
          if (zipFound) {
            var request = "https://api-adresse.data.gouv.fr/search/?q="+encodeURI(record.getCellValueAsString(address.name).trim().replaceAll(' ','+'))+"&postcode="+zipCode+"&autocomplete=0&limit=1";
            var data = await fetch(request)
                .then(response => response.json())
                .catch(err => console.error(err));
          }
          if(!zipFound || zipFound && data.features.length==0) { // Essai sans le code postal
              request = "https://api-adresse.data.gouv.fr/search/?q="+encodeURI(record.getCellValueAsString(address.name).trim().replaceAll(' ','+'))+"&autocomplete=0&limit=1";
              data = await fetch(request)
                .then(response => response.json())
                .catch(err => console.error(err));
          }
   
          if (data.features[0].properties.score<scoreMinLimit) {
            underLimitScores.push({"identifier": record.getCellValueAsString(identifier.name).trim(), "address": record.getCellValueAsString(address.name).trim(), "score": Math.round(data.features[0].properties.score*100)/100, "lat": data.features[0].geometry.coordinates[1],"lon": data.features[0].geometry.coordinates[0], "checkLink" : "https://www.openstreetmap.org/?mlat="+data.features[0].geometry.coordinates[1]+"&mlon="+data.features[0].geometry.coordinates[0]+"#map=13/"+data.features[0].geometry.coordinates[1]+"/"+data.features[0].geometry.coordinates[0]});
          }
		  if (writeScore == "yes") {
			await table.updateRecordsAsync([
				  {
					  id: record.id,
					  fields: {
						  [lat.name]: Number(data.features[0].geometry.coordinates[1]),
						  [lon.name]: Number(data.features[0].geometry.coordinates[0]),
						  [score.name]: data.features[0].properties.score
					  }
				  }
			]);
		   }
		  else {
			await table.updateRecordsAsync([
				  {
					  id: record.id,
					  fields: {
						  [lat.name]: Number(data.features[0].geometry.coordinates[1]),
						  [lon.name]: Number(data.features[0].geometry.coordinates[0])
					  }
				  }
			]);
		  }
      }
  }
  if (i<queryResult.records.length-1) {
      await timeout(1500);
  	  await nextBlock(queryResult, i); 
  }
};

if (lat.type != 'number' || lon.type != 'number' || (writeScore == 'yes' && score.type != 'percent')) {
    if (lat.type != 'number') { output.markdown("**⚠ The "+lat.name+" field is not of _number_ type! Please modify it or choose another number type field**"); }
    if (lon.type != 'number') { output.markdown("**⚠ The "+lon.name+" field is not of _number_ type! Please modify it or choose another number type field**"); }
    if (writeScore == 'yes' && score.type != 'percent') { ("**⚠ The "+score.name+" field is not of _percent_ type! Please modify it or choose another percent type field**"); }
}
else {
	let queryResult = await view.selectRecordsAsync({fields: [identifier, address, lat, lon]});
	output.text("There are "+queryResult.records.length.toString() + " elements in the view");
	output.text("Please wait while addresses are being geocoded...");

	await nextBlock(queryResult, 0);

	output.markdown("**Geocoding achieved !** Please keep in mind that geocoding is not an exact science, please verify your data.")
	if (underLimitScores.length>0) {
		output.markdown('⚠ Pay particular attention to the following items' geocoding :")
        for (let m=0;m<underLimitScores.length;m++) {
            output.markdown("**"+underLimitScores[m]["identifier"]+"**");
            output.table([{Adresse: underLimitScores[m]["address"], Latitude: underLimitScores[m]["lat"], Longitude: underLimitScores[m]["lon"], score: underLimitScores[m]["score"]}]);
            output.markdown("[Check link]("+underLimitScores[m]["checkLink"]+")")
        }
	}
	output.markdown("_Script successfully completed_");
}
