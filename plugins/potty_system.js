/*:
 * @plugindesc A potty system.
 * @author DaiDorei  大奴隷
 *
 * @help Use commas for separating actors.
 *
 * @param Enabled
 * @desc If the potty system is enabled at beginning. You can
   enable it in game. 0 = Disabled. 1 = Enabled.
 * @default 1
 *
 * @param DefaultBladderAccident
 * @desc When this number is reached the actor will have a pee accident.
 * @default 600
 *
 * @param DefaultBladderWarnings
 * @desc Numbers separated with commas. Each of the numbers will
   trigger a pee warning event.
 * @default 200,400
 *
 * @param DefaultBladderMinIncrease
 * @desc Each interval the bladder will increase a random number
   between this value and the MaxIncrease number.
 * @default 0
 *
 * @param DefaultBladderMaxIncrease
 * @desc Each interval the bladder will increase a random number
   between the MinIncrease number and this value.
 * @default 5
 *
 * @param DefaultBladderSpeed
 * @desc This number will be multiplied with the bladder
   increase of each interval.
 * @default 1
 *
 * @param DefaultBowelAccident
 * @desc When this number is reached the actor will have a poo accident.
 * @default 900
 *
 * @param DefaultBowelWarnings
 * @desc Numbers separated with commas. Each of the numbers will
   trigger a poo warning event.
 * @default 300,600
 *
 * @param DefaultBowelMinIncrease
 * @desc Each interval the bowel will increase a random number
   between this value and the MaxIncrease number.
 * @default 0
 *
 * @param DefaultBowelMaxIncrease
 * @desc Each interval the bowel will increase a random number
   between the MinIncrease number and this value.
 * @default 5
 *
 * @param DefaultBowelSpeed
 * @desc This number will be multiplied with the bowel
   increase of each interval.
 * @default 1
 *
 * @param TimerInterval
 * @desc Duration of the intervals in miliseconds when everything is checked.
 * @default 10000
 *
 */

var PS = PS || {};  // PS = Potty System

PS.Parameters = PluginManager.parameters('potty_system');
PS.Param = PS.Param || {};

PS.Param.isEnabled = Boolean(Number(PS.Parameters["Enabled"]));
PS.Param.DefaultBladderAccident = Number(PS.Parameters["DefaultBladderAccident"]);
PS.Param.DefaultBowelAccident = Number(PS.Parameters["DefaultBowelAccident"]);
PS.Param.DefaultBladderWarnings = PS.Parameters['DefaultBladderWarnings'].split(/\s*,\s*/).map(Number).filter(function(value) { return !!value; });
PS.Param.DefaultBowelWarnings = PS.Parameters['DefaultBowelWarnings'].split(/\s*,\s*/).map(Number).filter(function(value) { return !!value; });
PS.Param.DefaultBladderMinIncrease = Number(PS.Parameters["DefaultBladderMinIncrease"]);
PS.Param.DefaultBladderMaxIncrease = Number(PS.Parameters["DefaultBladderMaxIncrease"]);
PS.Param.DefaultBowelMinIncrease = Number(PS.Parameters["DefaultBowelMinIncrease"]);
PS.Param.DefaultBowelMaxIncrease = Number(PS.Parameters["DefaultBowelMaxIncrease"]);
PS.Param.DefaultBladderSpeed = Number(PS.Parameters["DefaultBladderSpeed"]) || 1;
PS.Param.DefaultBowelSpeed = Number(PS.Parameters["DefaultBowelSpeed"]) || 1;
PS.Param.TimerInterval = Number(PS.Parameters["TimerInterval"]) || 10000;

PS.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded
DataManager.isDatabaseLoaded = function() {
  PS.DataManager_isDatabaseLoaded.call(this);
  this.loadActorsNotetags($dataActors);
  PS.setupData();
  return true;
}

PS.DataManager_setupNewGame = DataManager.setupNewGame
DataManager.setupNewGame = function() {
  PS.DataManager_setupNewGame.call(this);
  return true;
}

DataManager.loadActorsNotetags = function (group) {
  for (var n = 1; n < group.length; n++){
    act = group[n];
    aTags = act.meta;
    act.potty = {};
    if (aTags.EnablePotty == true){
      act.potty.isEnabled = true;
    } else {
      act.potty.isEnabled = false;
    }
    act.potty.bladderAccident = Number(aTags.BladderAccident) || PS.Param.DefaultBladderAccident;
    act.potty.bowelsAccident = Number(aTags.BowelAccident) || PS.Param.DefaultBowelAccident;

  }
}

PS.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
    contents = PS.DataManager_makeSaveContents.call(this);
    contents.potty_data = PS.data;
    return contents;
};

PS.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
    PS.DataManager_extractSaveContents.call(this,contents);
    PS.data = contents.potty_data;
};

PS.Game_Actor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
  PS.Game_Actor_initMembers.call(this)
  this._potty = {};
};

PS.Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {
    PS.Game_Actor_setup.call(this,actorId)
    var actor = $dataActors[actorId];
    this._potty = actor.potty;
};

PS.Scene_Map_update = Scene_Map.prototype.update
Scene_Map.prototype.update = function() {
  PS.Scene_Map_update.call(this)
  if (PS.data.isEnabled === true) {PS.update()};
};


PS.GameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  PS.GameInterpreter_pluginCommand.call(this, command, args);
  // COMANDOS
  // Command enable -> In addition to the variable, call PS.start
  // command disable -> In addition to the variable, call PS.stop
}

PS.setupData = function (){
  this.data = {};
  this.data.isEnabled = PS.Param.isEnabled;
}



// ##################################################
//  TEST
// ##################################################

PS.start = function (){
  if (this.data.isEnabled === true){
    console.log("timer start");
    setInterval(function(){ console.log("interval");}, PS.Param.TimerInterval);
  }
}

PS.update = function (){
  //console.log(PS.isEnabled())
}

PS.stop = function (){

}

// ##################################################

PS.isEnabled = function() {
  return (this._intervalHandler !== undefined);
};

PS.enableTime = function() {
  if (this._intervalHandler !== undefined) return;

  var length = PS.Param.TimerInterval;
  this._intervalHandler = setInterval(this.timerTick, length);
};

PS.disableTime = function() {
  if (this._intervalHandler === undefined) return;

  clearInterval(this._intervalHandler);
  this._intervalHandler = undefined;
};

PS.refreshTimeSystem = function() {
  this.disableTime();
  this.enableTime();
};

PS.timerTick = function(){
  console.log("esto es un intervalo");
}

/*(function (){
  PS.refreshTimeSystem();
})*/

PS.refreshTimeSystem();

/*
Other variables (De Actor):
Bladder (commando Set Get)
Bowel (commando Set Get)
PeeAccidents (commando Set Get)
PooAccidents (commando Set Get)
Total Accidents (commando Set Get)
BladderState  / empty almost_empty need_to_go warnings_extra? /
BowelState  / empty almost_empty need_to_go warnings_extra? /
*/
