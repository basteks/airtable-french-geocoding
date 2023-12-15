# Géocodage Airtable
Un script Airtable qui vous permet de géocoder des adresses **franaçaises (l'API ne reconnaît que des adresses françaises (cf. Crédits ci-dessous), basé sur les [Extensions Airtable](https://support.airtable.com/docs/airtable-extensions-overview).

## Utilisation
- le contenu du fichier address_geocoding_FR.js doit être copié dans une nouvelle Extension Scripting dans votre base Airtable (attention, les Extensions ne sont pas disponibles avec la souscription gratuite !)
Une fois votre Extension créée, accédez à ses paramètres en cliquant sur l'icône en roue dentée ⛭ en haut à droite
Les paramètres suivants permettent la configuration de l'Extension :
- *Table* : la table dans laquelle se trouvent les adresses à géocoder
- *Vue* : la vue contenant les adresses
- *Identifiant* : un champ permettant d'identifer la saisie (par exemple Nom, Id, etc.)
- *Adresse* : le champ contenant l'adresse à géocoder
- *Latitude* : le champ contenant la latitude (de **type nombre**)
- *Longitude* : le champ contenant la longitude (de **type nombre**)
- *Valeur limite du "score" (pourcentage de fiabilité du géocodage)* : une valeur (comprise entre 0 et 1) en dessous de laquelle le géocodage sera considéré comme potentiellement problématique (par défaut j'utilise 0.6)
- *Enregistrement du score* : un choix Oui/Non pour préciser si ce score de géocodage doit être sauvegardé pour chaque entrée
- *Score* : si vous souhaitez effectivement sauvegarder le score, le champ (de **type pourcentage**) dans lequel l'enregistrer (sinon renseignez n'importe quel champ, il ne sera pas utilisé)

## Crédits
Ce script utilise [l'API Adresse](https://adresse.data.gouv.fr/api-doc/adresse). N'oubliez pas que l'utilisation de cette API est soumise à une limite de 50 appels/sec/IP. Le script est conçu afin de ne pas dépasser cette limite.
