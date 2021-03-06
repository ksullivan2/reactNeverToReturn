var React = require('react');
var ActionCard = require('./ActionCard.js')
var gameStates = require('../game_modules/gameStates.js');

// props are:
//   players: {playerName: Player}
//   userName: ""
//   activePlayer: Player
//   gameState: int(enum)


var MyCardsDIV = React.createClass({
  getInitialState: function(){
    return(
      {canvas_x: 0,
      canvas_y: 0,
      canvas_height: 0,
      canvas_width: 0,
  	  activeCard: ""}
    )
  },

  componentDidMount: function(){
    this.calculateCanvas();
    window.addEventListener("resize", this.calculateCanvas);
  },

  calculateCanvas: function(){
    var divLocation = document.getElementById("MyCardsDIV").getBoundingClientRect();

    this.setState({
      canvas_x: divLocation.left,
      canvas_y: divLocation.top,
      canvas_height: divLocation.bottom - divLocation.top,
      canvas_width: divLocation.right - divLocation.left
    })
  },

  handleMouseOver: function(cardName){
  
  	this.setState({
  		activeCard: cardName
  	})
  },

  handleMouseOut: function(){
    this.setState({
      activeCard: ""
    })
  },

  calculateCardOffset: function(activeCard){
  	var userHand = this.props.players[this.props.userName].hand;

  	var cardsInHand = [];
  
  	
    for (var i = 0; i < userHand.length; i++){
    	if (i === 0){
    		var offset = 5;
    	} else {
    		var offset = cardsInHand[i-1].offset + 5
	    	if (cardsInHand[i-1].card.name === activeCard){
	    		offset += 30
	    	}
    	}
    	
      cardsInHand.push({card: userHand[i], key:(this.props.userName+"card"+i), offset:offset})
    }
    return cardsInHand
  },

  render: function () {
  	var self = this;

  	if (this.props.userName){
		  	
	  	if (this.props.gameState != gameStates.gatherPlayers){

		  	var cardsInHand = this.calculateCardOffset(self.state.activeCard)	    
		    
		    if (cardsInHand.length > 0){
			    return (
			      <div  className="layoutDIV" id='MyCardsDIV' onMouseOut={self.handleMouseOut}>
			        {cardsInHand.map(function(eachCard){
			        	return(
								<ActionCard card={eachCard.card} key={eachCard.key} offset={eachCard.offset} 
                handleMouseOver={self.handleMouseOver} userName={self.props.userName}/>
			       )
			        	})  	
			       	}
			      </div>
			    )
		    	
		    }
  		}
  		
  	} 

  	return ( <div  className="layoutDIV" id='MyCardsDIV'>There are no cards in your hand. </div>) 
  }

  
});

module.exports = MyCardsDIV;


