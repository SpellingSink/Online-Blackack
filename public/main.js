var playerID = -1
var disclaimerClicked = false
function startgame()
{
    socket.emit('start')
    document.getElementById('btnStart').value = 'Restart'
}
socket.on('playercount',(playercount) => {
    document.getElementById('playercount').style.display="block"
    document.getElementById('playercount').innerHTML = "There are " + playercount + " players connected!"
})
socket.on('updateDeck',(decklength) => {
    document.getElementById('deckcount').innerHTML = decklength;
})

function getCardUI(card)
{
    var el = document.createElement('div')
    var icon = ''
    if (card.Suit == 'Hearts')
    icon='&hearts;'
    else if (card.Suit == 'Spades')
    icon = '&spades;'
    else if (card.Suit == 'Diamonds')
    icon = '&diams;'
    else
    icon = '&clubs;'
    
    el.className = 'card'
    el.innerHTML = card.Value + '<br/>' + icon
    return el
}
socket.on('CreateUI',players => {
    document.getElementById('players').innerHTML = ''
    for(var i = 0; i < players.length; i++)
    {
    var div_player = document.createElement('div')
    var div_playerid = document.createElement('div')
    var div_hand = document.createElement('div')
    var div_points = document.createElement('div')
    var insertpoint = document.createElement('div')             //creates an element for each separate body of UI//
    
    div_points.className = 'points'
    div_points.id = 'points_' + i
    div_player.id = 'player_' + i
    div_player.className = 'player'
    div_hand.id = 'hand_' + i
    insertpoint.id = 'insert_' + i                              //Assigns an id to each element//
    
    div_playerid.innerHTML = players[i].ID
    div_player.appendChild(div_playerid)
    div_player.appendChild(div_hand)
    div_player.appendChild(div_points)
    document.getElementById('players').appendChild(div_player)
    div_player.appendChild(insertpoint)                           //Adds bodies as subsets of others to group them//
    document.getElementById("status").style.display="block"
    document.getElementById("turn").style.display="inline"
    document.getElementById("name").style.display="block"
    document.getElementById("name").innerHTML = 'You are: ' + socket.id
    document.getElementById("status").innerHTML = ''
    }
})

socket.on('PlayerLost',(PlayerLostID) => {
    document.getElementById('status').innerHTML += 'Player: ' + PlayerLostID + ' LOST</br>'
})

socket.on('PlayerData',(players) =>{
    for (var x = 0; x < players.length; x++)
    {
        var points = document.getElementById('insert_' + x)
        points.innerHTML = players[x].Points
        var hand = document.getElementById('hand_' + x)
        hand.innerHTML = ''
        for (var y = 0; y < players[x].Hand.length; y++)
        {
            hand.appendChild(getCardUI(players[x].Hand[y]))
        }
    }
})

function hitMe()
{
    socket.emit('hitMe')
}
function disclaimer()
{
    if (disclaimerClicked == false)
    {
        document.getElementById('disclaimer').innerHTML = "This online game of blackjack does not endorse gambling in any form, whether it be for material wealth, or for personal favours."
        document.getElementById('disclaimer').innerHTML += "<br>Additionally, the user experience within this game does not accurately reflect how this game may be played in person, and as such,"
        document.getElementById('disclaimer').innerHTML += "<br>please do not think that any data gathered here will be realistic or accurate"
        disclaimerClicked = true
        document.getElementById('disclaimer').style.display="block"
    }
    else if (disclaimerClicked == true)
    {
        document.getElementById('disclaimer').innerHTML = ''
        document.getElementById('disclaimer').style.display="none"
        disclaimerClicked = false
    }
}

socket.on('PlayerTurn',(currentPlayer) =>{
    document.getElementById('turn').innerHTML = 'It is ' + currentPlayer + "'s turn"
})

function stay()
{
    socket.emit('stay')
}

socket.on('end',(winner2) =>{
    document.getElementById('status').style.display = 'block'
    for (var x = 0; x < winner2.length; x++){
        document.getElementById('status').innerHTML += '<br>Winner: Player ' + winner2[x] + '<br>'
    }
})
