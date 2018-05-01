CTextMenu@ tpMenu = null;
CTextMenu@ tpConfirm = null;
array<int> pReceivedRequest(g_Engine.maxClients);
void PluginInit(){
  g_Module.ScriptInfo.SetAuthor("Paranoid_AF");
  g_Module.ScriptInfo.SetContactInfo("Feel free to contact me on GitHub.");
  g_Hooks.RegisterHook(Hooks::Player::ClientSay, @onChat);
}

HookReturnCode onChat(SayParameters@ pParams){
  CBasePlayer@ cPlayer = pParams.GetPlayer();
  CBasePlayer@ cTarget;
  array<int> cTopBoard(g_Engine.maxClients);
  const CCommand@ cArgs = pParams.GetArguments();
  if(cPlayer is null){
    g_PlayerFuncs.SayText(cPlayer, "[EasyTeleport] Teleportation faild for invailid input.\nOnly valid players are allowed.\n");
    return HOOK_CONTINUE;
  }
  if (cArgs[0] != "/TP" && cArgs[0] != "/tp" && cArgs[0] != "!TP" && cArgs[0] != "!tp"){
    return HOOK_CONTINUE;
  }
  pParams.ShouldHide = true;
  if(cArgs[1] == ""){
    openTpMenu(cPlayer);
    return HOOK_HANDLED;
  }
  CBasePlayer@ cFindPlayerByName = getPlayerCBasePlayerByName(cArgs[1]);
  if(cFindPlayerByName !is null){
    string targetPlayerName = cFindPlayerByName.pev.netname;
    if(targetPlayerName.ToLowercase() == cArgs[1].ToLowercase()){
      sendTeleportRequest(cPlayer, cFindPlayerByName);
      return HOOK_HANDLED;
    }
  }
  g_PlayerFuncs.SayText(cPlayer, "[EasyTeleport] Teleportation faild for invailid input.\nOnly valid names are allowed.\n");
  return HOOK_CONTINUE;
}

void openTpMenu(CBasePlayer@ pPlayer){
  @tpMenu = CTextMenu(tpMenuRespond);
  tpMenu.SetTitle("[EasyTeleport]\nPick a player for teleportation.\n");
  array<string> playerName(g_Engine.maxClients);
  for(int i = 1; i <= (int(g_Engine.maxClients)); i++){
    CBasePlayer@ cThisPlayer = g_PlayerFuncs.FindPlayerByIndex(i);
    if(cThisPlayer !is null){
      playerName[i - 1] = cThisPlayer.pev.netname;
    }
  }
  for(int i = 1; i <= (int(playerName.length())-1); i++)
  {
    string thisName = playerName[i - 1];
    if(thisName != "" && thisName != " "){
      tpMenu.AddItem(thisName, null);
    }
  }
  tpMenu.Register();
  tpMenu.Open(0, 0, pPlayer);
}

CBasePlayer@ getPlayerCBasePlayerByName(string pName){
  CBasePlayer@ cFindPlayerByName = null;
  for(int i = 1; i <= g_Engine.maxClients; i++){
    @cFindPlayerByName = g_PlayerFuncs.FindPlayerByIndex(i);
    if(cFindPlayerByName !is null){
      string targetPlayerName = cFindPlayerByName.pev.netname;
      if(targetPlayerName.ToLowercase() == pName.ToLowercase()){
        break;
      }
    }
  }
  return cFindPlayerByName;
}

int getPlayerIndex(CBasePlayer@ pPlayer){
  CBasePlayer@ cFindPlayerByName = null;
  int thisIndex;
  for(int i = 1; i <= g_Engine.maxClients; i++){
    @cFindPlayerByName = g_PlayerFuncs.FindPlayerByIndex(i);
    if(cFindPlayerByName is pPlayer){
      thisIndex = i;
      break;
    }
  }
  return thisIndex;
}

void tpMenuRespond(CTextMenu@ mMenu, CBasePlayer@ pPlayer, int iPage, const CTextMenuItem@ mItem){
  if(mItem !is null && pPlayer !is null){
    CBasePlayer@ cTarget = getPlayerCBasePlayerByName(mItem.m_szName);
    sendTeleportRequest(pPlayer, cTarget);
  }
}

void sendTeleportRequest(CBasePlayer@ pPlayer, CBasePlayer@ cTarget){
  pReceivedRequest[getPlayerIndex(cTarget)] = getPlayerIndex(pPlayer);
  @tpConfirm = CTextMenu(tpConfirmRespond);
  tpConfirm.SetTitle("[EasyTeleport]\nYou've got a new teleportation request from " + pPlayer.pev.netname +".\nOnly confirm when you think it's safe to do so.\n");
  tpConfirm.AddItem("Accept", null);
  tpConfirm.AddItem("Decline", null);
  tpConfirm.Register();
  tpConfirm.Open(0, 0, cTarget);
  g_PlayerFuncs.SayText(pPlayer, "[EasyTeleport] Your teleportation request is sent to " + cTarget.pev.netname +", please wait for confirmation.\n");
}

void tpConfirmRespond(CTextMenu@ mMenu, CBasePlayer@ pPlayer, int iPage, const CTextMenuItem@ mItem){
  if(mItem.m_szName == "Accept" && pPlayer !is null){
    CBasePlayer@ cSourcePlayer = g_PlayerFuncs.FindPlayerByIndex(pReceivedRequest[getPlayerIndex(pPlayer)]);
    if(cSourcePlayer !is null){
      g_PlayerFuncs.SayText(cSourcePlayer, "[EasyTeleport] Teleporting you to " + pPlayer.pev.netname +"...\n");
      cSourcePlayer.SetOrigin(pPlayer.GetOrigin()+Vector(0,0,10));
      NetworkMessage msg(MSG_ONE, NetworkMessages::NetworkMessageType(9), cSourcePlayer.edict());
      msg.WriteString("unstuck");
      msg.End();
    }
  }
  if(mItem.m_szName == "Decline" && pPlayer !is null){
    pReceivedRequest[getPlayerIndex(pPlayer)] = 0;
  }
}