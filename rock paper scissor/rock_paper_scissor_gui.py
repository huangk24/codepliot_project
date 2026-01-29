"""Simple Rock-Paper-Scissor GUI using Tkinter.

Run this with:
    python3 rock_paper_scissor_gui.py

Buttons: Rock, Paper, Scissor. Score and last result are shown.
Keyboard shortcuts: r, p, s  (works when window is focused)
"""

import random
try:
    import tkinter as tk
    from tkinter import ttk
except ModuleNotFoundError:
    # Graceful fallback when Tkinter isn't available on the system (common on some Python builds)
    msg = (
        "Tkinter is not available in this Python installation (ModuleNotFoundError: _tkinter).\n"
        "A few options to fix this on macOS:\n"
        "  1) Install Python from python.org (includes Tcl/Tk support).\n"
        "  2) Use a conda/miniconda environment and `conda install tk`.\n"
        "  3) Install Homebrew's tcl-tk and use a Python build linked against it (advanced).\n"
        "Falling back to the console version of the game now.\n"
    )
    print(msg)
    # Run the console fallback if available
    try:
        from rock_paper_scissor import rock_paper_scissor
        rock_paper_scissor()
    except Exception as ex:
        print("Console fallback failed:", ex)
    raise SystemExit(0)


class RPSApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Rock Paper Scissor")
        self.resizable(False, False)

        self.choices = ["rock", "paper", "scissor"]
        self.mapping = {"r": "rock", "p": "paper", "s": "scissor", "scissors": "scissor"}

        self.player_score = 0
        self.computer_score = 0
        self.tie_count = 0

        self._build_ui()
        self.bind_events()

    def _build_ui(self):
        pad = 8
        main = ttk.Frame(self, padding=pad)
        main.grid(row=0, column=0)

        # Detailed scoreboard labels: Player wins / Ties / Computer wins
        score_frame = ttk.Frame(main)
        score_frame.grid(row=0, column=0, columnspan=3, pady=(0, pad))

        self.player_wins_label = ttk.Label(score_frame, text=f"Player: {self.player_score}", font=(None, 11))
        self.ties_label = ttk.Label(score_frame, text=f"Ties: {self.tie_count}", font=(None, 11))
        self.computer_wins_label = ttk.Label(score_frame, text=f"Computer: {self.computer_score}", font=(None, 11))

        self.player_wins_label.grid(row=0, column=0, padx=8)
        self.ties_label.grid(row=0, column=1, padx=8)
        self.computer_wins_label.grid(row=0, column=2, padx=8)

        # Result and computer choice
        self.result_label = ttk.Label(main, text="Make your move!", font=(None, 11))
        self.result_label.grid(row=1, column=0, columnspan=3, pady=(0, pad))

        # Buttons
        rock_btn = ttk.Button(main, text="Rock", command=lambda: self.play("rock"))
        paper_btn = ttk.Button(main, text="Paper", command=lambda: self.play("paper"))
        scissor_btn = ttk.Button(main, text="Scissor", command=lambda: self.play("scissor"))

        rock_btn.grid(row=2, column=0, padx=4)
        paper_btn.grid(row=2, column=1, padx=4)
        scissor_btn.grid(row=2, column=2, padx=4)

        # Quit button
        quit_btn = ttk.Button(main, text="Quit", command=self.destroy)
        quit_btn.grid(row=3, column=0, columnspan=3, pady=(pad, 0))

    def bind_events(self):
        # Bind r/p/s keys to play
        for key in ("r", "p", "s"):
            self.bind(f"<{key}>", self._on_key)

    def _on_key(self, event):
        key = event.keysym.lower()
        move = self.mapping.get(key)
        if move:
            self.play(move)

    def _score_text(self):
        return f"You: {self.player_score}    Computer: {self.computer_score}"

    def play(self, player_choice):
        # Normalize choice (accept "scissors" too)
        player_choice = self.mapping.get(player_choice, player_choice)
        computer_choice = random.choice(self.choices)

        # Determine result
        if player_choice == computer_choice:
            result = "It's a tie!"
        elif (player_choice == 'rock' and computer_choice == 'scissor') or \
             (player_choice == 'paper' and computer_choice == 'rock') or \
             (player_choice == 'scissor' and computer_choice == 'paper'):
            result = "You win!"
            self.player_score += 1
        else:
            result = "Computer wins!"
            self.computer_score += 1

        # Update counts and UI
        if result == "It's a tie!":
            self.tie_count += 1
        # update labels
        self.player_wins_label.config(text=f"Player: {self.player_score}")
        self.ties_label.config(text=f"Ties: {self.tie_count}")
        self.computer_wins_label.config(text=f"Computer: {self.computer_score}")
        self.result_label.config(text=f"You: {player_choice} — Computer: {computer_choice}. {result}")


if __name__ == '__main__':
    app = RPSApp()
    app.mainloop()
