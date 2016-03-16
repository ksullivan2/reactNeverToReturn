var React = require('react');
var ReactDOM = require('react-dom');
var OpponentsDIV = require('./OpponentsDIV');
var ActionAREA = require('./ActionAREA');
var MyCardsDIV = require('./MyCardsDIV');
var NeckDIV = require('./NeckDIV');

//EVENTS--------------------------------------------------------------------------------------------------------------
var socket = io();



socket.on("new player", function(data){
  getName(data);
});

socket.on("name taken", function(data){
  getName(data);
});






//INTERACT WITH HUMAN--------------------------------------------------------------------------------------------------------
function getName(data){
  var name = null;
  do {
    name = prompt("What is your name?","Player "+data.playerIndex);
  }while (!name);
  
  socket.emit("create player",{name: name});
}




//REACT RENDER APP---------------------------------------------------------------------------------------------------------


var App = React.createClass({
  getInitialState: function(){
    return{
      players: [],
      neck: [],
      activePlayer: null
    }
  },


  componentDidMount(){
    var self = this;

    socket.on("pass initial state", function(data){
      self.setState({players: data.players, 
                      neck: data.neck,
                      activePlayer: data.activePlayer})
      }) 

    socket.on('new player added', function(data){
      self.setState({players: data.players});
      })

    socket.on('game started', function(data){
      self.setState({neck: data.neck, activePlayer: data.activePlayer})
      //destroyStartGameButton();
    })

    socket.on('next turn', function(data){
      self.setState({activePlayer: data.activePlayer})
    })
  },

  render: function () {
    return (
      <div id='App'>
        <OpponentsDIV players={this.state.players} activePlayer={this.state.activePlayer}/>
        <ActionAREA />
        <MyCardsDIV />
        <NeckDIV players={this.state.players} neck={this.state.neck} activePlayer={this.state.activePlayer}/>
      </div>
    )
  }
});

module.exports = App;

ReactDOM.render(<App />, document.getElementById('main-container'));


