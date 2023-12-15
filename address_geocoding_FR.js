const config = input.config({
    title: 'Géocodage',
    description: 'Un script qui convertit vos adresses françaises en coordonnées GPS',
    items: [
        input.config.table('table', {
            label: 'Table',
            description: 'La table dans laquelle se trouvent les adresses à géocoder'
        }),
		input.config.view('view', {
            label: 'Vue',
            description: 'La vue contenant les adresses',
            parentTable: 'table',
        }),
		input.config.field('identifier', {
            label: 'Identifiant',
			description : "Un champ permettant d'identifer la saisie (par exemple Nom, Id, etc.)",
            parentTable: 'table',
        }),
		input.config.field('address', {
            label: 'Adresse',
			description : "Le champ contenant l'adresse à géocoder",
            parentTable: 'table',
        }),
        input.config.field('lat', {
            label: 'Latitude',
			description : 'Le champ contenant la latitude (de type nombre)',
            parentTable: 'table',
        }),
        input.config.field('lon', {
            label: 'Longitude',
			description : 'Le champ contenant la longitude (de type nombre)',
            parentTable: 'table',
        }),
		input.config.number('scoreMinLimit', {
            label: 'Valeur limite du "score" (pourcentage de fiabilité du géocodage)',
			description: "Indiquez la valeur (comprise entre 0 et 1) en dessous de laquelle le géocodage sera considéré comme potentiellement problématique (par défaut 0.6)",
        }),
        input.config.select('writeScore', {
            label: 'Enregistrement du score',
            description: 'Souhaitez-vous stocker le score ?',
            options: [
                {label: 'Oui', value: 'yes'},
                {label: 'Non', value: 'no'}
            ]
        }),
		input.config.field('score', {
            label: 'Score',
			description: "Si oui, sélectionnez le champ correspondant (de type pourcentage). Sinon renseignez n'importe quel champ, il ne sera pas utilisé",
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
          let request = "https://api-adresse.data.gouv.fr/search/?q="+encodeURI(record.getCellValueAsString(address.name));
          let data = await fetch(request)
          .then(response => response.json())
          .catch(err => console.error(err));
   
          if (data.features[0].properties.score<scoreMinLimit) {
            underLimitScores.push(record.getCellValueAsString(identifier.name)+" ("+record.getCellValueAsString(address.name)+")");
          }
		  if (writeScore == "yes") {
			await table.updateRecordsAsync([
				  {
					  id: record.id,
					  fields: {
						  [lat.name]: data.features[0].geometry.coordinates[1],
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
						  [lat.name]: data.features[0].geometry.coordinates[1],
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
    if (lat.type != 'number') { output.markdown("**⚠ Le champ "+lat.name+" n'est pas de type _nombre_! Modifiez-le svp ou choisissez un autre champ de type nombre**"); }
    if (lon.type != 'number') { output.markdown("**⚠ Le champ "+lon.name+" n'est pas de type _nombre_! Modifiez-le svp ou choisissez un autre champ de type nombre**"); }
    if (writeScore == 'yes' && score.type != 'percent') { output.markdown("**⚠ Le champ "+score.name+" n'est pas de type _pourcentage_! Modifiez-le svp ou choisissez un autre champ de type pourcentage**"); }
}
else {
	let queryResult = await view.selectRecordsAsync({fields: [identifier, address, lat, lon]});
	output.text("La vue comporte "+queryResult.records.length.toString() + " éléments");
	output.text("Veuillez patienter pendant le géocodage des adresses...");

	await nextBlock(queryResult, 0);

	output.markdown("**Géocodage terminé !** Attention, le géocodage n'est pas une science exacte, pensez à vérifier vos résultats.")
	if (underLimitScores.length>0) {
		output.markdown('⚠ Vérifiez en particulier le géocodage pour les éléments suivants (score en-dessous de la valeur limite de '+scoreMinLimit.toString()+' renseignée):')
		output.table(underLimitScores);
	}
	output.markdown("_Script terminé avec succès_");
}
