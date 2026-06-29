import tkinter
import tkinter as tk
from tkinter import messagebox ,filedialog
from gameboard import GameBoard
from player import HumanPlayer, ComputerPlayer
import json
import random

class GameGUI:
        
    def __init__(self):
        self.mw = tkinter.Tk()
        self.mw.title("Connect 4")
        self.num_rows = tkinter.IntVar(value=6)  # Default value of the game grid
        self.num_cols = tkinter.IntVar(value=7)  # Default value of the game grid
        self.current_player_index = 0
        
        self.player1_colour = tkinter.StringVar()
        self.player2_colour = tkinter.StringVar()
        self.player1_type = tkinter.StringVar()
        self.player2_type = tkinter.StringVar()
        self.buttons_2d_list = []
        self.gboard = None
        self.players_lst = None
        
        
    def save_game(self, filename):
        # Function to save the game state to a text file
        game_state = {
            "num_rows": self.num_rows.get(),
            "num_cols": self.num_cols.get(),
            "player1_colour": self.player1_colour.get(),
            "player2_colour": self.player2_colour.get(),
            "player1_type": self.player1_type.get(),
            "player2_type": self.player2_type.get(),
            "current_player_index": self.current_player_index
        }
        with open(filename, 'w') as file:
            json.dump(game_state, file)

    def load_game(self, filename):
        # Function to load the game state from a text file
        with open(filename, 'r') as file:
            game_state = json.load(file)
        self.num_rows.set(game_state["num_rows"])
        self.num_cols.set(game_state["num_cols"])
        self.player1_colour.set(game_state["player1_colour"])
        self.player2_colour.set(game_state["player2_colour"])
        self.player1_type.set(game_state["player1_type"])
        self.player2_type.set(game_state["player2_type"])
        self.current_player_index = game_state["current_player_index"]
        
    def save_game_dialog(self):
        # Function to open a dialog for saving the game state
        filename = tkinter.filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text files", "*.txt")])
        if filename:
            self.save_game(filename)

    def load_game_dialog(self):
        # Function to open a dialog for loading the game state
        filename = tkinter.filedialog.askopenfilename(filetypes=[("Text files", "*.txt")])
        if filename:
            self.load_game(filename)
        
    def select_grid_size(self):
        #Frame for the window
        self.grid_and_colours_frame = tkinter.Frame(self.mw, bg="gray")
        self.grid_and_colours_frame.grid()

        label_rows = tkinter.Label(self.grid_and_colours_frame, text="Number of Rows:", font=("Arial", 15), bg="light gray")
        label_rows.grid(row=0, column=0, padx=10, pady=5)
        
        entry_rows = tkinter.Entry(self.grid_and_colours_frame, textvariable=self.num_rows, font=("Arial", 15), width = 5)
        entry_rows.grid(row=0, column=1, padx=10, pady=5)

        label_cols = tkinter.Label(self.grid_and_colours_frame, text="Number of Columns:", font=("Arial", 15), bg="light gray")
        label_cols.grid(row=1, column=0, padx=10, pady=5)
        
        entry_cols = tkinter.Entry(self.grid_and_colours_frame, textvariable=self.num_cols, font=("Arial", 15), width = 5)
        entry_cols.grid(row=1, column=1, padx=10, pady=5)

        next_button = tkinter.Button(self.grid_and_colours_frame, text="Next", font=("Arial", 16), bg="#5cb85c", fg="white", command=self.select_colours)
        next_button.grid(row=2, column=1, padx=20, pady=20)
        
        save_button = tkinter.Button(self.grid_and_colours_frame, text="Save Game", font=("Arial", 12), bg="#337ab7", fg="white", command=self.save_game_dialog)
        save_button.grid(row=6, column=0, padx=20, pady=10)
        
        # Create the "Load" button
        load_button = tkinter.Button(self.grid_and_colours_frame, text="Load Game", font=("Arial", 12), bg="#337ab7", fg="white", command=self.load_game_dialog)
        load_button.grid(row=7, column=0, padx=20, pady=10)
        
    def hide_frame(self):
        # Function to hide the grid and colours selection frame
        self.grid_and_colours_frame.grid_forget()
        
    def select_colours(self):
        # Function to select player colors
        self.hide_frame()  # Hide the grid and colours selection frame
        self.colour_frame = tkinter.Frame(self.mw, bg="gray")
        self.colour_frame.grid()
      
        label_player1 = tkinter.Label(self.colour_frame, text="Player 1 Colour:", font=("Arial", 15), bg="light gray")
        label_player1.grid(row=1, column=0, padx=10, pady=5)
        color_options = ["Red", "Green", "Blue", "Orange", "Purple"]
        self.player1_colour = tkinter.StringVar()
        
        player1_color_dropdown = tkinter.OptionMenu(self.colour_frame, self.player1_colour, *color_options)
        player1_color_dropdown.config(font=("Arial", 15), bg="light blue")
        player1_color_dropdown.grid(row=1, column=1, padx=0, pady=0)
        
        label_player2 = tkinter.Label(self.colour_frame, text="Player 2 Colour:", font=("Arial", 15), bg="light gray")
        label_player2.grid(row=2, column=0, padx=20, pady=20)
        self.player2_colour = tkinter.StringVar()
        
        player2_color_dropdown = tkinter.OptionMenu(self.colour_frame, self.player2_colour, *color_options)
        player2_color_dropdown.config(font=("Arial", 15), bg="light blue")
        player2_color_dropdown.grid(row=2, column=1, padx=10, pady=5)
        
        random_button = tkinter.Button(self.colour_frame, text="Choose Random Colors", font=("Arial", 12), bg="#337ab7", fg="white", command=self.select_random_colors)
        random_button.grid(row=4, column=1, padx=10, pady=5)
        
        # Create the "Save" button
        
        next_button = tkinter.Button(self.colour_frame, text="Next", font=("Arial", 16), bg="#5cb85c", fg="white", command=self.check_color_selection)
        next_button.grid(row=5, column=1, padx=20, pady=20)
        
        restart_button = tkinter.Button(self.colour_frame, text="Restart Game", font=("Arial", 12), bg="#d9534f", fg="white", command=self.restart_game)
        restart_button.grid(row=6, column=0, padx=20, pady=10)
        
        
        # the "Load" button
        load_button = tkinter.Button(self.colour_frame, text="Load Game", font=("Arial", 12), bg="#337ab7", fg="white", command=self.load_game_dialog)
        load_button.grid(row=8, column=0, padx=20, pady=10)
        
        save_button = tkinter.Button(self.colour_frame, text="Save Game", font=("Arial", 12), bg="#337ab7", fg="white", command=self.save_game_dialog)
        save_button.grid(row=7, column=0, padx=20, pady=10)
        

    def check_color_selection(self):
        # Function to check if both players have selected colors, display error if not, else proceed
        if not self.player1_colour.get() or not self.player2_colour.get():
            messagebox.showerror("Error", "Both players must select a color.")
        else:
            self.hide_colours()
            self.select_players()


    def hide_colours(self):
        # Function to hide the colour selection frame
        self.colour_frame.grid_forget()

    def select_random_colors(self):
        # Function to select random colors for players
        color_options = ["Red", "Green", "Blue", "Orange", "Purple"]
        random.shuffle(color_options)
        self.player1_colour.set(color_options[0])
        self.player2_colour.set(color_options[1])

    def select_players(self):
        # Function to select player types
        self.hide_colours()  # Hide the colour selection frame
        self.player_frame = tkinter.Frame(self.mw, bg="gray")
        self.player_frame.grid()
        
        label_players = tkinter.Label(self.player_frame, text="Select Players", font=("Arial", 15), bg="light gray")
        label_players.grid(row=0, column=1, padx=10, pady=5)
        
        label_player1 = tkinter.Label(self.player_frame, text="Player 1:", font=("Arial", 15), bg="light gray")
        label_player1.grid(row=1, column=0, padx=10, pady=5)
        
        label_player2 = tkinter.Label(self.player_frame, text="Player 2:", font=("Arial", 15), bg="light gray")
        label_player2.grid(row=2, column=0, padx=10, pady=5)
        
        player_options = ["Human", "Computer"]
        self.player1_type = tkinter.StringVar()
        self.player2_type = tkinter.StringVar()
        
        player1_type_dropdown = tkinter.OptionMenu(self.player_frame, self.player1_type, *player_options)
        player1_type_dropdown.config(font=("Arial", 15), bg="light blue")
        player1_type_dropdown.grid(row=1, column=1, padx=10, pady=10)
        
        player2_type_dropdown = tkinter.OptionMenu(self.player_frame, self.player2_type, *player_options)
        player2_type_dropdown.config(font=("Arial", 15), bg="light blue")
        player2_type_dropdown.grid(row=2, column=1, padx=10, pady=10)
        
        start_button = tkinter.Button(self.player_frame, text="Start Game", font=("Arial", 16), bg="#5cb85c", fg="white", command=self.start_game)
        start_button.grid(row=4, column=1, padx=20, pady=20)
        
        random_button = tkinter.Button(self.player_frame, text=" Random Modes", font=("Arial", 12), bg="#337ab7", fg="white", command=self.select_random_players)
        random_button.grid(row=3, column=1, padx=10, pady=5)
        
        restart_button = tkinter.Button(self.player_frame, text="Restart Game", font=("Arial", 12), bg="#d9534f", fg="white", command=self.restart_game)
        restart_button.grid(row=6, column=0, padx=20, pady=10)
        
        
    def select_random_players(self):
        # Function to select random colors for players
        player_options = ["Human", "Computer","Computer" ,"Human"]
        random.shuffle(player_options)
        self.player1_type.set(player_options[0])
        self.player2_type.set(player_options[1])
    def hide_players(self):
        # Function to hide the player selection frame
        self.player_frame.grid_forget()

    

    def create_player(self, player_type, symbol, gboard, colour=None):
        # Function to create player objects based on the selected type
        if player_type == "Human":
            return HumanPlayer(symbol, gboard, colour)
        elif player_type == "Computer":
            return ComputerPlayer(symbol, gboard, colour, self.buttons_2d_list)
            

    def clicked_btn(self, x, y):
    # Function to handle button click events
        p = self.players_lst[self.current_player_index]
        button = self.buttons_2d_list[x][y]

        if button["text"] == " ":
            self.gboard.make_move(y, p.get_player_symbol())
            self.update_button_text(y, p.get_player_symbol())

            winner = self.gboard.check_winner()

            if winner:
                winner_number = 1 if p.get_player_symbol() == "X" else 2
                winner_color = self.player1_colour.get() if p.get_player_symbol() == "X" else self.player2_colour.get()
                win_message = f"Player {winner_number} ({winner_color}) is the Winner!"
                messagebox.showinfo("Winner Info", win_message)
                self.mw.destroy()
                exit()


            if self.gboard.is_board_full():
                messagebox.showinfo("Game Over", "It's a draw! The board is full.")
                self.mw.destroy()
                exit()

            self.current_player_index += 1
            if self.current_player_index >= len(self.players_lst):
                self.current_player_index = 0

            p = self.players_lst[self.current_player_index]
            if isinstance(p, ComputerPlayer):
                self.mw.after(1000, p.play)
                
           
    def update_button_text(self, col, element):
    # Function to update the text and color of the clicked button
        for row in range(len(self.buttons_2d_list) - 1, -1, -1):
            if self.buttons_2d_list[row][col]["text"] == " ":
                # Create a colored disc instead of text
                disc_color = self.player1_colour.get() if element == "X" else self.player2_colour.get()
                self.buttons_2d_list[row][col].config(text="", bg=disc_color)
                break
            
    def start_game(self):
        #get numbers of rows selected by players
        num_rows = self.num_rows.get()
        num_cols = self.num_cols.get()
        # Function to start the game
        
        player1_type = self.player1_type.get()
        player2_type = self.player2_type.get()
       
        if not player1_type or not player2_type:
            messagebox.showerror("Error", "Both players must select a type.")
        
            return
        
        self.gboard = GameBoard(num_rows, num_cols)  # Initialize the game board with selected size
        p1 = self.create_player(player1_type, "X", self.gboard, self.player1_colour.get())
        p2 = self.create_player(player2_type, "O", self.gboard, self.player2_colour.get())
        self.players_lst = (p1, p2)
        
        self.hide_colours()
        self.hide_players()
        self.__initialise_game()
    
    def __initialise_game(self):
        # Function to initialize the gameboard grid within a frame
        self.mw.configure(bg="gray")
        self.winner = False

        # Create a frame for the gameboard grid
        self.gameboard_frame = tkinter.Frame(self.mw, bg="gray")
        self.gameboard_frame.grid(row=2, column=0, padx=10, pady=10)
        
        # Create a frame for the gameboard grid
        self.colour_frame = tkinter.Frame(self.mw, bg="gray")
        self.colour_frame.grid(row=1, column=0, padx=10, pady=10)
        
        # Create labels to display the chosen colors of players
        player1_colour_label = tkinter.Label(self.colour_frame, text="Player 1 Colour: ", font=("Arial", 12), bg="gray")
        player1_colour_label.grid(row=0, column=0, padx=10, pady=5)
        player1_colour_indicator = tkinter.Label(self.colour_frame, text="", bg=self.player1_colour.get(), width=5)
        player1_colour_indicator.grid(row=0, column=1, padx=5, pady=5)

        player2_colour_label = tkinter.Label(self.colour_frame, text="Player 2 Colour: ", font=("Arial", 12), bg="gray")
        player2_colour_label.grid(row=1, column=0, padx=10, pady=5)
        player2_colour_indicator = tkinter.Label(self.colour_frame, text="", bg=self.player2_colour.get(), width=5)
        player2_colour_indicator.grid(row=1, column=1, padx=5, pady=5)
        
        #player 1 mode
        player1_label = tkinter.Label(self.colour_frame, text= "Mode : " + self.player1_type.get(), font=("Arial", 12), bg="gray")
        player1_label.grid(row=0, column=3, padx=10, pady=5)
        
        #player 2 mode
        player2_label = tkinter.Label(self.colour_frame, text= "Mode : " + self.player2_type.get(), font=("Arial", 12), bg="gray")
        player2_label.grid(row=1, column=3, padx=10, pady=5)
        

        

        # Create buttons for the gameboard grid
        for i in range(self.gboard.get_num_rows()):
            row = []
            for j in range(self.gboard.get_num_cols()):
                
                button = tkinter.Button(self.gameboard_frame, text=" ",bg="light gray",relief=tk.RIDGE, width=6, height=3,
                                            padx=2, pady=2,
                                            command=lambda x=i, y=j: self.clicked_btn(x, y))
                button.grid(row=i, column=j, padx=2, pady=2)
                row.append(button)
            self.buttons_2d_list.append(row)

        # Create a separate frame for the restart button
        self.restart_frame = tkinter.Frame(self.mw, bg="gray")
        self.restart_frame.grid(row=3, column=0, padx=10, pady=10)
        
        # Show the restart button
        restart_button = tkinter.Button(self.restart_frame, text="Restart Game", font=("Arial", 12), bg="#d9534f", fg="white", command=self.restart_game)
        restart_button.grid(row=0, column=0, padx=20, pady=10)
        
      # Create a separate frame for the save button
        self.save_frame = tkinter.Frame(self.mw, bg="gray")
        self.save_frame.grid(row=4, column=0, padx=10, pady=10)
        
        save_button = tkinter.Button(self.save_frame, text="Save Game", font=("Arial", 12), bg="#337ab7", fg="white", command=self.save_game_dialog)
        save_button.grid(row=0, column=0, padx=10, pady=10)
        
        load_button = tkinter.Button(self.save_frame, text="Load Game", font=("Arial", 12), bg="#337ab7", fg="white", command=self.load_game_dialog)
        load_button.grid(row=1, column=0, padx=10, pady=10)
        # Create the "Load" button
        
       
        

        current_player = self.players_lst[self.current_player_index]
        if isinstance(current_player, ComputerPlayer):
            current_player.play()

    def restart_game(self):
        # Function to restart the game
        self.mw.destroy()
        self.__init__()
        self.select_grid_size()

    def initialise(self):
        # Function to start the GUI application
        
        self.select_grid_size()
        
        self.mw.mainloop()

def main():
    # Main function to start the game
    print("Welcome to Connect4!")
    while True:
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
