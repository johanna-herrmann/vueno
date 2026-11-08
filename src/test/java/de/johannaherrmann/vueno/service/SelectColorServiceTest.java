package de.johannaherrmann.vueno.service;

import de.johannaherrmann.vueno.TestHelper;
import de.johannaherrmann.vueno.data.fixed.Color;
import de.johannaherrmann.vueno.data.state.component.Game;
import de.johannaherrmann.vueno.data.state.component.GameLifecycle;
import de.johannaherrmann.vueno.data.state.component.TurnState;
import de.johannaherrmann.vueno.exceptions.ExceptionMessage;
import de.johannaherrmann.vueno.exceptions.IllegalArgumentException;
import de.johannaherrmann.vueno.exceptions.IllegalStateException;
import de.johannaherrmann.vueno.service.push.PushMessage;
import de.johannaherrmann.vueno.service.push.PushService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
public class SelectColorServiceTest {

    @Autowired
    SelectColorService selectColorService;

    @Autowired
    private GameService gameService;

    @Autowired
    private PlayerService playerService;

    @MockBean
    private PersistenceService persistenceService;

    private Game game;

    @Before
    public void setup(){
        game = TestHelper.prepareAndStartGame(gameService, playerService);
        game.setDesiredColor(null);
        game.setTurnState(TurnState.SELECT_COLOR);
    }

    @Test
    public void shouldSelectColorRed(){
        shouldSelectColor(Color.RED.name());
    }

    @Test
    public void shouldSelectColorGreen(){
        shouldSelectColor(Color.GREEN.name());
    }

    @Test
    public void shouldSelectColorBlue(){
        shouldSelectColor(Color.BLUE.name());
    }

    @Test
    public void shouldSelectColorYellow(){
        shouldSelectColor(Color.YELLOW.name());
    }

    @Test
    public void shouldFailCausedByInvalidColor(){
        Exception expectedException = new IllegalArgumentException(ExceptionMessage.NO_SUCH_COLOR.getValue());
        shouldFail("GOLD", expectedException);
    }

    @Test
    public void shouldFailCausedByInvalidLifecycle(){
        game.setGameLifecycle(GameLifecycle.SET_PLAYERS);
        Exception expectedException = new IllegalStateException(ExceptionMessage.INVALID_STATE_GAME.getValue());
        shouldFail("RED", expectedException);
    }

    @Test
    public void shouldFailCausedByInvalidTurnState(){
        game.setTurnState(TurnState.DRAW_DUTIES_OR_CUMULATIVE);
        Exception expectedException = new IllegalStateException(ExceptionMessage.INVALID_STATE_TURN.getValue());
        shouldFail("RED", expectedException);
    }

    @Test
    public void shouldFailCausedByAnotherTurn(){
        game.setCurrentPlayerIndex(1);
        Exception expectedException = new IllegalStateException(ExceptionMessage.NOT_YOUR_TURN.getValue());
        shouldFail("RED", expectedException);
    }

    private void shouldSelectColor(String color){
        String gameUuid = game.getUuid();
        String playerUuid = game.getPlayers().get(0).getUuid();

        selectColorService.selectColor(gameUuid, playerUuid, color);

        assertThat(game.getDesiredColor()).isEqualTo(color);
        assertThat(game.getTurnState()).isEqualTo(TurnState.FINAL_COUNTDOWN);
        assertThat(PushService.getLastMessage()).isEqualTo(PushMessage.SELECTED_COLOR);
    }

    private void shouldFail(String color, Exception expectedException){
        String gameUuid = game.getUuid();
        String playerUuid = game.getPlayers().get(0).getUuid();
        Exception exception = null;
        TurnState turnStateBefore = game.getTurnState();

        try {
            selectColorService.selectColor(gameUuid, playerUuid, color);
        }
        catch(Exception ex){
            exception = ex;
        }

        assertFailed(turnStateBefore, exception, expectedException);
    }

    private void assertFailed(TurnState turnStateBefore, Exception exception, Exception expectedException){
        assertThat(game.getDesiredColor()).isNull();
        assertThat(game.getTurnState()).isEqualTo(turnStateBefore);
        assertThat(exception).isInstanceOf(expectedException.getClass());
        assertThat(exception.getMessage()).isEqualTo(expectedException.getMessage());
    }
}
