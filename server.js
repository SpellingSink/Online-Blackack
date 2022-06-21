const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var playercount = 0
var currentPlayer = 0
var players = new Array()
var cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
var suits = ["Diamonds", "Hearts", "Spades", "Clubs"]
var deck = new Array()
var haswon = false
var ingame = false
var currentPlayerNumber = 0
app.use(express.static(__dirname + '/public'))

function createDeck()
{
	var deck = new Array()

	for(var i = 0; i < suits.length; i++)
	{
		for(var x = 0; x < cards.length; x++)
		{
			var card = {Value: cards[x], Suit: suits[i]}
			deck.push(card)
		}
	}
	return deck                                             //Creates a deck with cards for every value for every suit//
}
function shuffle()
{
	for (var i = 0; i < 1000; i++)
	{
		var location1 = Math.floor((Math.random() * deck.length))
		var location2 = Math.floor((Math.random() * deck.length))
		var tmp = deck[location1]                                               //Randomly swap the location of 2 cards for 1000 times//

		deck[location1] = deck[location2]
		deck[location2] = tmp
	}
}

function createPlayers()
{
	players = new Array()
  for (const [_, socket] of io.of("/").sockets) {
    var hand = new Array()
		var player = { Name: 'Player ' + socket.id, ID: socket.id, Points: 0, Hand: hand, Lost: false}
		players.push(player)
  }                        //Creates a player record with parameters in an array, iterating once for every player connected//
}

function dealHands()
{
    for(var i = 0; i < 2; i++)
    {
        for (var x = 0; x < players.length; x++)
        {
            var card = deck.pop()
            players[x].Hand.push(card)             //Deals a card from the deck twice to every player hand//
        }
    }
    for (var j = 0; j < players.length; j++)
    {
    updatePoints(j)                         //Updates the points of each player once//
    }
    updateDeck()
}

function updateDeck()
{
  io.emit('updateDeck',deck.length)
}

function updatePoints(player)
{
    var sum = 0
    for (var x = 0; x < players[player].Hand.length; x++)
    {
        cardvalue = players[player].Hand[x].Value
        if (cardvalue == 'J' || cardvalue == 'Q' || cardvalue == 'K')
        {
          cardvalue = 10      //Sets the card value to 10 for face cards//
        }
        else if (cardvalue == 'A')
        {
          cardvalue = 1
        }
        sum = sum + parseInt(cardvalue)
    }
    players[player].Points = sum
    if (sum > 20){
      stay(players[player].ID)
    }
}

function hitMe(PlayerID)
{
  for (var x = 0; x < players.length; x++) {
    if (players[x].ID == currentPlayer){
      currentPlayerNumber = x
    }
  }
  if (PlayerID == currentPlayer && ingame == true && players[currentPlayerNumber].Lost == false)
    {
      var card = deck.pop()
      players[currentPlayerNumber].Hand.push(card)
      updatePoints(currentPlayerNumber)
      updateDeck()
      check(currentPlayerNumber)
      io.emit('PlayerData',(players))
    }
}

function check(currentPlayerNumber)
{
    if (players[currentPlayerNumber].Points > 21)
    {
      io.emit('PlayerLost',players[currentPlayerNumber].ID)
      players[currentPlayerNumber].Lost = true
      stay(players[currentPlayerNumber].ID)
    }
}


function startgame()
{
  
  if (ingame == false)
  {
  ingame = true
  haswon = false
  deck = createDeck()
  shuffle()
  createPlayers()
  dealHands()                             //Runs all the functions to set up a game//
  var x = players.length - 1
  currentPlayer = players[x].ID
  io.emit('CreateUI',(players))
  io.emit('PlayerData',(players))
  io.emit('PlayerTurn',(currentPlayer))
  }
}

function stay(PlayerID)
{
  for (var x = 0; x < players.length; x++) {
    if (players[x].ID == currentPlayer){
      currentPlayerNumber = x
    }
  }
  if(haswon == false && ingame == true && currentPlayer == PlayerID)
    {
      if (currentPlayerNumber > 0) {
        currentPlayerNumber--
        currentPlayer = players[currentPlayerNumber].ID
        io.emit('PlayerTurn',currentPlayer)
        }
      else if(currentPlayerNumber == 0) {
          end()
          haswon = true
        }
    }
}

function end()
{
  ingame = false
  haswon = true
  var winner1 = 0
  var score = 0
  var winner2 = new Array()

    for(var i = 0; i < players.length; i++)
    {
        if (players[i].Points > score && players[i].Points < 22)
        {
          score = parseInt(players[i].Points)
          winner1 = i
        }
    }
    for(var j = 0; j < players.length; j++){
        if (players[j].Points == score)
        {
          winner2.push(players[j].ID)
        }
    }
    io.emit('end', winner2)
}

io.on('connection', (socket) => {
  console.log('a user connected');
  playercount = playercount + 1
  console.log('there are ' + playercount + ' players connected')
  socket.on('start', () => {
    startgame()
  })
  socket.on('hitMe',() => {
    hitMe(socket.id)
  })
  socket.on('stay', () => {
    stay(socket.id)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
    playercount = playercount - 1;
    console.log('there are ' + playercount + ' players connected')
    var existingPlayerID = 0
    for (var i = 0; i < players.length; i++){
      if (players[i].ID = socket.id){
        existingPlayerID = socket.id
      }
    }
    if (ingame == true && socket.id == existingPlayerID )
    {
      ingame = false
      haswon = true
    }
  })
});

server.listen(3000 || process.env.PORT, () => {
  console.log('listening on *:3000');
});
