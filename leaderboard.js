// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

Players.allow({
  update: function (userId, updateValue, fields, modifier)
  {
    // return false;
    return true;
  },

  insert: function (userId, insertValue)
  {
    console.log(userId + " is attempting to insert: " + 
      insertValue.name + ", " + insertValue.score + ", " +
      insertValue.lastUpdate + ", " + insertValue.insertedBy);

    if (insertValue.name.length > 12) 
    {
      console.log("Name too long.");
      // Session.set("error","Name too long.");
      return false;
    }
    else if (insertValue.name.trim().length == 0)
    {
      console.log("Not a name.");
      return false;
    }
    else if (Players.findOne({name: insertValue.name})) 
    {
      console.log("Name already exists..");
      // Session.set("error","Name already exists.");
      return false;
    }
    else if (insertValue.score != 0) 
    {
      console.log("Non-zero score.");
      // Session.set("error","Non-zero score.");
      return false;
    }
    else if (insertValue.insertedBy != userId) 
    {
      console.log("Fake ID.");
      // Session.set("error","Attempted fake ID");
      return false;
    }
    else if (Date.now() - insertValue.lastUpdate > 1000) 
    {
      console.log("Spam.");
      // Session.set("error","Attempted spam");
      return false;
    }
    else if (Players.findOne({insertedBy: userId}))
    {
      console.log("User already has an avatar.");
      // Session.set("error","Already have an avatar");
      return false;
    }
    
    return true;
  },

  remove: function (userId, removeValue)
  {
    return false;
  }
});



if (Meteor.isClient) 
{
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1}});
  };

  Template.leaderboard.events({
    'click span.increase': function () {
      Meteor.call("increment_score",this._id)
      // Players.update(_id, {$inc: {score: 1}});
    }
  });

  Template.leaderboard.events({
    'click span.decrease': function () {
      Meteor.call("decrement_score",this._id)
    }
  });

  Template.new_leaderboarder.events = {
    'click input.add_new_player': function () {

      console.log("Client side calling insert: " + 
        "name: " + document.getElementById("input_new_player").value.trim() + ", " +
        "score: 0, " +
        "lastUpdate: " + Date.now() + ", " +
        "insertedBy: " + this.userId
        );

      Meteor.call("insert_player",document.getElementById("input_new_player").value.trim());
      Players.insert({name: document.getElementById("input_new_player").value.trim(),
        score: 0,
        lastUpdate: Date.now(),
        insertedBy: this.userId});
    }};

    Template.new_leaderboarder.error = function () {
      return Session.get("error");
    };
  };


// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {

  });
}



Meteor.methods(
{  
  increment_score: function (_id) {
    console.log(Meteor.connection._lastSessionId);
    Players.update(_id, {$inc: {score: 1}});
  },

  decrement_score: function(_id) {
    Players.update(_id, {$inc: {score: -1}})
  },

  // insert_player: function (_name)
  // {
  //   _name = _name.slice(0,12);

  //   if (_name.length == 0) 
  //   {
  //     Session.set("error","Name can't be blank");
  //     _isValid = false;
  //   } 
  //   else if (Players.findOne({name: _name})) 
  //   {
  //     Session.set("error","Player already exists");
  //     _isValid = false;
  //   } 
  //   else if (Players.findOne({insertedBy: Meteor.userId}))
  //   {
  //     Session.set("error","You already have an avatar!");
  //     _isValid = false;
  //   }
  //   else 
  //   {
  //     _isValid = true;
  //   }

  //   if (_isValid)
  //   {
  //     console.log("Inserting name: " + _name.slice(0,12) + ", score: 0, lastUpdate: " + Date.now() + ", insertedBy: " + Meteor.userId);
  //     Players.insert({name: _name.slice(0,12), score: 0, lastUpdate: Date.now(), insertedBy: Meteor.userId});
  //     // Players.insert({name: _name.slice(0,12), score: 0});
  //   }
  //   else
  //   {
  //     console.log("Didn't insert.");
  //   }
  // }
});

