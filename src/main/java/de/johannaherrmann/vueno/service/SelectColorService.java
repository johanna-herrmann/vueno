package de.johannaherrmann.vueno.service;

import de.johannaherrmann.vueno.data.fixed.Color;
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
public class SelectColorService {

    private final TurnService turnService;
    private static final Logger LOGGER = LoggerFactory.getLogger(SelectColorService.class);

    @Autowired
    public SelectColorService(TurnService turnService) {
        this.turnService = turnService;
    }

    public void selectColor(String gameUuid, String playerUuid, String color) throws IllegalStateException, IllegalArgumentException {
        Game game = turnService.getGame(gameUuid);
        synchronized (game) {
            Player player = turnService.getPlayer(playerUuid, game);
            preChecks(game, player);
            String colorName = getColorName(color);
            selectColor(game, colorName);
            turnService.pushAction(PushMessage.SELECTED_COLOR, game);
        }
    }

    static void selectColor(Game game, String colorName){
        game.setDesiredColor(colorName);
        game.setTurnState(TurnState.FINAL_COUNTDOWN);
        LOGGER.info("Successfully selected color. Game: {}; Color: {}", game.getUuid(), colorName);
    }

    private String getColorName(String color) throws IllegalArgumentException {
        try {
            return Color.valueOf(color.toUpperCase()).name();
        } catch(java.lang.IllegalArgumentException ex){
            LOGGER.error("There is no such color. name: {}", color);
            throw new IllegalArgumentException(ExceptionMessage.NO_SUCH_COLOR.getValue());
        }
    }

    private void preChecks(Game game, Player player) throws IllegalStateException {
        if(!turnService.isGameInLifecycle(game, GameLifecycle.RUNNING)){
            throw new IllegalStateException(ExceptionMessage.INVALID_STATE_GAME.getValue());
        }
        turnService.failIfInvalidTurnState(
                game,
                player.getUuid(),
                this.getClass(),
                TurnState.SELECT_COLOR);
        if(!turnService.isPlayersTurn(game, player)){
            throw new IllegalStateException(ExceptionMessage.NOT_YOUR_TURN.getValue());
        }
    }
}
