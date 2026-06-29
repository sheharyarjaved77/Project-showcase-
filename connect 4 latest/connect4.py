from gameboard import GameBoard
from player import HumanPlayer, ComputerPlayer
from gamegui import GameGUI

def main():
    gboard = GameBoard()  # allows access to GameBoard methods & attributes using variable
    player1_colour = ""
    player2_colour = ""
    p1 = HumanPlayer("X", gboard, player1_colour)  
    p2 = ComputerPlayer("O", gboard, player2_colour)  
    players_lst = (p1, p2)  # players 1 & 2 in tuple for turn based game
    b_gui = GameGUI()  # allows access to GameGUI methods & attributes using variable
    b_gui.initialise()  # calls initialise method from GameGUI class

    winner = False

    gboard.show_board_dynamic()  # show empty grid at the beginning of the game

    while (winner == False):
        # This is to allow players to take turns. 
        # The game begins with the player at index zero in the tuple,
        # When the player completes its turn, the next player in the tuple will be asked to play. 
        # If there is no winner, this will continue until reaching the end of the players list, 
        # and then we start again from the beggining of the list.

        for p in players_lst:
            p.play()  
            # after each move board is shown on the screen
            gboard.show_board_dynamic()  

            # check if a player has won the game
            winner = gboard.check_winner()

            if winner==True:# Show current player's symbol as Winner, 
                # and terminate the game
                print(f"Player {p.get_player_symbol()} is the Winner!")
                break

            # Add an if statement to check if the board is full. If the board
            # is full, print a message and end the game   
            if gboard.is_board_full():
                print("The board is full. It's a draw!")
                winner = True #so no more turns can be taken
                break

def main():
    print("Welcome to Connect4!")
    while True:#will continue to print message until a correct input is given
        print("Choose interface:")
        print("\t 1. Console")
        print("\t 2. GUI")
        choice = input("Enter number to choose interface or q to quit: ")
        if choice.lower() == "q":
            break
        elif choice == "1":
            print("")
            game = GameBoard()
            game.play_game()
        elif choice == "2":
            b_gui = GameGUI()
            b_gui.initialise()
            break

if __name__ == "__main__":
    main()
#will only run if executed directly not imported as a module
