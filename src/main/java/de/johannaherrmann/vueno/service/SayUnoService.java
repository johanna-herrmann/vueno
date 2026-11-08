package de.johannaherrmann.vueno.service;

import de.johannaherrmann.vueno.data.state.component.Game;
import de.johannaherrmann.vueno.data.state.component.GameLifecycle;
import de.johannaherrmann.vueno.data.state.component.Player;
import de.johannaherrmann.vueno.data.state.component.TurnState;
import de.johannaherrmann.vueno.exceptions.ExceptionMessage;
import de.johannaherrmann.vueno.exceptions.IllegalArgumentException;
import de.johannaherrmann.vueno.exceptions.IllegalStateException;
import de.johannaherrmann.vueno.service.push.PushMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SayUnoService {

    private final TurnService turnService;
    private static final Logger LOGGER = LoggerFactory.getLogger(SayUnoService.class);

    @Autowired
    public SayUnoService(TurnService turnService) {
        this.turnService = turnService;
    }

    public void sayUno(String gameUuid, String playerUuid) throws IllegalStateException, IllegalArgumentException {
        Game game = turnService.getGame(gameUuid);
        synchronized (game) {
            Player player = turnService.getPlayer(playerUuid, game);
            preChecks(game, player);
            sayUno(game, player);
            turnService.pushAction(PushMessage.SAID_UNO, game);
        }
    }

    static void sayUno(Game game, Player player){
        player.setUnoSaid(true);
        game.setPlayerIndexForPush(game.getPlayers().indexOf(player));
        LOGGER.info("Successfully said uno. Game: {}; Player: {}", game.getUuid(), player.getUuid());
    }

    private void preChecks(Game game, Player player) throws IllegalStateException {
        if(!turnService.isGameInLifecycle(game, GameLifecycle.RUNNING)){
            throw new IllegalStateException(ExceptionMessage.INVALID_STATE_GAME.getValue());
        }
        turnService.failIfInvalidTurnState(
                game,
                player.getUuid(),
                this.getClass(),
                TurnState.SELECT_COLOR,
                TurnState.FINAL_COUNTDOWN);
        if(!turnService.isPlayersTurn(game, player)){
            throw new IllegalStateException(ExceptionMessage.NOT_YOUR_TURN.getValue());
        }
    }
}
