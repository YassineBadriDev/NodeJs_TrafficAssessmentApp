const express = require('express');
const http = require('http');

const app = express();
const httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

app.use(express.static(`${__dirname}/public`));

///////////////////////// notre code //////////////////////////////
// http://www.bradoncode.com/tutorials/browserify-tutorial-node-js/
var map;
var start =true;
var chemin = 
[ 
  [	-7.355384230613708,33.706272398677115	],
  [	-7.355464696884154,33.706227772427255	],
  [	-7.3555558919906625,33.70617868352564	],
  [	-7.355620265007019,33.7061340572271	],
  [	-7.355690002441406,33.70607158037019	],
  [	-7.355754375457763,33.70602249137932	],
  [	-7.35583484172821,33.70597786499962	],
  [	-7.355904579162598,33.705937701238064	],
  [	-7.355968952178955,33.705906462743876	],
  [	-7.356049418449403,33.70585737365863	],
  [	-7.356119155883788,33.70579935924899	],
  [	-7.356194257736206,33.70574134480016	],
  [	-7.3562586307525635,33.70571010623455	],
  [	-7.35632300376892,33.705661017037066	],
  [	-7.356392741203308,33.70561639046958	],
  [	-7.356467843055725,33.705576226539	],
  [	-7.356542944908143,33.70553606258965	],
  [	-7.35662341117859,33.70550036128557	],
  [	-7.356698513031005,33.705460197300724	],
  [	-7.356773614883422,33.705424495965126	],
  [	-7.35685408115387,33.7053664812631	],
  [	-7.356939911842345,33.70532631721566	],
  [	-7.357036471366883,33.705299541173595	],
  [	-7.3571330308914185,33.705263839771206	],
  [	-7.357218861579895,33.70524598906446	],
  [	-7.357304692268372,33.7052102876398	],
  [	-7.357390522956847,33.705179048881064	],
  [	-7.357470989227295,33.70513442206315	],
  [	-7.357578277587891,33.7051522727931	],
  [	-7.357674837112427,33.70516119815669	],
  [	-7.357771396636962,33.70512995938009	],
  [	-7.357846498489379,33.70508533253668	],
  [	-7.35785722732544,33.70504070567007	],
  [	-7.3578840494155875,33.704978228017865	],
  [	-7.3578840494155875,33.70489343684577	],
  [	-7.35784113407135,33.70483988448342	],
  [	-7.35785722732544,33.70475509317477	],
  [	-7.357878684997559,33.70468368990257	],
  [	-7.3579055070877075,33.704603361150376	],
  [	-7.357926964759826,33.704518569608226	],
  [	-7.358002066612244,33.70444270342063	],
  [	-7.358055710792541,33.70437576261123	],
  [	-7.358120083808899,33.704308821749635	],
  [	-7.3581844568252555,33.70423741810646	],
  [	-7.358238101005554,33.70415262620307	],
  [	-7.358318567276001,33.70408122243005	],
  [	-7.358366847038269,33.70400981859767	],
  [	-7.358441948890686,33.70394734019566	],
  [	-7.358511686325072,33.70387593625199	],
  [	-7.35858142375946,33.7037956067444	],
  [	-7.358656525611877,33.70372866543071	],
  [	-7.358726263046265,33.70366618682419	],
  [	-7.358790636062621,33.703608170934594	],
  [	-7.358871102333068,33.70355908053586	],
  [	-7.3589301109313965,33.70350999010909	],
  [	-7.359005212783813,33.703447511343505	],
  [	-7.359058856964111,33.70337164420994	],
  [	-7.359117865562438,33.703327016453	]
];

var tailleChemin=58;
var compteur = 0;
class Position
{
  constructor( indexChemin )
  {
      this.indexChemin = indexChemin;
      this.lat = chemin[this.indexChemin][1];
      this.lng = chemin[this.indexChemin][0];
  }

  incPosition()
  {
    this.indexChemin++;
    this.lat = chemin[this.indexChemin][1];
    this.lng = chemin[this.indexChemin][0];
  }

  getIndexChemin()
  {
    return this.indexChemin;
  }

  setIndexChemin( index )
  {
    this.indexChemin = index;
    this.lat = chemin[this.indexChemin][1];
    this.lng = chemin[this.indexChemin][0];
  }
}

class Cellule 
{
    constructor( index, position, occupee = false, couleur = 'green' ) 
    {
        this.index = index;
        this.position = position;
        this.occupee = occupee;
        this.couleur = couleur;
        this.rayon = 3;     
        this.isToUpdate = false;
    }

    afficher()
    {
        console.log( 'Cellule (' + this.index + ' ), position [: ' + this.position.lat + ', ' + this.position.lng + ' ]' );
    }
  
    siOccupee()
    {
        return ( this.occupee == true );
    }    
}

class Voiture extends Cellule 
{
    constructor( index, position, vitesse = 1, suivant = undefined ) 
    {
        super( index, position, true, 'blue' );
        this.suivant = suivant;
        this.vitesse = vitesse;
    }

    move()
    {
      if( this.position.indexChemin < tailleChemin - 1 )
      {
        this.isToUpdate = true;
        this.position.incPosition();
      }
      else
        this.isToUpdate = false;
    }

    getVehiculeFromJson( jsonObject )
    {
        var obj = JSON.parse( jsonObject );
        this.id = obj.id;
        this.position = obj.position;
        this.occupee = obj.occupee;
        this.vitesse = obj.vitesse;
        return this;
    }

    chercherNbreCasesVideAvecNext()
    {
        return (Math.abs( this.position.indexChemin - this.suivant.position.indexChemin ) - 1);
    }
    
    ASR( VMax ) // 
    {
        const j = chercherNbreCasesVideAvecNext();
        if ( ( this.vitesse < VMax ) && ( j > 0 ) ) // Acclerer
        {
            this.vitesse = this.vitesse + 1;
            this.position.incPosition();
        }
        else
            if ( j < this.vitesse ) // Slow
                this.vitesse = j;

        // Random
        if (  this.vitesse == 0 )
            return this.vitesse = 0;
        else
            return this.vitesse - 1; 
    }

  get ()
  {
    return this.suivant;
  }

  set ( vehicule )
  {
    this.suivant = vehicule;
  }

  afficher()
  {
    console.log( 'Voiture (' + this.index + ' ), position [: ' + this.position.lat + ', ' + this.position.lng + ' ]' );
  }
}

class Link{
  constructor()
  {
    this.tabCellule = [];
    this.tabVoiture = [];
    this.tailleChemin= tailleChemin;
  }

  initialiserCellules() // 
  { 
      var i, n = chemin.length;  
      for ( i = 0; i < n; i++ )
        this.tabCellule.push( new Cellule( this.tabCellule.length, new Position( i ) ) );
  }

  initialiserVoitures( nbre )
  { 
      var i, k, n = chemin.length-1;
      for ( i = 0; i < nbre; i++ )
        this.tabVoiture.push( new Voiture( this.tabVoiture.length, new Position( this.getRandomInteger( 0, n ) ) ) );
  }

  moveVoitures()
  {
    var index;
    var pos;
    var voiture;
    var cellule;

    if ( start == true )
    {
      for ( index = this.tabCellule.length-1; index >= 0; index-- )
        this.tabCellule[index].isToUpdate = true;

      for ( index = this.tabVoiture.length-1; index >= 0; index-- )
        this.tabVoiture[index].isToUpdate = true;

        start = false;
    }
    else
    {
      for ( index = this.tabCellule.length-1; index >= 0; index-- )
      {
        if( this.tabCellule[index].isToUpdate ==true )
            this.tabCellule[index].isToUpdate ==false;
      }

      for ( index = this.tabVoiture.length-1; index >= 0; index-- )
      {
        voiture = this.tabVoiture[index];
        pos = voiture.position.indexChemin;
        if( pos < tailleChemin )
        {
          cellule = this.tabCellule[pos];
          voiture.move();
          cellule.isToUpdate = true;
        }
      }
    }    
  }

  getRandomInteger(min, max) 
  {
    min = Math.ceil( min );
    max = Math.floor( max );
    return Math.floor( Math.random() * (max - min) ) + min;
  }
}

myLink = new Link;
///////////////////////// fin de notre code //////////////////////

function initialisationLink()
{
  myLink.initialiserCellules();
  myLink.initialiserVoitures( 10 );
}

setInterval(() => 
{
  myLink.moveVoitures();
  //compteur = Math.floor( Math.random() * 39 ) + 0 ;
  io.emit
  (
    'dataTube', 
    {
      prompt : ' bienvenu dans notre app !!!',
      link : myLink
    }
  );
}, 1000);

httpServer.listen(3001,'127.0.0.1', function()
{
  initialisationLink();
  console.log('Listening on 127.0.0.1:3001')
});


io.sockets.on
(
  "connection",
  function(socket)
  {
    /*Associating the callback function to be executed when client visits the page and 
      websocket connection is made */
      
    var message_to_client = 
    {
      data:"Tu es connecté au serveur correctement"
    }
    socket.send(JSON.stringify(message_to_client)); 
    /*sending data to the client,
     this triggers a message event at the client side */
    console.log('Un client s\'est bien connecté au serveur');
    
    socket.on
    (
      "message",
      function(data)
      {
        /*This event is triggered at the server side 
        when client sends the data using socket.send() method */
        data = JSON.parse(data);
 
        console.log("recu :"+data);
        /*Printing the data */
        var ack_to_client = 
        {
          data:"Je suis le serveur j\'ai recu un message de toi"
        }
        socket.send(JSON.stringify(ack_to_client));
        /*Sending the Acknowledgement back to the client, 
        this will trigger "message" event on the clients side*/
      }
    ); 
  }
);