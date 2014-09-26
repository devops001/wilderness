
var sizes = {
  "resolution" : {"x":800, "y":600},
  "screen"     : {"x":window.innerWidth, "y":window.innerHeight},
  "map"        : {"x":0, "y":0},
  "tile"       : {"x":64, "y":64},
  "tilesInView": {"x":0, "y":0},
  "margin"     : {"x":0, "y":0},
};

sizes.tilesInView.x = Math.floor(sizes.screen.x/sizes.tile.x); 
sizes.tilesInView.y = Math.floor(sizes.screen.y/sizes.tile.y); 

sizes.map.x = sizes.tilesInView.x;
sizes.map.y = sizes.tilesInView.y;

sizes.margin.x = Math.floor((sizes.screen.x - sizes.tilesInView.x*sizes.tile.x)/2);
sizes.margin.y = Math.floor((sizes.screen.y - sizes.tilesInView.y*sizes.tile.y)/2);


var stage    = new PIXI.Stage(0x556677);
var renderer = new PIXI.autoDetectRenderer(sizes.screen.x, sizes.screen.y);
renderer.view.style.width   = sizes.screen.x +"px";
renderer.view.style.height  = sizes.screen.y +"px";
renderer.view.style.display = "block";
document.body.appendChild(renderer.view);

var texture1 = new PIXI.RenderTexture(sizes.screen.x, sizes.screen.y);
var texture2 = new PIXI.RenderTexture(sizes.screen.x, sizes.screen.y);
var texture  = texture1;

var sprite        = new PIXI.Sprite(texture);
sprite.anchor.x   = 0.5;
sprite.anchor.y   = 0.5;
sprite.position.x = sizes.screen.x/2;
sprite.position.y = sizes.screen.y/2;
stage.addChild(sprite);

var tiles   = {};
tiles.names = ["grass", "rock", "tree", "wall", "player", "rat", "skull"];
tiles.rooms = [];

function createRoom(roomX, roomY) {
  var room       = {};
  room.position  = {"x":roomX, "y":roomY};
  room.sprites   = []; 
  room.values    = [];
  room.container = new PIXI.DisplayObjectContainer();
  room.container.position.x = 0;
  room.container.position.y = 0;
  for (var y=0; y<sizes.map.y; y++) {
    for (var x=0; x<sizes.map.x; x++) {
      if (Math.random() > 0.9) {
        value = tiles.names.indexOf("wall");
      } else {
        value = tiles.names.indexOf("grass");
      }
      room.values[x+y*sizes.map.x] = value;
    }
  }
  for (var y=0; y<sizes.map.y; y++) {
    for (var x=0; x<sizes.map.x; x++) {
      var value       = room.values[x+y*sizes.map.x];
      var name        = tiles.names[value];
      var tile        = PIXI.Sprite.fromFrame(name);
      tile.anchor.x   = 0;
      tile.anchor.y   = 0;
      tile.position.x = sizes.margin.x + x*sizes.tile.x;
      tile.position.y = sizes.margin.y + y*sizes.tile.y;
      room.sprites[x+y*sizes.map.x] = tile;
      room.container.addChild(tile);
    }
  }
  tiles.rooms.push(room);
}

function createRooms() {
  for (var y=0; y<2; y++) {
    for (var x=0; x<2; x++) {
      createRoom(x, y);
    }
  }
  tiles.currentRoom = tiles.rooms[0];
  stage.addChild(tiles.currentRoom.container);
}



var loader        = new PIXI.AssetLoader(["tiles.json"]);
loader.onComplete = function() {
  createRooms();
  createPlayer();
  animate();
};
loader.load();


function animate() {
  requestAnimationFrame(animate);
  renderer.render(stage);
}



function createPlayer() {
  tiles.player = PIXI.Sprite.fromFrame("player");
  tiles.player.anchor.x = 0.5;
  tiles.player.anchor.y = 0.5;
  stage.addChild(tiles.player);

  var pos     = {};
  var blocked = true;
  while (blocked) {
    var x = Math.floor(Math.random()*sizes.map.x);
    var y = Math.floor(Math.random()*sizes.map.y);
    if (!isBlocked(x, y)) {
      blocked = false;
      pos = getCenteredTilePos(x, y);
    }
  }
  tiles.player.position.x = pos.x;
  tiles.player.position.y = pos.y;
}


function isBlocked(tileX, tileY) {
  var value = tiles.currentRoom.values[tileX+tileY*sizes.map.x];
  return value != tiles.names.indexOf("grass");
}




function getCenteredTilePos(tileX, tileY) {
  var x = sizes.margin.x + sizes.tile.x/2 + tileX*sizes.tile.x;
  var y = sizes.margin.y + sizes.tile.y/2 + tileY*sizes.tile.y;
  return {"x":x, "y":y};
}

function getTilePos(sprite) {
  var x = ((sprite.position.x - sizes.margin.x - sizes.tile.x/2) / sizes.tile.x);
  var y = ((sprite.position.y - sizes.margin.y - sizes.tile.y/2) / sizes.tile.y);
  return {"x":x, "y":y};
}

function move(sprite, dx, dy) {
  var tilePos = getTilePos(sprite);
  var x = tilePos.x + dx; 
  var y = tilePos.y + dy; 
  if (x<0 || y<0 || x>sizes.map.x-1 || y>sizes.map.y-1) {
    console.log("TODO: change rooms");
  } else if (isBlocked(x, y)) {
    console.log("is blocked");
  } else {
    var centered = getCenteredTilePos(x, y);
    sprite.position.x = centered.x;
    sprite.position.y = centered.y;
  }
}


document.addEventListener('keydown', function(event) {
  var player = tiles.player;
  if (event.keyCode==37||event.keyCode==65||event.keyCode==100) {
    move(player, -1, 0);
  } else if (event.keyCode==38||event.keyCode==87||event.keyCode==104) {
    move(player, 0, -1);
  } else if (event.keyCode==39||event.keyCode==68||event.keyCode==102) {
    move(player, 1, 0);
  } else if (event.keyCode==40||event.keyCode==83||event.keyCode==98) {
    move(player, 0, 1);
  } else if (event.keyCode==105) {
    move(player, 1, -1);
  } else if (event.keyCode==99) {
    move(player, 1, 1);
  } else if (event.keyCode==103) {
    move(player, -1, -1);
  } else if (event.keyCode==97) {
    move(player, -1, 1);
  } else if (event.keyCode==101) {
    // rest
  } else {
    console.log("pressed: ", event.keyCode);
  }
});








