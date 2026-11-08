package de.johannaherrmann.vueno.service;

import de.johannaherrmann.vueno.data.state.component.Game;
import de.johannaherrmann.vueno.data.state.component.GameLifecycle;
import de.johannaherrmann.vueno.data.state.component.Player;
import de.johannaherrmann.vueno.data.state.component.TurnState;
import de.johannaherrmann.vueno.exceptions.ExceptionMessage;
import de.johannaherrmann.vueno.exceptions.IllegalArgumentException;
import de.johannaherrmann.vueno.exceptions.IllegalStateException;

import de.johannaherrmann.vueno.service.push.PushMessage;
import de.johannaherrmann.vueno.service.push.PushService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class TurnService {

    private final FinalizeTurnService finalizeTurnService;
    private final GameService gameService;
    private final PlayerService playerService;
    private final GlobalStateService globalStateService;
    private final PushService pushService;

    private static final Logger LOGGER = LoggerFactory.getLogger(TurnService.class);

    @Autowired
    public TurnService(FinalizeTurnService finalizeTurnService, GameService gameService, PlayerService playerService,
                       GlobalStateService globalStateService, PushService pushService){
        this.finalizeTurnService = finalizeTurnService;
        this.gameService = gameService;
        this.playerService = playerService;
        this.globalStateService = globalStateService;
        this.pushService = pushService;
    }

    public void next(String gameUuid, String playerUuid){
        Game game = getGame(gameUuid);
        synchronized (game){
            Player player = getPlayer(playerUuid, game);
            if(!this.isGameInLifecycle(game, GameLifecycle.RUNNING)){
                throw new IllegalStateException(ExceptionMessage.INVALID_STATE_GAME.getValue());
            }
            failIfInvalidTurnState(game, playerUuid, this.getClass(), TurnState.FINAL_COUNTDOWN);
            if(!isPlayersTurn(game, player)){
                throw new IllegalStateException(ExceptionMessage.NOT_YOUR_TURN.getValue());
            }
        }
        finalizeTurn(game);
    }

    void finalizeTurn(Game game){
        Runnable runnable = () -> finalizeTurnService.finalize(game);
        Thread thread = new Thread(runnable);
        thread.start();
    }

    boolean isPlayersTurn(Game game, Player player){
        int currentIndex = game.getCurrentPlayerIndex();
        Player current = game.getPlayers().get(currentIndex);
        boolean playersTurn = current.equals(player);
        if(!playersTurn){
            LOGGER.warn(
                    "It's not the players turn. Game: {}; playersIndex: {}; currentPlayerIndex: {}",
                    game.getUuid(),
                    game.getPlayers().indexOf(player),
                    game.getCurrentPlayerIndex());
        }
        return playersTurn;
    }

    boolean isGameInLifecycle(Game game, GameLifecycle gameLifecycle){
        boolean inLifecycle = game.getGameLifecycle().equals(gameLifecycle);
        if(!inLifecycle){
            LOGGER.error("game is in wrong lifecycle. Game: {}", game.getUuid());
        }
        return inLifecycle;
    }

    void failIfInvalidTurnState(Game game, String playerUuid, Class<?> service, TurnState... validTurnStates) throws IllegalStateException {
        for(TurnState state : validTurnStates){
            if(game.getTurnState().equals(state)){
                return;
            }
        }
        LOGGER.error("turn is in wrong state for this action. Game: {}; Player: {}; validStates: {}; state: {}; Service: {}",
                game.getUuid(),
                playerUuid,
                Arrays.asList(validTurnStates),
                game.getTurnState(),
                service.getSimpleName());
        throw new IllegalStateException(ExceptionMessage.INVALID_STATE_TURN.getValue());
    }

    Game getGame(String gameUuid) throws IllegalArgumentException {
        return gameService.getGame(gameUuid);
    }

    Player getPlayer(String playerUuid, Game game) throws IllegalArgumentException {
        return playerService.getPlayer(playerUuid, game);
    }

    void pushAction(PushMessage message, Game game){
        pushService.push(message, game);
    }
}
