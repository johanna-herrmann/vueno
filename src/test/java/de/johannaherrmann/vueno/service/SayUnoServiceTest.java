package de.johannaherrmann.vueno.service;

import de.johannaherrmann.vueno.TestHelper;
import de.johannaherrmann.vueno.data.state.component.Game;
import de.johannaherrmann.vueno.data.state.component.GameLifecycle;
import de.johannaherrmann.vueno.data.state.component.Player;
import de.johannaherrmann.vueno.data.state.component.TurnState;
import de.johannaherrmann.vueno.exceptions.ExceptionMessage;
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
public class SayUnoServiceTest {

    @Autowired
    SayUnoService sayUnoService;

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
        game.getPlayers().get(0).setUnoSaid(false);
    }

    @Test
    public void shouldSayUnoInSelectColorState(){
        shouldSayUno(TurnState.SELECT_COLOR);
    }

    @Test
    public void shouldSayUnoInFinalCountdownState(){
        shouldSayUno(TurnState.FINAL_COUNTDOWN);
    }

    @Test
    public void shouldFailCausedByInvalidLifecycle(){
        game.setGameLifecycle(GameLifecycle.SET_PLAYERS);
        Exception expectedException = new IllegalStateException(ExceptionMessage.INVALID_STATE_GAME.getValue());
        shouldFail(TurnState.FINAL_COUNTDOWN, expectedException);
    }

    @Test
    public void shouldFailCausedByInvalidTurnState(){
        Exception expectedException = new IllegalStateException(ExceptionMessage.INVALID_STATE_TURN.getValue());
        shouldFail(TurnState.DRAW_DUTIES_OR_CUMULATIVE, expectedException);
    }

    @Test
    public void shouldFailCausedByAnotherTurn(){
        game.setCurrentPlayerIndex(1);
        Exception expectedException = new IllegalStateException(ExceptionMessage.NOT_YOUR_TURN.getValue());
        shouldFail(TurnState.FINAL_COUNTDOWN, expectedException);
    }

    private void shouldSayUno(TurnState turnState){
        game.setTurnState(turnState);
        String gameUuid = game.getUuid();
        Player player = game.getPlayers().get(0);
        String playerUuid = player.getUuid();

        sayUnoService.sayUno(gameUuid, playerUuid);

        assertThat(player.isUnoSaid()).isTrue();
        assertThat(game.getTurnState()).isEqualTo(turnState);
        assertThat(PushService.getLastMessage()).isEqualTo(PushMessage.SAID_UNO);
    }

    private void shouldFail(TurnState turnState, Exception expectedException){
        game.setTurnState(turnState);
        String gameUuid = game.getUuid();
        Player player = game.getPlayers().get(0);
        String playerUuid = player.getUuid();
        Exception exception = null;

        try {
            sayUnoService.sayUno(gameUuid, playerUuid);
        }
        catch(Exception ex){
            exception = ex;
        }

        assertFailed(player, turnState, exception, expectedException);
    }

    private void assertFailed(Player player, TurnState turnState, Exception exception, Exception expectedException){
        assertThat(player.isUnoSaid()).isFalse();
        assertThat(game.getTurnState()).isEqualTo(turnState);
        assertThat(exception).isInstanceOf(expectedException.getClass());
        assertThat(exception.getMessage()).isEqualTo(expectedException.getMessage());
    }
}
