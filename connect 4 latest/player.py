import random

class Player:
    
    def __init__(self, symbol, board):
        # Initialize player with symbol and game board
        self.__symbol = symbol
        self._gboard = board
    
    def get_player_symbol(self):
        # Get player's symbol
        return self.__symbol
    

class HumanPlayer(Player):
    
    def __init__(self, symbol, board, colour):
        # Initialize human player with symbol, board, and color
        Player.__init__(self, symbol, board)
        self.colour = colour
    
    def play(self):
        # Method to allow human players to make a move
        print("Player %s turn" % self.get_player_symbol())
        while True:
            col = int(input("Please enter column no: "))
            if self._gboard.is_space_free(0, col):
                self._gboard.make_move(col, self.get_player_symbol())
                break
            else:
                print("This column is full. Please choose another column.")


class ComputerPlayer(Player):
    
    def __init__(self, symbol, board, colour, buttons_2d_list=[]):
        # Initialize computer player with symbol, board, color, and optional button list for GUI
        Player.__init__(self, symbol, board)
        self.buttons_2d_list = buttons_2d_list
        self.colour = colour
    
    def play(self):
        # Method for computer player to make a move
        if len(self.buttons_2d_list) > 0:
            self.__play_gui()
            return
        print("Player %s turn" % self.get_player_symbol())
        # Add a delay of 2000 milliseconds (2 seconds) before making a move
        self._gboard.after(2000, self.make_random_move)

    def make_random_move(self):
        # Make a random move by selecting a random column
        col = random.randint(0, self._gboard.get_num_cols() - 1)
        if self._gboard.is_space_free(0, col):
            self._gboard.make_move(col, self.get_player_symbol())
        else:
            # If the chosen column is full, keep trying random columns until an empty one is found or the board is full
            while True:
                col = random.randint(0, self._gboard.get_num_cols() - 1)
                if self._gboard.is_space_free(0, col):
                    self._gboard.make_move(col, self.get_player_symbol())
                    break
                elif self._gboard.is_board_full():
                    break

    def __play_gui(self):
        # Method for computer player to make a move in a GUI game
        # Generate a random number for the column
        col = random.randint(0, self._gboard.get_num_cols() - 1)
        # Start from the bottom row and check each row upwards until an empty cell is found
        for row in range(self._gboard.get_num_rows() - 1, -1, -1):
            if self.buttons_2d_list[row][col]["text"] == " ":
                # Invoke a click on the button corresponding to the chosen column
                self.buttons_2d_list[row][col].invoke()
                break
