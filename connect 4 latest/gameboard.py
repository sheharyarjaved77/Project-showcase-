import random

class GameBoard:
    def __init__(self, num_rows=6, num_cols=7):
        self.__space = ''# defines empty space symbol
        self.__num_rows = num_rows #sets number of rows
        self.__num_cols = num_cols #sets number of colums
        self.__board =  []
            
        for i in range(self.__num_rows):
            row = [self.__space] * self.__num_cols
            self.__board.append(row)

    def get_num_rows(self):
        return self.__num_rows

    def get_num_cols(self):
        return self.__num_cols

    def is_board_full(self):
        # TODO: Return True if every space on the board has been taken. Otherwise return False.
        for row in self.__board:#goes through every item in the list
            for space in row:
                if space == self.__space:
                    return False
        # if all spaces are filled return true         
        return True

    def is_space_free(self, row, col):
        # Return True if the space in place row, col is free (equal to self.__space) in the board.
        # Otherwise return False.
        if self.__board[row][col] == self.__space:
            return True
        return False

    def make_move(self, col, element):
        # TODO: Using a for loop, find the first blank space in the specified column (col),
        # from the botttom, and change its value to the given element
        for row in range(self.__num_rows - 1, -1, -1):#starts and stops at last item in gameboard. last -1 means it will loop one at a time in reverse order
            if self.__board[row][col] == self.__space:
                self.__board[row][col] = element
                break

    def show_board_dynamic(self):
        for row in range(self.__num_rows):
            self.__print_horizontal_line()#print horizontal line for each row
            for col in range(self.__num_cols):
                print("|", end=" ")  #print vertical bar before each cell. end="" makes it so next print statement can be on same line
                print(f" {self.__board[row][col]}", end=" ")#prints content of cell. 
            print("|")  # print vertical bar at the end of each row
        self.__print_horizontal_line()#for bottom border of grid


    def __print_horizontal_line(self):
        print("+", end="")#prints + at beginning of horizontal line. The end="" argument ensures that the next print statement does not start on a new line
        for i in range(self.__num_cols):
            end = "+"
            print("---", end=end) #prints - with + at the end for each column
        print("")#ensures that each horizontal line is printed on a separate line

    def __check_winner_hz(self):
        for row in range(self.__num_rows):
            for col in range(self.__num_cols - 3):
                if self.__board[row][col] == self.__board[row][col + 1] == self.__board[row][col + 2] == self.__board[row][col + 3] != self.__space:
                #checks if there are four consecutive nonempty cells with the same symbol in the same row
                    return True
        return False

    def __check_winner_vt(self):
        for col in range(self.__num_cols):
            for row in range(self.__num_rows - 3):
                if self.__board[row][col] == self.__board[row + 1][col] == self.__board[row + 2][col] == \
                        self.__board[row + 3][col] != self.__space:
                    return True
        return False
    
    def __check_winner_diag_tl_br(self):
        for row in range(self.__num_rows - 3):
            for col in range(self.__num_cols - 3):
                if self.__board[row][col] == self.__board[row + 1][col + 1] == self.__board[row + 2][col + 2] == \
                   self.__board[row + 3][col + 3] != self.__space:
                    return True
        return False    

    def __check_winner_diag_tr_bl(self):
        for row in range(self.__num_rows - 3):
            for col in range(3, self.__num_cols):
                if self.__board[row][col] == self.__board[row + 1][col - 1] == self.__board[row + 2][col - 2] == \
                        self.__board[row + 3][col - 3] != self.__space:
                    return True
        return False

    def check_winner(self):
        return self.__check_winner_hz() or self.__check_winner_vt() or \
               self.__check_winner_diag_tl_br() or self.__check_winner_diag_tr_bl()

    def play_game(self):
        current_player = 'X'
        while not self.is_board_full() and not self.check_winner():
            self.show_board_dynamic()
            if current_player == 'X':
                col = int(input(f"Player {current_player}, enter the column (1-{self.__num_cols}): ")) - 1
            else:  # Computer's turn
                col = random.randint(0, self.__num_cols - 1)
                print(f"Player {current_player} chooses column {col + 1}")

            if 0 <= col < self.__num_cols and self.is_space_free(0, col):
                self.make_move(col, current_player)
                # check for a winner before switching players
                if self.check_winner():
                    print(f"Player {current_player} wins!")
                    break
                if current_player == 'X':
                    current_player = 'O'
                else:
                    current_player = 'X'
            else:
                print("Invalid move! Try again.")
        self.show_board_dynamic()
        if self.check_winner():
            print(f"Player {current_player} wins!")
        else:
            print("It's a draw!")

if __name__ == "__main__":
    game = GameBoard()
    game.play_game()


