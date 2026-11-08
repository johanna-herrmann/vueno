import express, { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { ApiError, GameStore } from './persistence';
import { Card, CardType, Game, Player, TurnState, card, gameView, newGame, newPlayer, playerView } from './model';
import { push, PushName, setPushIndex } from './push';

export function createApp(store = new GameStore()): express.Express {
  const app = express();
  app.use(express.json());
  const ok = (message = 'success') => ({ success: true, message });
  const game = (id: string) => store.get(id);
  const save = (g: Game) => store.save(g);
  const broadcast = (event: PushName, g: Game, extra?: string) => push(event, g, extra);
  const player = (g: Game, id: string): Player => {
    const found = g.humans[id];
    if (!found) throw new ApiError(404, 'There is no such player in this game.', 'IllegalArgumentException');
    return found;
  };
  const playerByPublic = (g: Game, id: string): Player => {
    const found = g.players.find(p => p.publicUuid === id);
    if (!found) throw new ApiError(404, 'There is no such player in this game.', 'IllegalArgumentException');
    return found;
  };
  const requireLifecycle = (g: Game, lifecycle: Game['gameLifecycle']) => {
    if (g.gameLifecycle !== lifecycle) throw new ApiError(400, 'The game is in wrong state.', 'IllegalStateException');
  };
  const requireTurn = (g: Game, p: Player, states: TurnState[]) => {
    if (!states.includes(g.turnState)) throw new ApiError(400, 'The current turn of the game is in wrong state.', 'IllegalStateException');
    if (g.players[g.currentPlayerIndex] !== p) throw new ApiError(400, "It's not your turn.", 'IllegalStateException');
  };
  const getDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const color of ['RED','GREEN','BLUE','YELLOW']) {
      for (let value = 0; value <= 9; value++) {
        deck.push(card('NUMBER', color, value));
        if (value > 0) deck.push(card('NUMBER', color, value));
      }
      for (const type of ['REVERSE','SKIP','DRAW_2'] as CardType[]) for (let i=0;i<2;i++) deck.push(card(type,color));
    }
    for (let i=0;i<4;i++) deck.push(card('DRAW_4'),card('JOKER'));
    return shuffle(deck);
  };
  const shuffle = <T>(items: T[]): T[] => {
    for(let i=items.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [items[i],items[j]]=[items[j],items[i]]; }
    return items;
  };
  const match = (g: Game, c: Card) => {
    if (c.jokerCard) return true;
    const top = g.discardPile.at(-1)!;
    if (top.cardType === 'JOKER' || top.cardType === 'DRAW_4') return c.color === g.desiredColor;
    if (top.cardType === 'NUMBER') return c.value === top.value || c.color === top.color;
    return c.cardType === top.cardType || c.color === top.color;
  };
  const put = (g: Game, p: Player, c: Card, index: number) => {
    p.cards.splice(index,1); g.discardPile.push(c);
    g.drawDuties += c.drawValue;
    if(c.cardType === 'SKIP' || (c.cardType === 'REVERSE' && g.players.length === 2)) g.skip = true;
    if(c.cardType === 'REVERSE') g.reversed = !g.reversed;
    g.desiredColor = null;
    g.turnState = c.jokerCard ? 'SELECT_COLOR' : 'FINAL_COUNTDOWN';
    p.unoSaid = false;
    if(!p.cards.length) { g.gameLifecycle='SET_PLAYERS'; g.turnState='FINAL_COUNTDOWN'; g.lastWinner=g.players.indexOf(p); }
  };
  const drawOne = (g: Game, p: Player) => {
    const c=g.drawPile.pop(); if(!c) throw new ApiError(400,'No cards remain in the draw pile.','IllegalStateException');
    p.cards.push(c); p.drawn++; p.unoSaid=false;
    if(!g.drawPile.length && g.discardPile.length>1) {
      const top=g.discardPile.pop()!; g.drawPile.push(...g.discardPile.splice(0)); g.discardPile=[top];
      shuffle(g.drawPile);
    }
    if(g.turnState==='PUT_OR_DRAW') g.turnState='PUT_DRAWN';
    else if(g.turnState==='DRAW_PENALTIES') { p.drawPenalties--; if(p.drawPenalties<=0) g.turnState=g.drawDuties>0?'DRAW_DUTIES_OR_CUMULATIVE':'PUT_OR_DRAW'; }
    else { g.drawDuties--; if(g.drawDuties<=0) g.turnState='PUT_OR_DRAW'; }
    return c;
  };
  const drawMany = (g: Game, p: Player) => {
    const count=p.drawPenalties>0?p.drawPenalties:g.drawDuties;
    g.drawReason=p.drawPenalties>0?'penalties':'duties'; g.drawnCards=count;
    for(let i=0;i<count;i++) drawOne(g,p);
  };
  const nextPlayer = (g: Game) => {
    const current=g.players[g.currentPlayerIndex];
    if(current && ((current.cards.length===1 && !current.unoSaid)||(current.cards.length!==1 && current.unoSaid))) current.drawPenalties=2;
    let steps=g.skip?2:1; g.skip=false; if(g.reversed) steps=g.players.length-steps;
    g.currentPlayerIndex=(g.currentPlayerIndex+steps)%g.players.length;
    const p=g.players[g.currentPlayerIndex]; g.turnState=p.drawPenalties>0?'DRAW_PENALTIES':g.drawDuties>0?'DRAW_DUTIES_OR_CUMULATIVE':'PUT_OR_DRAW';
    broadcast('next-turn',g);
  };
  const publicGameState = (g: Game, p?: Player) => ({success:true,message:'success',game:gameView(g),players:g.players.map(playerView),ownCards:p?.cards ?? null,myIndex:p?g.players.indexOf(p):-1});
  const runBot = (g: Game, p: Player) => {
    if (!p.bot || g.gameLifecycle !== 'RUNNING') return;
    const party = g.party;
    const run = () => {
      if (g.gameLifecycle !== 'RUNNING' || g.party !== party || g.players[g.currentPlayerIndex] !== p) return;
      if (g.turnState === 'DRAW_PENALTIES') { drawMany(g,p); broadcast('drawn-cards',g); }
      else if (g.turnState === 'DRAW_DUTIES_OR_CUMULATIVE') {
        const top=g.discardPile.at(-1)!;
        const candidate=top.drawCard?p.cards.find(c=>c.drawValue===top.drawValue):undefined;
        if(candidate) { put(g,p,candidate,p.cards.indexOf(candidate)); broadcast('put-card',g); }
        else { drawMany(g,p); broadcast('drawn-cards',g); }
      } else if (g.turnState === 'PUT_OR_DRAW') {
        let candidates=p.cards.filter(c=>match(g,c));
        if(candidates.some(c=>!c.jokerCard)) candidates=candidates.filter(c=>!c.jokerCard);
        const c=candidates[Math.floor(Math.random()*candidates.length)];
        if(c) {put(g,p,c,p.cards.indexOf(c));broadcast('put-card',g);} else {drawOne(g,p);broadcast('drawn-card',g);}
      } else if (g.turnState === 'PUT_DRAWN') {
        const c=p.cards.at(-1)!;
        if(match(g,c)){put(g,p,c,p.cards.length-1);broadcast('put-card',g);}else{g.turnState='FINAL_COUNTDOWN';broadcast('kept-card',g);}
      } else if (g.turnState === 'SELECT_COLOR') {
        const colors=['RED','GREEN','BLUE','YELLOW']; const counts=colors.map(color=>p.cards.filter(c=>!c.jokerCard&&c.color===color).length);
        g.desiredColor=colors[counts.indexOf(Math.max(...counts))];g.turnState='FINAL_COUNTDOWN';broadcast('selected-color',g);
      }
      if (!p.cards.length) {g.lastWinner=g.players.indexOf(p);broadcast('finished-game',g);}
      save(g);
      if(g.turnState==='FINAL_COUNTDOWN'&&g.gameLifecycle==='RUNNING') {
        if(p.cards.length===1 && Math.random()<0.9) {p.unoSaid=true;setPushIndex(g,p);broadcast('said-uno',g);}
        nextPlayer(g);save(g);const next=g.players[g.currentPlayerIndex];if(next) runBot(g,next);
      }
      else setTimeout(run,350);
    };
    setTimeout(run,350);
  };

  app.post('/api/game/create/:token?', (req,res,next) => {
    try {
      for (const [uuid, existing] of store.games) if (Date.now() - existing.lastAction > 8 * 60 * 60 * 1000) store.delete(uuid);
      const enabled=process.env.FEATURE_TOKENIZED_GAME_CREATE==='on';
      if(enabled) {
        const token=String(req.params.token ?? ''); const m=/^([a-zA-Z0-9_-]{11})\.([a-zA-Z0-9_-]{11})$/.exec(token);
        const dir=path.resolve(process.env.TOKENS_DIRECTORY ?? path.join(process.env.DATA_PATH ?? path.resolve(__dirname, '../../data'), 'tokens'));
        const hash=m?(()=>{try{return fs.readFileSync(path.join(dir,m[1]),'utf8')}catch{return ''}})():'';
        if(!m || !hash || !bcrypt.compareSync(m[2],hash)) throw new ApiError(401,'Invalid Token provided.','InvalidTokenException');
      }
      const g=newGame(); store.games.set(g.uuid,g); save(g); res.status(201).json({success:true,message:'success',gameUuid:g.uuid});
    } catch(e) { next(e); }
  });
  app.get('/api/game/tokenized-game-create-enabled',(_req,res)=>res.json({success:true,message:process.env.FEATURE_TOKENIZED_GAME_CREATE==='on'?'on':'off'}));
  app.post('/api/game/start/:gameUuid',(req,res,next)=>{ try {
    const g=game(req.params.gameUuid); requireLifecycle(g,'SET_PLAYERS');
    if(g.players.length<2) throw new ApiError(400,'There are not enough players in the game.','IllegalStateException');
    for(const p of g.players){p.cards=[];p.unoSaid=false;p.drawPenalties=0;p.drawn=0;p.stopPartyRequested=false;}
    g.drawPile=[];g.discardPile=[];g.reversed=false;g.desiredColor=null;g.skip=false;g.drawDuties=0;g.stopPartyRequested=0;g.turnState='PUT_OR_DRAW';
    g.currentPlayerIndex=g.lastWinner>=0?g.lastWinner:Math.floor(Math.random()*g.players.length);
    let deck=getDeck(); while(!deck.at(-1)?.numberCard) deck=getDeck();
    if(g.previousFirstCardReceivers.length===g.players.length) g.previousFirstCardReceivers=[];
    const eligible=g.players.map((p,i)=>({p,i})).filter(({p})=>!g.previousFirstCardReceivers.includes(p.uuid));
    const receiver=eligible[Math.floor(Math.random()*eligible.length)].i;
    g.previousFirstCardReceivers.push(g.players[receiver].uuid);
    for(let i=0;i<7;i++) for(let j=0;j<g.players.length;j++) g.players[(receiver+j)%g.players.length].cards.push(deck.pop()!);
    g.discardPile.push(deck.pop()!);g.drawPile=deck;g.gameLifecycle='RUNNING';g.party++;save(g);broadcast('started-game',g);res.json(ok());runBot(g,g.players[g.currentPlayerIndex]);
  }catch(e){next(e);}});
  app.post('/api/player/add',(req,res,next)=>{try{
    const g=game(String(req.body.gameUuid));requireLifecycle(g,'SET_PLAYERS');
    if(g.players.length>=10) throw new ApiError(400,'There are already 10 players in the game. Players limit is reached.','IllegalStateException');
    const p=newPlayer(String(req.body.name??''),Boolean(req.body.bot));g.players.push(p);(p.bot?g.bots:g.humans)[p.bot?p.publicUuid:p.uuid]=p;
    broadcast('added-player',g);save(g);res.status(201).json({success:true,message:'success',playerUuid:p.uuid});
  }catch(e){next(e);}});
  const removePlayer=(req:Request,res:Response,next:NextFunction,bot:boolean,inGame:boolean)=>{try{
    const g=game(req.params.gameUuid);requireLifecycle(g,inGame?'RUNNING':'SET_PLAYERS');
    const key=bot?req.params.playerUuid: req.params.playerUuid;
    const p=bot?g.bots[key]:player(g,key); if(!p) throw new ApiError(404,'There is no such player in this game.','IllegalArgumentException');
    if(inGame){if(g.players[g.currentPlayerIndex]===p) throw new ApiError(400,'The game is in wrong state.','IllegalStateException');if(g.players.length<=2){g.gameLifecycle='SET_PLAYERS';g.turnState='FINAL_COUNTDOWN';broadcast('stop-party',g);}else g.drawPile.unshift(...p.cards);}
    const index=g.players.indexOf(p);g.playerIndexForPush=index;if(index<g.currentPlayerIndex)g.currentPlayerIndex--;if(index===g.currentPlayerIndex)g.currentPlayerIndex=0;if(index===g.lastWinner)g.lastWinner=-1;
    g.players.splice(index,1);delete (bot?g.bots:g.humans)[bot?p.publicUuid:p.uuid];g.previousFirstCardReceivers=g.previousFirstCardReceivers.filter(x=>x!==p.uuid);
    if(!Object.keys(g.humans).length){broadcast('end',g);store.delete(g.uuid);}else{broadcast('removed-player',g);save(g);}
    res.json({success:true,message:'success',playerUuid:p.uuid});
  }catch(e){next(e);}};
  app.delete('/api/player/remove/:gameUuid/:playerUuid',(q,s,n)=>removePlayer(q,s,n,false,false));
  app.delete('/api/player/removeBot/:gameUuid/:playerUuid',(q,s,n)=>removePlayer(q,s,n,true,false));
  app.delete('/api/player/removeBotInGame/:gameUuid/:playerUuid',(q,s,n)=>removePlayer(q,s,n,true,true));
  app.get('/api/gameState/get/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);res.json(publicGameState(g,p));}catch(e){next(e);}});
  app.get('/api/gameState/get/:gameUuid',(req,res,next)=>{try{res.json(publicGameState(game(req.params.gameUuid)));}catch(e){next(e);}});
  app.post('/api/turn/put',(req,res,next)=>{try{
    const g=game(String(req.body.gameUuid)),p=player(g,String(req.body.playerUuid)),idx=Number(req.body.cardIndex);
    requireLifecycle(g,'RUNNING');requireTurn(g,p,['DRAW_DUTIES_OR_CUMULATIVE','PUT_OR_DRAW','PUT_DRAWN']);
    const c=p.cards[idx],incoming=req.body.card as Card;
    if(!c||!incoming||c.cardType!==incoming.cardType||c.color!==incoming.color||c.value!==incoming.value) throw new ApiError(404,'The player has no has no such card at this position.','IllegalArgumentException');
    if(g.turnState==='PUT_DRAWN' && idx!==p.cards.length-1) throw new ApiError(400,'','CardDoesNotMatchException');
    if(g.turnState==='DRAW_DUTIES_OR_CUMULATIVE'&&c.drawValue!==(g.discardPile.at(-1)?.drawValue??0)) throw new ApiError(400,'Card does not match.');
    if(!match(g,c)) throw new ApiError(400,'','CardDoesNotMatchException');
    put(g,p,c,idx);broadcast('put-card',g);if(!p.cards.length)broadcast('finished-game',g);save(g);res.json({success:true,message:'success',card:g.discardPile.at(-1)});
  }catch(e){next(e);}});
  app.post('/api/turn/draw/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');requireTurn(g,p,['PUT_OR_DRAW']);const c=drawOne(g,p);if(g.turnState==='PUT_DRAWN'&&!match(g,c))g.turnState='FINAL_COUNTDOWN';save(g);broadcast('drawn-card',g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/turn/draw-multiple/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');requireTurn(g,p,['DRAW_PENALTIES','DRAW_DUTIES_OR_CUMULATIVE']);drawMany(g,p);save(g);broadcast('drawn-cards',g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/turn/select-color/:gameUuid/:playerUuid/:color',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');requireTurn(g,p,['SELECT_COLOR']);const color=req.params.color.toUpperCase();if(!['RED','GREEN','BLUE','YELLOW'].includes(color))throw new ApiError(404,'There is no such color in UNO.','IllegalArgumentException');g.desiredColor=color;g.turnState='FINAL_COUNTDOWN';broadcast('selected-color',g);save(g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/turn/say-uno/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');requireTurn(g,p,['SELECT_COLOR','FINAL_COUNTDOWN']);p.unoSaid=true;setPushIndex(g,p);broadcast('said-uno',g);save(g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/turn/keep/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');requireTurn(g,p,['PUT_DRAWN']);g.turnState='FINAL_COUNTDOWN';broadcast('kept-card',g);save(g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/turn/next/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');requireTurn(g,p,['FINAL_COUNTDOWN']);nextPlayer(g);save(g);res.json(ok());runBot(g,g.players[g.currentPlayerIndex]);}catch(e){next(e);}});
  app.post('/api/game/chat/send-message',(req,res,next)=>{try{const g=game(String(req.body.gameUuid)),p=player(g,String(req.body.playerUuid)),content=String(req.body.content??'').trim();if(!content)throw new ApiError(400,'Chat message is empty. Will not save empty messages.','EmptyArgumentException');const msg={content,playerPublicUuid:p.publicUuid,time:Date.now()};g.messages.push(msg);broadcast('chat-message',g,`${p.publicUuid}:${msg.time}:${content}`);save(g);res.status(201).json(ok());}catch(e){next(e);}});
  app.post('/api/player/botify/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);p.bot=true;delete g.humans[p.uuid];g.bots[p.publicUuid]=p;if(!Object.keys(g.humans).length){broadcast('end',g);store.delete(g.uuid);}else{setPushIndex(g,p);broadcast('botified-player',g);save(g);runBot(g,p);}res.json(ok());}catch(e){next(e);}});
  app.post('/api/player/request-botify/:gameUuid/:publicUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=playerByPublic(g,req.params.publicUuid);if(!p.botifyPending){p.botifyPending=true;setPushIndex(g,p);broadcast('request-botify-player',g);setTimeout(()=>{if(p.botifyPending){p.botifyPending=false;p.bot=true;delete g.humans[p.uuid];g.bots[p.publicUuid]=p;if(!Object.keys(g.humans).length){broadcast('end',g);store.delete(g.uuid);}else{setPushIndex(g,p);broadcast('botified-player',g);save(g);runBot(g,p);}}},10000);}res.json(ok());}catch(e){next(e);}});
  app.post('/api/player/cancel-botify/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);if(p.botifyPending){p.botifyPending=false;setPushIndex(g,p);broadcast('cancel-botify-player',g);save(g);}res.json(ok());}catch(e){next(e);}});
  app.post('/api/player/request-stop-party/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');if(!p.stopPartyRequested){p.stopPartyRequested=true;g.stopPartyRequested++;setPushIndex(g,p);}if(g.stopPartyRequested===Object.keys(g.humans).length){g.gameLifecycle='SET_PLAYERS';g.turnState='FINAL_COUNTDOWN';for(const h of Object.values(g.humans))h.stopPartyRequested=false;g.stopPartyRequested=0;broadcast('stop-party',g);}else broadcast('request-stop-party',g);save(g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/player/revoke-request-stop-party/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);requireLifecycle(g,'RUNNING');if(p.stopPartyRequested){p.stopPartyRequested=false;g.stopPartyRequested--;setPushIndex(g,p);}broadcast('revoke-request-stop-party',g);save(g);res.json(ok());}catch(e){next(e);}});
  app.post('/api/switch/finished/:gameUuid/:playerUuid',(req,res,next)=>{try{const g=game(req.params.gameUuid),p=player(g,req.params.playerUuid);push('switch-finished',g,String(g.players.indexOf(p)));res.json(ok());}catch(e){next(e);}});
  app.post('/api/switch/in/:pushUuid/:gameUuid/:playerUuid/:sayUno/:readMessages',(req,res)=>{publishSwitch(req.params.pushUuid,`switch-in:${req.params.gameUuid}:${req.params.playerUuid}:${req.params.sayUno}:${req.params.readMessages}`);res.json(ok());});
  const staticDirectory = path.resolve(__dirname, '../static');
  app.use(express.static(staticDirectory));
  app.get('*',(req,res,next)=>{
    if(req.path.startsWith('/api/')) { next(); return; }
    const index=path.join(staticDirectory,'index.html');
    if(fs.existsSync(index)) res.sendFile(index); else next();
  });
  app.all('*',(req,res)=>{
    const known = /^\/api\/(game\/(create(?:\/[^/]+)?|start\/[^/]+|tokenized-game-create-enabled|chat\/send-message)|gameState\/get\/[^/]+(?:\/[^/]+)?|player\/(add|remove\/[^/]+\/[^/]+|removeBot\/[^/]+\/[^/]+|removeBotInGame\/[^/]+\/[^/]+|botify\/[^/]+\/[^/]+|request-botify\/[^/]+\/[^/]+|cancel-botify\/[^/]+\/[^/]+|request-stop-party\/[^/]+\/[^/]+|revoke-request-stop-party\/[^/]+\/[^/]+)|turn\/(put|draw\/[^/]+\/[^/]+|draw-multiple\/[^/]+\/[^/]+|select-color\/[^/]+\/[^/]+\/[^/]+|say-uno\/[^/]+\/[^/]+|keep\/[^/]+\/[^/]+|next\/[^/]+\/[^/]+)|switch\/(finished\/[^/]+\/[^/]+|in\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/[^/]+))$/;
    if(known.test(req.path)) res.status(405).json({success:false,message:'failure: Wrong request method'});
    else res.status(404).json({success:false,message:'failure: Bad URL. Wrong path or missing url arguments'});
  });
  app.use((error: unknown,_req:Request,res:Response,_next:NextFunction)=>{
    if(error instanceof ApiError) {res.status(error.status).json(error.response());return;}
    const err=error instanceof Error?error:new Error(String(error));
    res.status(500).json({success:false,message:`failure: ${err}`});
  });
  return app;
}

import { publish as publishSwitch } from './push';
